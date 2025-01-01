import * as bcrypt from 'bcryptjs';

import { LRUCache } from 'lru-cache';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { MailerService } from '@nestjs-modules/mailer';

import { ErrorCode } from '@/common/enums';

import { User } from '@/modules/user/entities/user.entity';

import {
  CreateUserDto,
  ConfirmEmailDto,
  LoginUserDto,
  ForgotPasswordDto,
  ChangePasswordDto,
} from '@/modules/user/dtos';

import { VerifyOtpDto } from './dtos/verity-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private readonly cache: LRUCache<string, string>,
  ) {}

  async register(userData: CreateUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: { email: userData.email },
      withDeleted: true,
    });

    if (existedUser) {
      throw new Error(ErrorCode.EMAIL_ALREADY_REGISTERED);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = this.userRepository.create({
      fullName: userData.fullName,
      email: userData.email,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    const verifyEmailUrl = `${this.configService.get<string>('WEB_CLIENT_URL')}/verify-email/${savedUser.id}`;

    await this.mailerService.sendMail({
      to: savedUser.email,
      from: '<No reply>',
      subject: 'Verify email',
      template: 'verification_email',
      context: {
        fullName: savedUser.fullName,
        url: verifyEmailUrl,
      },
    });
  }

  async verifyEmail(confirmData: ConfirmEmailDto) {
    const existedUser = await this.userRepository.findOne({
      where: { id: confirmData.userId },
    });
    if (existedUser && !existedUser.isVerified) {
      existedUser.isVerified = true;
      await this.userRepository.save(existedUser);
    } else {
      throw new Error(ErrorCode.INVALID_LINK_EMAIL_VERIFICATION);
    }
  }

  async login(userData: LoginUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: { email: userData.email },
      withDeleted: true,
    });
    if (!existedUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    } else {
      if (!existedUser.isVerified) {
        throw new Error(ErrorCode.EMAIL_NO_AUTHENTICATED);
      } else if (existedUser.deletedAt) {
        throw new Error(ErrorCode.EMAIL_DEACTIVATED);
      }
      const isCorrectPassword = bcrypt.compareSync(
        userData.password,
        existedUser.password,
      );
      if (!isCorrectPassword) {
        throw new Error(ErrorCode.INCORRECT_PASSWORD);
      }
      const [accessTokenResult, refreshTokenResult] = await Promise.allSettled([
        this.generateToken(existedUser, process.env.ACCESS_TOKEN_EXPIRATION),
        this.generateToken(existedUser, process.env.REFRESH_TOKEN_EXPIRATION),
      ]);

      if (
        accessTokenResult.status === 'rejected' ||
        refreshTokenResult.status === 'rejected'
      ) {
        throw new Error('Error generating tokens');
      }
      const { id, fullName, role, email, avatar, phoneNumber } = existedUser;

      return {
        accessToken: accessTokenResult.value,
        refreshToken: refreshTokenResult.value,
        currentUser: {
          id,
          fullName,
          role,
          email,
          avatar,
          phoneNumber,
        },
      };
    }
  }

  async forgotPassword(forgotPasswordData: ForgotPasswordDto) {
    const existedUser = await this.userRepository.findOne({
      where: { email: forgotPasswordData.email },
    });

    if (!existedUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }

    if (!existedUser.isVerified) {
      throw new Error(ErrorCode.EMAIL_NO_AUTHENTICATED);
    }
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    this.cache.set(`otp:${forgotPasswordData.email}`, verificationToken);

    await this.mailerService.sendMail({
      to: forgotPasswordData.email,
      from: 'Anh bao',
      subject: 'Forgot password',
      template: 'password_reset_request',
      context: {
        verificationToken,
      },
    });
  }

  async verifyOTP(verifyOtpData: VerifyOtpDto) {
    const storedOTP = this.cache.get(`otp:${verifyOtpData.email}`);
    if (!storedOTP || storedOTP !== verifyOtpData.otp) {
      throw new Error(ErrorCode.OTP_INVALID);
    }
  }

  async resetPassword(userData: LoginUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existedUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }

    if (!existedUser.isVerified) {
      throw new Error(ErrorCode.EMAIL_NO_AUTHENTICATED);
    }
    const storedOTP = this.cache.get(`otp:${userData.email}`);

    if (!storedOTP) {
      throw new Error(ErrorCode.OTP_INVALID);
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    existedUser.password = hashedPassword;

    this.cache.delete(`otp:${userData.email}`);
    return await this.userRepository.save(existedUser);
  }

  async changePassword(userId: string, changePasswordData: ChangePasswordDto) {
    const existedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!existedUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    } else {
      if (!existedUser.isVerified) {
        throw new Error(ErrorCode.EMAIL_NO_AUTHENTICATED);
      }
      const isCorrectPassword = bcrypt.compareSync(
        changePasswordData.currentPassword,
        existedUser.password,
      );
      if (!isCorrectPassword) {
        throw new Error(ErrorCode.INCORRECT_PASSWORD);
      }
      const hashedNewPassword = await bcrypt.hash(
        changePasswordData.newPassword,
        10,
      );
      existedUser.password = hashedNewPassword;
      await this.userRepository.save(existedUser);
    }
  }

  async verifyToken(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });
  }

  async reFreshToken(email: string) {
    const existedUser = await this.userRepository.findOne({
      where: { email },
    });
    if (!existedUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }

    const [accessTokenResult, refreshTokenResult] = await Promise.allSettled([
      this.generateToken(existedUser, '1h'),
      this.generateToken(existedUser, '1d'),
    ]);

    if (
      accessTokenResult.status === 'rejected' ||
      refreshTokenResult.status === 'rejected'
    ) {
      throw new Error('Error generating tokens');
    }

    return {
      accessToken: accessTokenResult.value,
      refreshToken: refreshTokenResult.value,
    };
  }

  async generateToken(user: User, expiresIn: string | number): Promise<string> {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn,
    });
  }
}
