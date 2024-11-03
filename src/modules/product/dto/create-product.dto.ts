import { Size } from '@/common/enums';
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

    @IsString({ message: 'Category ID must be a string' })
    @IsNotEmpty({ message: 'Category ID is required' })
    @ApiProperty()
    categoryId: string;

    @IsString({ message: 'Slug must be a string' })
    @IsNotEmpty({ message: 'Slug is required' })
    @ApiProperty()
    slug: string;

    @IsNumber({allowNaN: false}, {message: 'Discount must be a number'})
    @ApiProperty()
    discount?: number;

    @IsString({ message: 'Color must be a string' })
    @IsNotEmpty({ message: 'Color is required' })
    @ApiProperty()
    colors: string;

    @IsEnum(Size, { message: 'Size must be a valid enum value' })
    @IsNotEmpty({ message: 'Size is required' })
    @ApiProperty()
    size: Size;

    @IsString({ message: 'Image URL must be a string' })
    @IsNotEmpty({ message: 'Image URL is required' })
    @ApiProperty()
    imgUrl: string;

    @IsNotEmpty({ message: 'Stock is required' })
    @ApiProperty()
    stock: boolean;
}
