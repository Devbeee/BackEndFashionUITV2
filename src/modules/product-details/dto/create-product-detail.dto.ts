import { Size } from "@/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

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

    @IsNotEmpty({ message: 'Stock is required' })
    @ApiProperty()
    stock: boolean;

    @IsNotEmpty({ message: 'Product ID is required' })
    @ApiProperty()
    productId: string;
}
