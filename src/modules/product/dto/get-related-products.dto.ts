import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class GetRelatedProductsDto {
  @ApiProperty()
  @IsNumber({}, { message: 'Page must be a number' })
  @IsNotEmpty({ message: 'Page is required' })
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  page: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Page must be a number' })
  @IsNotEmpty({ message: 'Page is required' })
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  @Max(100, { message: 'Limit must be less than or equal to 100' })
  limit: number;

  @ApiProperty()
  @IsUUID('4', { message: 'Product Id must be a UUID v4' })
  @IsOptional()
  productId?: string;

  @ApiProperty()
  @IsString({ message: 'Category Gender must be a string' })
  @IsOptional()
  categoryGender?: string;

  @ApiProperty()
  @IsString({ message: 'Category Type must be a string' })
  @IsOptional()
  categoryType?: string;
}
