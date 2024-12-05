import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAddressDto {
  @IsString({ message: 'AddressId must be a string' })
  @IsNotEmpty({ message: 'Id is required' })
  @ApiProperty()
  id: string;
}
