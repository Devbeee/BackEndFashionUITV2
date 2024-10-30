import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProductDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsNumber({allowNaN: false}, {message: 'Price must be a number'})
    @IsNotEmpty({ message: 'Price is required' })
    price: number;

    @IsString({ message: 'Category ID must be a string' })
    @IsNotEmpty({ message: 'Category ID is required' })
    categoryId: string;

    @IsString({ message: 'Slug must be a string' })
    @IsNotEmpty({ message: 'Slug is required' })
    slug: string;
}
