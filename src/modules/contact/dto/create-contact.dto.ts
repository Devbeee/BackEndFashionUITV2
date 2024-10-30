import { IsString, IsEmail, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
    @IsString({ message: 'Name must be a string' })
    @IsNotEmpty({ message: 'Name is required' })
    fullName: string;

    @IsEmail({}, { message: 'Email must be a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    phoneNumber: string;

    @IsString({ message: 'Description must be a string' })
    @IsNotEmpty({ message: 'Description is required' })
    description: string;
}
