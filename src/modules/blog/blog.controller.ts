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

import { 
    ApiBadRequestResponse, 
    ApiCreatedResponse, 
    ApiNoContentResponse, 
    ApiNotFoundResponse, 
    ApiOkResponse, 
    ApiQuery, 
    ApiTags 
} from '@nestjs/swagger';


import { ErrorCode, Role } from '@/common/enums';
import { handleDataResponse } from '@/utils';
import { Roles } from '@/modules/auth/roles.decorator';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { RolesGuard } from '@/modules/auth/roles.guard';

import { BlogService } from './blog.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { GetAllParamsDto } from './dtos/get-all-params.dto';

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
    @ApiQuery({ name: 'keyword', required: false, type: String })
    @ApiQuery({ name: 'sortStyle', required: false, type: String })
    @ApiQuery({ name: 'authors', required: false, type: [String] })
    @ApiQuery({ name: 'createDateRange', required: false, type: [Date] })
    async getAll(
        @Query() params : GetAllParamsDto
    ) {
        if(params.authors && !Array.isArray(params.authors)) {
            params.authors = [params.authors];
        }
        try {
            return await this.blogService.getAll(params);
        }
        catch (error) {
            if (error.message === ErrorCode.BLOG_NOT_FOUND) {
                throw new NotFoundException(ErrorCode.BLOG_NOT_FOUND);
            } else {
                throw error;
            }
        }
    }

    @Get('authors')
    @HttpCode(200)
    @ApiOkResponse({
        description: 'The authors have been successfully fetched.',
    })
    @ApiNotFoundResponse({
        description: 'Authors not found.',
    })
    async getAllAuthors() {
        try {
            return await this.blogService.getAllAuthors();
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
            const {id} = request['user'];
            await this.blogService.createBlog(createBlogDto, id);
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
