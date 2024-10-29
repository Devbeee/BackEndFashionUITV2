import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmEmailDto {
  @IsString({ message: 'UserId must be a string' })
  @IsNotEmpty({ message: 'UserId is required' })
  @ApiProperty()
  userId: string;
}
