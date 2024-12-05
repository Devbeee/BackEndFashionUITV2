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
  Req,
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

@ApiTags('Address')
@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(AuthGuard)
  @Post('')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Address has been successfully added.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async addAddress(
    @Body() addAddressDto: AddAddressDto,
    @Req() request: Request,
  ) {
    try {
      const { id } = request['user'];
      await this.addressService.addAddress(addAddressDto, id);
      return handleDataResponse('Address added successfully!');
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard)
  @Get('')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Addresses have been successfully fetched.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async getAddress(@Req() request: Request) {
    try {
      const { id } = request['user'];
      return await this.addressService.getAddress(id);
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard)
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
    try {
      await this.addressService.updateAddress(updateAddressDto);
      return handleDataResponse('Address updated successfully!');
    } catch (error) {
      throw error;
    }
  }

  @UseGuards(AuthGuard)
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
    @Req() request: Request,
  ) {
    try {
      const { id } = request['user'];
      await this.addressService.deleteAddress(deleteAddressDto, id);
      return handleDataResponse('Address updated successfully!');
    } catch (error) {
      throw error;
    }
  }
}
