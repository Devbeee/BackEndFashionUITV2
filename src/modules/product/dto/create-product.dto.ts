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

    @IsNumber({allowNaN: false}, {message: 'Discount must be a number'})
    @ApiProperty()
    discount?: number;

    @IsString({ message: 'Color must be a string' })
    @IsNotEmpty({ message: 'Color is required' })
    @ApiProperty()
    colors: string[];

    @IsEnum(Size, { message: 'Size must be a valid enum value' })
    @IsNotEmpty({ message: 'Size is required' })
    @ApiProperty()
    sizes: Size[];

    @IsString({ message: 'Image URL must be a string' })
    @IsNotEmpty({ message: 'Image URL is required' })
    @ApiProperty()
    imgUrls: string[];

    @IsNumber({allowNaN: false}, {message: 'Stock must be a number'})
    @IsNotEmpty({ message: 'Stock is required' })
    @ApiProperty()
    stocks: number[];

    @IsString({ message: 'Category ID must be a string' })
    @IsNotEmpty({ message: 'Category ID is required' })
    @ApiProperty()
    categoryId: string;
}
