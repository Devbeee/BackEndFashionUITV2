import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    HttpCode, 
    NotFoundException, 
    Param, 
    Patch, 
    Post, 
    Query, 
    Req, 
    UseGuards 
} from '@nestjs/common';

import { ErrorCode, Role } from '@/common/enums';

import { 
    ApiBadRequestResponse, 
    ApiCreatedResponse, 
    ApiNoContentResponse, 
    ApiNotFoundResponse, 
    ApiOkResponse, 
    ApiQuery, 
    ApiTags 
} from '@nestjs/swagger';

import { handleDataResponse } from '@/utils';

import { BlogService } from './blog.service';

import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';

import { Roles } from '../auth/roles.decorator';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogController {
    constructor(private blogService : BlogService) {}

    @Get('')
    @HttpCode(200)
    @ApiOkResponse({
        description: 'The blogs have been successfully fetched.',
    })
    @ApiNotFoundResponse({
        description: 'Blog not found.',
    })
    @ApiQuery({ name: 'page', required: false, type: Number})
    @ApiQuery({ name: 'limit', required: false, type: Number})
    async getAll(@Query('page') page: number, @Query('limit') limit: number) {
        try {
            return await this.blogService.getAll(page, limit);
        }
        catch (error) {
            if (error.message === ErrorCode.BLOG_NOT_FOUND) {
                throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
            } else {
                throw error;
            }
        }
    }
    @Get('/:slug')
    @HttpCode(200)
    @ApiOkResponse({
        description: 'The blog have been successfully fetched.',
    })
    @ApiNotFoundResponse({
        description: 'Blog not found.',
    })
    async getOne(@Param('slug') slug : string) {
        try {
            return await this.blogService.getOne(slug);
        }
        catch (error) {
            if (error.message === ErrorCode.BLOG_NOT_FOUND) {
                throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
            } else {
                throw error;
            }
        }
    }
    
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post('create')
    @HttpCode(201)
    @ApiCreatedResponse({
      description: 'The blog has been successfully created.',
    })
    @ApiBadRequestResponse({ description: 'Missing input!' })
    async createBlog(@Body() createBlogDto : CreateBlogDto, @Req() request : Request) {
        try {
            const userId = request['user'].id;
            await this.blogService.createBlog(createBlogDto, userId);
            handleDataResponse('Blog created successfully!');
        }
        catch (error) {
            throw error;
        }
    }

    @Patch('update/:slug')
    @HttpCode(200)
    @ApiOkResponse({
        description: 'The blog have been successfully updated.',
    })
    @ApiNotFoundResponse({
        description: 'Blog not found.',
    })
    @ApiBadRequestResponse({ description: 'Missing input!' })
    async updateBlog(@Param('slug') slug : string, @Body() updateBlogDto : UpdateBlogDto) {
        try {
            await this.blogService.updateBlog(slug, updateBlogDto);
            handleDataResponse('Blog updated successfully!');
        }
        catch (error) {
            if (error.message === ErrorCode.BLOG_NOT_FOUND) {
                throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
            } else {
                throw error;
            }
        }
    }

    @Delete('delete/:slug')
    @HttpCode(204)
    @ApiNoContentResponse({
        description: 'The blog has been successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'Blog not found.',
    })
    async deleteBlog(@Param('slug') slug : string) {
        try {
            await this.blogService.deleteBlog(slug);
            handleDataResponse('Blog deleted successfully!');
        }
        catch (error) {
            if (error.message === ErrorCode.BLOG_NOT_FOUND) {
                throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
            } else {
                throw error;
            }
        }
    }

    @Delete('delete')
    @HttpCode(204)
    @ApiNoContentResponse({
        description: 'The blogs has been successfully deleted.',
    })
    @ApiNotFoundResponse({
        description: 'Blogs not found.',
    })
    async multiDeleteBlog(@Body() slugsList : string[]) {
        try {
            await this.blogService.multiDeleteBlog(slugsList);
            handleDataResponse('Blogs deleted successfully!');
        }
        catch (error) {
            if (error.message === ErrorCode.BLOG_NOT_FOUND) {
                throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
            } else {
                throw error;
            }
        }
    }
}
