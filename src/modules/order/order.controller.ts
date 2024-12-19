import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  UseGuards,
  HttpCode,
  Query,
  Delete,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { currentUser } from '@/modules/user/user.decorator';
import { User } from '@/modules/user/entities/user.entity';
import { handleDataResponse } from '@/utils';
import { OrderService } from './order.service';
import {
  CancelOrdersDto,
  DeleteOrderDto,
  GetOrderDto,
  GetOrdersDto,
  RestoreOrderDto,
  UpdateOrderDto,
  CreateOrderDto,
} from '@/modules/order/dto';

@UseGuards(AuthGuard)
@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('')
  @HttpCode(201)
  @ApiOperation({ summary: 'Add a product to the cart' })
  @ApiCreatedResponse({ description: 'Order created successfully!' })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  @ApiBody({ description: 'Data to create order', type: CreateOrderDto })
  async createOrder(
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
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String })
  async getAllOrders(@Query() getOrdersDto: GetOrdersDto) {
    return await this.orderService.getAllOrders(getOrdersDto);
  }

  @Get('/user')
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'keyword', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'filter', required: false, type: String })
  async getOrderList(
    @Query() getOrdersDto: GetOrdersDto,
    @currentUser() user: User,
  ) {
    return await this.orderService.getUserOrders(getOrdersDto, user);
  }

  @Get('')
  @ApiQuery({ name: 'id', required: true, type: String })
  async getOrder(@Query() getOrderDto: GetOrderDto) {
    return await this.orderService.getOrder(getOrderDto);
  }
  @Patch('/update')
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiQuery({ name: 'paymentStatus', required: false, type: String })
  @ApiQuery({ name: 'orderStatus', required: false, type: String })
  async updateOrder(@Query() updateOrderDto: UpdateOrderDto) {
    return await this.orderService.updateOrder(updateOrderDto);
  }
  @Patch('/cancel')
  @ApiQuery({ name: 'id', required: true, type: String })
  async cancelOrder(@Query() cancelOrdersDto: CancelOrdersDto) {
    return await this.orderService.cancelOrder(cancelOrdersDto);
  }
  @Delete('/delete')
  @ApiQuery({ name: 'id', required: true, type: String })
  async deleteOrder(@Query() deleteOrderDto: DeleteOrderDto) {
    return await this.orderService.deleteOrder(deleteOrderDto);
  }
  @Patch('/restore')
  @ApiQuery({ name: 'id', required: true, type: String })
  async restoreOrder(@Query() restoreOrderDto: RestoreOrderDto) {
    return await this.orderService.restoreOrder(restoreOrderDto);
  }
}
