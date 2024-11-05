import { CreateProductDetailDto } from '@/modules/product-details/dto/create-product-detail.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';

export class CreateProductDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    @ApiProperty()
    name: string;

    @IsString({ message: 'Description must be a string' })
    @IsNotEmpty({ message: 'Description is required' })
    @ApiProperty()
    description: string;

    @IsNumber({allowNaN: false}, {message: 'Price must be a number'})
    @IsNotEmpty({ message: 'Price is required' })
    @ApiProperty()
    price: number;

    @IsNumber({allowNaN: false}, {message: 'Discount must be a number'})
    @ApiProperty()
    discount?: number;

    @ApiProperty()
    productDetails: CreateProductDetailDto[];

    @IsString({ message: 'Category ID must be a string' })
    @IsNotEmpty({ message: 'Category ID is required' })
    @ApiProperty()
    categoryId: string;
}
