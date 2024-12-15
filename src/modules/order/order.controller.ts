import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpCode,
  Query,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { OrderService } from './order.service';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { CreateOrderDto } from '@/modules/order/dto/create-order.dto';
import { currentUser } from '@/modules/user/user.decorator';
import { User } from '@/modules/user/entities/user.entity';
import { handleDataResponse } from '@/utils';
import { GetOrdersDto } from '@/modules/order/dto/get-orders.dto';
import { CancelOrdersDto } from '@/modules/order/dto/cancel-order.dto';

@UseGuards(AuthGuard)
@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiCreatedResponse({ description: 'Order created successfully!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  @ApiBody({ description: 'Data to create order', type: CreateOrderDto })
  async addAddress(
    @Body() createOrderDto: CreateOrderDto,
    @currentUser() user: User,
  ) {
    try {
      await this.orderService.create(createOrderDto, user);
      return handleDataResponse('Order created successfully!');
    } catch (error) {
      throw error;
    }
  }
  @Get('/all')
  @HttpCode(200)
  @ApiOkResponse({
    description: 'Addresses have been successfully fetched.',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  async getOrdersByUserId(@currentUser() user: User) {
    try {
      return await this.orderService.getAllOrders(user);
    } catch (error) {
      throw error;
    }
  }
  @Get('')
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  getOrderList(@Query() getOrdersDto: GetOrdersDto, @currentUser() user: User) {
    return this.orderService.getOrders(getOrdersDto, user);
  }

  @Patch('/cancel')
  @ApiQuery({ name: 'id', required: true, type: String })
  cancelOrder(@Query() cancelOrdersDto: CancelOrdersDto) {
    return this.orderService.cancelOrder(cancelOrdersDto);
  }
}
