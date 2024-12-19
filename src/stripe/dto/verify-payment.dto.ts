import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class VerifyPaymentDto {
  @IsNotEmpty({ message: 'Session ID is required' })
  @ApiProperty()
  @IsString({ message: 'Session ID must be string' })
  sessionId?: string;

  @IsNotEmpty({ message: 'Order ID is required' })
  @ApiProperty()
  @IsString({ message: 'Order ID must be string' })
  orderId: string;
}
