import {
  IsInt,
  IsOptional,
  IsString,
  IsNotEmpty,
  Min,
  IsEnum,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { FilterOptions, SortOptions } from '@/common/enums';

export class GetOrdersDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Page number is required' })
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page: number;

  @ApiProperty()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit must be less than 100' })
  limit?: number;

  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'Keyword must be a string' })
  keyword?: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum({ message: 'Sort option must be a valid enum' })
  sortBy?: SortOptions;

  @ApiProperty()
  @IsOptional()
  @IsEnum({ message: 'Filter option must be a valid enum' })
  filter?: FilterOptions;
}
