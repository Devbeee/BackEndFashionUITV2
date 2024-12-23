import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';

import {
  AddAddressDto,
  DeleteAddressDto,
  UpdateAddressDto,
} from '@/modules/address/dtos';

import { handleDataResponse } from '@/utils';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { AddressService } from './address.service';
import { currentUser } from '@/modules/user/user.decorator';
import { User } from '@/modules/user/entities/user.entity';

@UseGuards(AuthGuard)
@ApiTags('Address')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post('')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Address has been successfully added.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async addAddress(
    @Body() addAddressDto: AddAddressDto,
    @currentUser() user: User,
  ) {
    await this.addressService.addAddress(addAddressDto, user);
    return handleDataResponse('Address added successfully!');
  }

  @Get('')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Addresses have been successfully fetched.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async getAddress(@currentUser() user: User) {
    return await this.addressService.getAddress(user);
  }

  @Put('')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Address have been successfully updated.',
  })
  @ApiNotFoundResponse({
    description: 'Address not found.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async updateAddress(@Body() updateAddressDto: UpdateAddressDto) {
    await this.addressService.updateAddress(updateAddressDto);
    return handleDataResponse('Address updated successfully!');
  }

  @Delete('/:id')
  @HttpCode(204)
  @ApiNoContentResponse({
    description: 'Address has been successfully deleted.',
  })
  @ApiNotFoundResponse({
    description: 'Address not found.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async deleteAddress(
    @Param() deleteAddressDto: DeleteAddressDto,
    @currentUser() user: User,
  ) {
    await this.addressService.deleteAddress(deleteAddressDto, user);
    return handleDataResponse('Address updated successfully!');
  }
}
