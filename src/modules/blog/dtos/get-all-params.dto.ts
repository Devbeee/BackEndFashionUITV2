import { ApiProperty } from '@nestjs/swagger';

export class GetAllParamsDto {
    @ApiProperty()
    page: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    keyword: string;

    @ApiProperty()
    authors: string[];

    @ApiProperty()
    sortStyle: string;

    @ApiProperty()
    createDateRange: Date[];
}
