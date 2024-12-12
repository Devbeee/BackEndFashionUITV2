import { Injectable } from '@nestjs/common';

import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ErrorCode, Role } from '@/common/enums';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { SetDefaultAddressDto } from '@/modules/user/dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const data = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.accounts', 'accounts')
      .select([
        'user.id AS id',
        'user.name AS name',
        'user.email AS email',
        'user.isAuthenticated AS isAuthenticated',
        'user.deletedAt AS deleted',
        'COUNT(DISTINCT accounts.id) AS accountsCount',
      ])
      .where('user.role = :role', { role: Role.User })
      .withDeleted()
      .groupBy('user.id')
      .orderBy('user.createdAt', 'DESC')
      .offset(skip)
      .limit(limit)
      .getRawMany();

    const totalCount = await this.userRepository
      .createQueryBuilder('user')
      .where('user.role = :role', { role: Role.User })
      .getCount();

    return {
      listUsers: data,
      totalItems: totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    };
  }
  async updateProfile(profileData: UpdateUserDto) {
    const existedUser = await this.userRepository.findOne({
      where: { email: profileData.email },
    });
    if (!existedUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    } else {
      if (!existedUser.isVerified) {
        throw new Error(ErrorCode.EMAIL_NO_AUTHENTICATED);
      }
      existedUser.fullName = profileData.fullName;
      existedUser.avatar = profileData.avatar;
      existedUser.phoneNumber = profileData.phoneNumber;
      await this.userRepository.save(existedUser);
      const { id, fullName, role, email, avatar, phoneNumber } = existedUser;
      return {
        id,
        fullName,
        role,
        email,
        avatar,
        phoneNumber,
      };
    }
  }
  async findById(userId: string) {
    return await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'fullName', 'email', 'avatar', 'role', 'phoneNumber'],
    });
  }

  async deactivateUser(userId: string) {
    const existedUser = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!existedUser) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    } else {
      await this.userRepository.softRemove(existedUser);
      return existedUser.deletedAt;
    }
  }

  async activeUser(userId: string) {
    await this.userRepository.restore({ id: userId });
  }

  async getDefaultAddress(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['defaultAddress'],
      select: {
        defaultAddress: {
          id: true,
          name: true,
          province: true,
          district: true,
          ward: true,
          phoneNumber: true,
          addressDetail: true,
          longitude: true,
          latitude: true,
        },
      },
    });
    if (!user || !user.defaultAddress) {
      return null;
    }
    return user.defaultAddress;
  }

  async setDefaultAddress(
    setDefaultAddressDto: SetDefaultAddressDto,
    userId: string,
  ) {
    try {
      return await this.userRepository.update(
        { id: userId },
        { defaultAddress: { id: setDefaultAddressDto.addressId } },
      );
    } catch (error) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }
  }
}
