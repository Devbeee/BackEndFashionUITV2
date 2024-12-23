import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetProductListDto {
  @ApiProperty()
  @IsNumber({}, { message: 'Page must be a number' })
  @IsNotEmpty({ message: 'Page is required' })
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  page: number;

  @ApiProperty()
  @IsNumber({}, { message: 'Limit must be a number' })
  @IsNotEmpty({ message: 'Limit is required' })
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  @Max(100, { message: 'Limit must be less than or equal to 100' })
  limit: number;

  @ApiProperty()
  @IsString({ message: 'Sort style must be a string' })
  @IsOptional()
  sortStyle?: string;

  @ApiProperty()
  @IsString({ message: 'Category Gender must be a string' })
  @IsOptional()
  categoryGender?: string;

  @ApiProperty()
  @IsString({ message: 'Price must be a string' })
  @IsOptional()
  price?: string;

  @ApiProperty()
  @IsString({ message: 'Category Type must be a string' })
  @IsOptional()
  categoryType?: string;

  @ApiProperty()
  @IsString({ message: 'Color Name must be a string' })
  @IsOptional()
  colorName?: string;
}
