import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Req,
  UseGuards,
  Patch,
  ForbiddenException,
  HttpCode,
  Delete,
} from '@nestjs/common';

import { Response } from 'express';

import { ErrorCode, Role } from '@/common/enums';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { handleDataResponse } from '@/utils';

import { AuthService } from '@/modules/auth/auth.service';

import {
  CreateUserDto,
  LoginUserDto,
  ConfirmEmailDto,
  ForgotPasswordDto,
  ChangePasswordDto,
} from '@/modules/user/dtos';

import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';

import { VerifyOtpDto } from './dtos/verity-otp.dto';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'The user has been successfully registered.',
  })
  @ApiConflictResponse({ description: 'Email is already registered!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async register(@Body() userData: CreateUserDto) {
    try {
      await this.authService.register(userData);
      return handleDataResponse(
        'Register successfully! Check and confirm your email',
      );
    } catch (error) {
      if (error.message === ErrorCode.EMAIL_ALREADY_REGISTERED) {
        throw new ConflictException(ErrorCode.EMAIL_ALREADY_REGISTERED);
      } else {
        throw error;
      }
    }
  }

  @Post('verify-email')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Verify email successfully!!.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async verifyEmail(@Body() confirmData: ConfirmEmailDto) {
    try {
      await this.authService.verifyEmail(confirmData);
      return handleDataResponse('Verify email successfully!!');
    } catch (error) {
      if (error.message === ErrorCode.EMAIL_ALREADY_REGISTERED) {
        throw new BadRequestException(ErrorCode.EMAIL_ALREADY_REGISTERED);
      } else {
        throw error;
      }
    }
  }

  @Post('login')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Login successfully!!',
  })
  @ApiConflictResponse({ description: 'Email has not been confirmed!' })
  @ApiBadRequestResponse({ description: 'Incorrect password!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async login(
    @Body() userData: LoginUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    try {
      const resultData = await this.authService.login(userData);
      response
        .cookie('access_token', resultData.accessToken, {
          path: '/',
          expires: new Date(Date.now() + +process.env.COOKIE_EXPIRE_TIME),
          httpOnly: true,
          sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
          secure: process.env.NODE_ENV !== 'development',
        })
        .status(HttpStatus.OK)
        .json({
          ...handleDataResponse('Login successfully!'),
          currentUser: { ...resultData.currentUser },
        });
    } catch (error) {
      if (error.message === ErrorCode.EMAIL_NO_AUTHENTICATED) {
        throw new ConflictException(ErrorCode.EMAIL_NO_AUTHENTICATED);
      } else if (error.message === ErrorCode.INCORRECT_PASSWORD) {
        throw new BadRequestException(ErrorCode.INCORRECT_PASSWORD);
      } else {
        throw error;
      }
    }
  }

  @Delete('logout')
  @HttpCode(204)
  async logout(@Res({ passthrough: true }) response: Response) {
    try {
      response.clearCookie('access_token', {
        path: '/',
        httpOnly: true,
        sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
        secure: process.env.NODE_ENV !== 'development',
      });
      return handleDataResponse('Logout successfully');
    } catch (error) {
      throw error;
    }
  }

  @Post('forgot-password')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Please check your email to confirm forget' })
  @ApiNotFoundResponse({ description: 'Email is not registered!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async forgotPassword(@Body() forgotPasswordData: ForgotPasswordDto) {
    try {
      await this.authService.forgotPassword(forgotPasswordData);
      return handleDataResponse(
        'Please check your email to confirm forget',
        'OK',
      );
    } catch (error) {
      if (error.message === ErrorCode.USER_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
      } else {
        throw error;
      }
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Patch('change-password')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Change password successfully!!',
  })
  @ApiBadRequestResponse({ description: 'Incorrect current password!' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiConflictResponse({ description: 'Email has not been confirmed!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async changePassword(
    @Body() changePasswordData: ChangePasswordDto,
    @Req() request: Request,
  ) {
    try {
      const user = request['user'];
      await this.authService.changePassword(user.id, changePasswordData);
      return handleDataResponse('Change password successfully', 'OK');
    } catch (error) {
      if (error.message === ErrorCode.USER_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
      } else if (error.message === ErrorCode.EMAIL_NO_AUTHENTICATED) {
        throw new ConflictException(ErrorCode.EMAIL_NO_AUTHENTICATED);
      } else if (error.message === ErrorCode.INCORRECT_PASSWORD) {
        throw new BadRequestException(ErrorCode.INCORRECT_PASSWORD);
      } else if (error.message === ErrorCode.EMAIL_DEACTIVATED) {
        throw new ForbiddenException(ErrorCode.EMAIL_DEACTIVATED);
      } else {
        throw error;
      }
    }
  }

  @Post('verify-otp')
  @HttpCode(200)
  @ApiOkResponse({ description: 'OTP is verified' })
  @ApiBadRequestResponse({ description: 'OTP is expired or invalid!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async verifyOTP(@Body() otpData: VerifyOtpDto) {
    try {
      await this.authService.verifyOTP(otpData);
      return handleDataResponse('OTP is verified', 'OK');
    } catch (error) {
      if (error.message === ErrorCode.OTP_INVALID) {
        throw new BadRequestException(ErrorCode.OTP_INVALID);
      } else {
        throw error;
      }
    }
  }

  @Post('reset-password')
  @HttpCode(200)
  @ApiConflictResponse({ description: 'Email has not been confirmed!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async resetPassword(@Body() userData: LoginUserDto) {
    try {
      await this.authService.resetPassword(userData);
      return handleDataResponse('Reset password successfully', 'OK');
    } catch (error) {
      if (error.message === ErrorCode.EMAIL_NO_AUTHENTICATED) {
        throw new ConflictException(ErrorCode.EMAIL_NO_AUTHENTICATED);
      } else {
        throw error;
      }
    }
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiUnauthorizedResponse({ description: 'Refresh token is invalid' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    try {
      const user = await this.authService.verifyToken(refreshToken);
      const resultTokens = await this.authService.reFreshToken(user.email);
      return resultTokens;
    } catch (error) {
      throw error;
    }
  }
}
