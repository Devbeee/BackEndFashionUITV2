import { ApiProperty } from "@nestjs/swagger";

export class AuthorDto {
    @ApiProperty()
    id: string;
    
    @ApiProperty()
    fullName: string;
}