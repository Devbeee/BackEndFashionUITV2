import { ApiProperty } from "@nestjs/swagger";

import { Product } from "@/modules/product/entities/product.entity";

import { Size } from "@/common/enums";

import { 
    IsEnum, 
    IsNotEmpty, 
    IsNumber, 
    IsString 
} from "class-validator";

export class CreateProductDetailDto {
    @IsEnum(Size, { message: 'Size must be a valid enum value' })
    @IsNotEmpty({ message: 'Size is required' })
    @ApiProperty()
    size: Size;

    @IsString({ message: 'Color must be a string' })
    @IsNotEmpty({ message: 'Color is required' })
    @ApiProperty()
    color: string;

    @IsString({ message: 'Image URL must be a string' })
    @IsNotEmpty({ message: 'Image URL is required' })
    @ApiProperty()
    imgUrl: string;

    @IsNumber({allowNaN: false}, { message: 'Stock must be a number' })
    @IsNotEmpty({ message: 'Stock is required' })
    @ApiProperty()
    stock: number;

    @ApiProperty()
    product: Product;
}
