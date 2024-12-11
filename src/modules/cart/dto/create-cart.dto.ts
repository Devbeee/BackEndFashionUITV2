import { ApiProperty } from '@nestjs/swagger';
import { CreateCartProductDto } from '@/modules/cart-product/dto/create-cart-product.dto';

export class CreateCartDto {
    @ApiProperty()
    cartProduct: CreateCartProductDto;
}
