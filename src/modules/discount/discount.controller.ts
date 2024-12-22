import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { RolesGuard } from '@/modules/auth/roles.guard';

import { Role } from '@/common/enums';

import { Roles } from '@/modules/auth/roles.decorator';

import { handleDataResponse } from '@/utils';

import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@ApiTags('Discount')
@Controller('discount')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new discount' })
  @ApiBody({ type: CreateDiscountDto })
  @ApiResponse({ status: 201, description: 'Discount created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    try {
      return this.discountService.create(createDiscountDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all discounts' })
  @ApiResponse({
    status: 200,
    description: 'List of discounts returned successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async findAll() {
    try {
      return this.discountService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a discount by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the discount to update',
  })
  @ApiBody({ type: UpdateDiscountDto })
  @ApiResponse({ status: 200, description: 'Discount updated successfully.' })
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    try {
      await this.discountService.update(id, updateDiscountDto);
      return handleDataResponse('Discount item updated successfully.');
    } catch (error) {
      throw error;
    }
  }

  @Delete('delete/:id')
  @ApiOperation({ summary: 'Delete a discount by ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the discount to delete',
  })
  @ApiResponse({ status: 200, description: 'Discount deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Discount not found.' })
  async remove(@Param('id') id: string) {
    try {
      await this.discountService.remove(id);
      return handleDataResponse('Delete discount item successfully.');
    } catch (error) {
      throw error;
    }
  }

  @Delete('bulk-delete')
  @ApiOperation({ summary: 'Delete multiple discounts by IDs' })
  @ApiBody({
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Multiple discounts deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async removeMultiple(@Body() ids: string[]) {
    try {
      await this.discountService.removeMultiple(ids);
      return handleDataResponse('Delete multiple discount items successfully.');
    } catch (error) {
      throw error;
    }
  }
}
