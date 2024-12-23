import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestoreOrderDto {
  @IsString({ message: 'Order ID must be a string' })
  @IsNotEmpty({ message: 'Order ID is required' })
  @ApiProperty()
  id: string;
}
