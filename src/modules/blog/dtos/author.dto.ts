import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AuthorDto {
    @ApiProperty()
    @IsString({ message: 'Id must be a string' })
    @IsNotEmpty({ message: 'Id is required' })
    id: string;
    
    @ApiProperty()
    @IsString({ message: 'Full name must be a string' })
    @IsNotEmpty({ message: 'Full name is required' })
    fullName: string;
}