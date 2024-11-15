import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req
} from '@nestjs/common';

import { Role } from '@/common/enums';
import { handleDataResponse } from '@/utils';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { Roles } from '@/modules/auth/roles.decorator';

import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  @Roles(Role.User)
  async create(@Body() createCartDto: CreateCartDto, @Req() request: Request) {
    try {
      const { id } = request['user'];
      await this.cartService.create(id, createCartDto);
      return handleDataResponse(
        'Add to cart successfully!'
      )
    }
    catch (error) {
      throw new Error(error)
    }
  }

  @Get()
  @Roles(Role.User)
  async findByUserId(@Req() request: Request) {
    try {
      const { id } = request['user'];
      return this.cartService.findByUserId(id);
    }
    catch (error) {
      throw new Error(error)
    }
  }

  @Patch(':id')
  @Roles(Role.User)
  async update(@Param('id') cartProductId: string, @Body() updateCartDto: UpdateCartDto, @Req() request: Request) {
    try {
      const { id } = request['user'];
      await this.cartService.update(cartProductId, updateCartDto, id);
      return handleDataResponse(
        'Cart quantity updated successfully.'
      )
    }
    catch (error) {
      throw new Error(error)
    }
  }

  @Delete('delete/:id')
  @Roles(Role.User)
  async remove(@Param('id') cartProductId: string, @Req() request: Request) {
    try {
      const { id } = request['user'];
      return await this.cartService.remove(cartProductId, id);
    }
    catch (error) {
      throw new Error(error)
    }
  }

  @Delete('bulk-delete')
  @Roles(Role.User)
  async removeMultiple(@Body('ids') cartProductIds: string[], @Req() request: Request) {
    try {
      const { id } = request['user'];
      return await this.cartService.removeMultiple(cartProductIds, id);
    }
    catch (error) {
      throw new Error(error)
    }
  }
}
