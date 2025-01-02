import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class GetBySearchQueryDto {
    @ApiProperty()
    @IsNumber({}, { message: 'Page must be a number' })
    @IsNotEmpty({ message: 'Page is required' })
    @Min(1, { message: 'Page must be greater than or equal to 1' })
    page: number;


    @ApiProperty()
    @IsString({ message: 'Search query must be a string' })
    @IsNotEmpty({ message: 'Search query is required' })
    searchQuery: string;
}