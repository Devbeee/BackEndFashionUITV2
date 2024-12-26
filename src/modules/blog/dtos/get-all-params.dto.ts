import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class GetAllParamsDto {
    @ApiProperty()
    @IsNumber({  }, { message: 'Page must be a number' })
    @IsNotEmpty({ message: 'Page is required' })
    @Min(1, { message: 'Page must be greater than or equal to 1' })
    page: number;

    @ApiProperty()
    @IsNumber({  }, { message: 'Limit must be a number' })
    @IsNotEmpty({ message: 'Limit is required' })
    @Min(1, { message: 'Limit must be greater than or equal to 1' })
    @Max(100,  { message: 'Limit must be less than or equal to 100' })
    limit: number;

    @ApiProperty()
    @IsString({ message: 'Keyword must be a string' })
    keyword: string;

    @ApiProperty()
    @IsArray( { message: 'Authors must be an array' })
    authors: string[];

    @ApiProperty()
    @IsString({ message: 'Sort style must be a string' })
    sortStyle: string;

    @ApiProperty()
    @IsArray({ message: 'Create date range must be an array' })
    createDateRange: Date[];
}
