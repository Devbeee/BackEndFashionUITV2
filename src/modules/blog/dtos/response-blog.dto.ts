import { ApiProperty } from '@nestjs/swagger';

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
  
  @ApiProperty()
  author: string;

  @ApiProperty()
  createdAt: Date;
}
