import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetDefaultAddressDto {
  @IsString({ message: 'AddressId must be a string' })
  @IsNotEmpty({ message: 'AddressId is required' })
  @ApiProperty()
  addressId: string;
}
