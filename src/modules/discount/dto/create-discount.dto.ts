import { IsNotEmpty, IsNumber, IsString, IsDateString } from 'class-validator';

export class CreateDiscountDto {
  @IsNotEmpty()
  @IsNumber()
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
