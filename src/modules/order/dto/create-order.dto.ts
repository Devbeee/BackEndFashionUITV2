import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

import { OrderStatus, PaymentMethod, PaymentStatus } from '@/common/enums';
import { Address } from '@/modules/address/entities/address.entity';

export class CreateOrderDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Delivery address is required' })
  address: Address;

  @ApiProperty()
  @IsEnum(PaymentStatus, {
    message: 'Payment status must be a valid enum value',
  })
  paymentStatus: PaymentStatus;

  @ApiProperty()
  @IsEnum(PaymentMethod, {
    message: 'Payment method must be a valid enum value',
  })
  paymentMethod: PaymentMethod;

  @ApiProperty()
  @IsEnum(OrderStatus, { message: 'Order status must be a valid enum value' })
  orderStatus: OrderStatus;

  @ApiProperty()
  @IsNotEmpty({ message: 'Order product is required' })
  @IsString({ message: 'Product Id must be string' })
  products: {
    quantity: number;
    productDetailId: string;
    cartProductId: string;
  }[];

  @ApiProperty()
  @IsString({ message: 'Message must be string' })
  message: string;

  @ApiProperty()
  @IsNumber({ allowNaN: false }, { message: 'totalPrice must be a number' })
  totalPrice: number;
}
