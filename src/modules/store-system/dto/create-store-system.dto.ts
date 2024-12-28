import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStoreSystemDto {
  @IsNotEmpty({ message: 'Province is required' })
  @ApiProperty()
  province: string;

  @IsNotEmpty({ message: 'District is required' })
  @ApiProperty()
  district: string;

  @IsNotEmpty({ message: 'Ward is required' })
  @ApiProperty()
  ward: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  longitude: string;

  @ApiProperty()
  latitude: string;

  @IsNotEmpty({ message: 'Address detail is required' })
  @ApiProperty()
  addressDetail: string;
}
