import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
    @ApiProperty()
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    fullName: string;

    @ApiProperty()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty()
    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    phoneNumber: string;

    @ApiProperty()
    @IsString({ message: 'Description must be a string' })
    @IsNotEmpty({ message: 'Description is required' })
    description: string;
}
