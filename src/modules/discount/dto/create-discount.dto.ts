import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateDiscountDto {
  @IsNotEmpty()
  @IsString()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  discountValue: number;

  @IsNotEmpty()
  @IsString()
  timeRange: string;

  @IsNotEmpty()
  @IsDateString()
  date: Date;
}
