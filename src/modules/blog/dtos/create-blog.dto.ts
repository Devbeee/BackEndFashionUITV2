import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBlogDto {
  @IsNotEmpty({ message: 'Title is required' })
  @ApiProperty()
  title: string;

  @IsNotEmpty({ message: 'Description is required' })
  @ApiProperty()
  description: string;
  
  @IsNotEmpty({ message: 'Cover image is required' })
  @ApiProperty()
  coverImage: string;
}
