import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class RepayStripeDto {
  @IsNotEmpty({ message: 'Order ID is required' })
  @ApiProperty()
  @IsString({ message: 'Order ID must be string' })
  orderId: string;
}
