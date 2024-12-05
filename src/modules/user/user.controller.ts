import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { ErrorCode, Role } from '@/common/enums';

import { Roles } from '@/modules/auth/roles.decorator';

import { RolesGuard } from '@/modules/auth/roles.guard';
import { AuthGuard } from '@/modules/auth/auth.guard';

import { currentUser } from './user.decorator';
import { UsersService } from './user.service';

import { User } from './entities/user.entity';

import { UpdateUserDto } from './dtos/update-user.dto';
import { handleDataResponse } from '@/utils';
import { SetDefaultAddressDto } from '@/modules/user/dtos';

@ApiTags('Users')
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('')
  @Roles(Role.Admin)
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      const currentPage = Math.max(Number(page), 1);
      const pageSize = Math.max(Number(limit), 1);

      const dataUsers = await this.usersService.getUsers(currentPage, pageSize);
      return dataUsers;
    } catch (error) {
      throw error;
    }
  }

  @Patch('update-profile')
  @Roles(Role.Admin, Role.User)
  async updateProfile(@Body() profileData: UpdateUserDto) {
    try {
      return await this.usersService.updateProfile(profileData);
    } catch (error) {
      if (error.message === ErrorCode.USER_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
      } else if (error.message === ErrorCode.MISSING_INPUT) {
        throw new BadRequestException(ErrorCode.MISSING_INPUT);
      } else {
        throw error;
      }
    }
  }

  @Delete('deactivate/:userId')
  @Roles(Role.Admin)
  async deactivateUser(@Param('userId') userId: string) {
    try {
      return await this.usersService.deactivateUser(userId);
    } catch (error) {
      if (error.message === ErrorCode.USER_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.USER_NOT_FOUND);
      } else if (error.message === ErrorCode.MISSING_INPUT) {
        throw new BadRequestException(ErrorCode.MISSING_INPUT);
      } else {
        throw error;
      }
    }
  }

  @Patch('active/:userId')
  @Roles(Role.Admin)
  @ApiBadRequestResponse({ description: 'Missing input!' })
  @ApiOkResponse({ description: 'Restore workspace ok' })
  async restoreWorkspace(@Param('userId') userId: string) {
    try {
      return await this.usersService.activeUser(userId);
    } catch (error) {
      throw error;
    }
  }

  @Get('/currentUser')
  @Roles(Role.Admin, Role.User)
  async me(@currentUser() user: User) {
    const userInfo = await this.usersService.findById(user.id);
    return userInfo;
  }

  @UseGuards(AuthGuard)
  @Get('/default-address')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Default address have been successfully fetched.',
  })
  async getDefaultAddress(@Req() request: Request) {
    try {
      const { id } = request['user'];
      return await this.usersService.getDefaultAddress(id);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/default-address/:addressId')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Default address have been successfully fetched.',
  })
  async setDefaultAddress(
    @Param() setDefaultAddressDto: SetDefaultAddressDto,
    @Req() request: Request,
  ) {
    try {
      const { id } = request['user'];
      return await this.usersService.setDefaultAddress(
        setDefaultAddressDto,
        id,
      );
    } catch (error) {
      throw error;
    }
  }
}
