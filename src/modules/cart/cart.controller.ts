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

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';

import { Role } from '@/common/enums';
import { handleDataResponse } from '@/utils';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { Roles } from '@/modules/auth/roles.decorator';

import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  @Roles(Role.User)
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiResponse({ status: 201, description: 'Add to cart successfully!' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ description: 'Data to create cart item', type: CreateCartDto })
  async create(@Body() createCartDto: CreateCartDto, @Req() request: Request) {
    try {
      const { id } = request['user'];
      await this.cartService.create(id, createCartDto);
      return handleDataResponse(
        'Add to cart successfully!'
      );
    }
    catch (error) {
      throw new Error(error);
    }
  }

  @Get()
  @Roles(Role.User)
  @ApiOperation({ summary: 'Get cart items by user ID' })
  @ApiResponse({ status: 200, description: 'Cart retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Cart not found' })
  async findByUserId(@Req() request: Request) {
    try {
      const { id } = request['user'];
      return this.cartService.findByUserId(id);
    }
    catch (error) {
      throw new Error(error);
    }
  }

  @Patch(':id')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart quantity updated successfully.' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiParam({ name: 'id', description: 'Cart product ID' })
  @ApiBody({ description: 'Data to update cart item', type: UpdateCartDto })
  async update(@Param('id') cartProductId: string, @Body() updateCartDto: UpdateCartDto, @Req() request: Request) {
    try {
      const { id } = request['user'];
      await this.cartService.update(cartProductId, updateCartDto, id);
      return handleDataResponse(
        'Cart quantity updated successfully.'
      );
    }
    catch (error) {
      throw new Error(error);
    }
  }

  @Delete('delete/:id')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Delete a single cart item' })
  @ApiResponse({ status: 200, description: 'Delete cart item successfully.' })
  @ApiResponse({ status: 404, description: 'Cart item not found' })
  @ApiParam({ name: 'id', description: 'Cart product ID' })
  async remove(@Param('id') cartProductId: string, @Req() request: Request) {
    try {
      const { id } = request['user'];
      await this.cartService.remove(cartProductId, id);
      return handleDataResponse(
        'Delete cart item successfully.'
      );
    }
    catch (error) {
      throw new Error(error);
    }
  }

  @Delete('bulk-delete')
  @Roles(Role.User)
  @ApiOperation({ summary: 'Delete multiple cart items' })
  @ApiResponse({ status: 200, description: 'Delete multiple cart items successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiBody({ description: 'Array of cart product IDs', schema: { type: 'array', items: { type: 'string' } } })
  async removeMultiple(@Body('ids') cartProductIds: string[], @Req() request: Request) {
    try {
      const { id } = request['user'];
      await this.cartService.removeMultiple(cartProductIds, id);
      return handleDataResponse(
        'Delete multiple cart items successfully.'
      );
    }
    catch (error) {
      throw new Error(error);
    }
  }
}
