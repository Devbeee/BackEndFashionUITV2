import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class GetProductListDto {
    @ApiProperty()
    @IsNumber({  }, { message: 'Page must be a number' })
    @IsNotEmpty({ message: 'Page is required' })
    @Min(1, { message: 'Page must be greater than or equal to 1' })
    page: number;

    @ApiProperty()
    @IsNumber({  }, { message: 'Limit must be a number' })
    @IsNotEmpty({ message: 'Limit is required' })
    @Min(1, { message: 'Limit must be greater than or equal to 1' })
    limit: number;

    @ApiProperty()
    @IsArray({ message: 'Sort style must be a string' })
    sortStyle?: string;

    @ApiProperty()
    @IsString({ message: 'Category Gender must be a string' })
    categoryGender?: string;

    @ApiProperty()
    @IsString({ message: 'Price must be a string' })
    price?: string;

    @ApiProperty()
    @IsString({ message: 'Category Type must be a string' })
    categoryType?: string;

    @ApiProperty()
    @IsString({ message: 'Color Name must be a string' })
    colorName?: string;
}