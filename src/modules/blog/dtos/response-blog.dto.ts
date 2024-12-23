import { ApiProperty } from '@nestjs/swagger';

import { AuthorDto } from './author.dto';

export class ResponseBlogDto {
  @ApiProperty()
  id: string;
  
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;
  
  @ApiProperty()
  coverImage: string;
  
  @ApiProperty()
  slug: string;
  
  @ApiProperty({ type: AuthorDto})
  author: AuthorDto;

  @ApiProperty()
  createdAt: Date;
}
