import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateCartProductDto {
  @IsNumber({ allowNaN: false }, { message: 'Quantity must be a number' })
  @ApiProperty()
  quantity: number;

  @IsString({ message: 'Product detail ID must be a string' })
  @IsNotEmpty({ message: 'Product detail ID is required' })
  @ApiProperty()
  productDetailId: string;

  @IsString({ message: 'Cart ID must be a string' })
  @IsNotEmpty({ message: 'Cart ID is required' })
  @ApiProperty()
  cartId: string;
}
