import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '@/common/enums';

export class UpdateOrderDto {
  @ApiProperty()
  @IsEnum(PaymentStatus, {
    message: 'Payment status must be a valid enum value',
  })
  paymentStatus?: PaymentStatus;

  @ApiProperty()
  @IsEnum(OrderStatus, { message: 'Order status must be a valid enum value' })
  orderStatus?: OrderStatus;
}
