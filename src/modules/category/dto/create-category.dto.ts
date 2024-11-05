import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString({ message: 'Gender must be a string' })
    @IsNotEmpty({ message: 'Gender is required' })
    @ApiProperty()
    gender: string;

    @IsString({ message: 'Type must be a string' })
    @IsNotEmpty({ message: 'Type is required' })
    @ApiProperty()
    type: string;
}
