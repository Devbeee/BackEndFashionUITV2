import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AddAddressDto } from '@/modules/address/dtos/add-address.dto';

export class UpdateAddressDto extends AddAddressDto {
  @IsNotEmpty({ message: 'Id is required' })
  @ApiProperty()
  id: string;
}
