import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { ErrorCode } from '@/common/enums';
import { convertToSlug } from '@/utils';

import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { ResponseBlogDto } from './dtos/response-blog.dto';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private blogRepository : Repository<Blog>
    ) {}

    async getAll (page : number = 1, limit : number = 8) {
        const [blogs, total] =  await this.blogRepository.findAndCount({
            relations: ['author'],
            order: {
                createdAt: 'DESC',
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        if (!blogs || blogs.length === 0) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        const  blogsRes : ResponseBlogDto[] = blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            description: blog.description,
            coverImage: blog.coverImage,
            slug: blog.slug,
            author: blog.author.fullName,
            createdAt: blog.createdAt,
        }));
        return { 
            data: blogsRes,
            total,
            page,
            limit,
        };
    }

    async getOne (slug : string) {
        const blog = await this.blogRepository.findOne({
            relations: ['author'],
            where: {slug: slug},
        });
        if (!blog) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        const blogRes : ResponseBlogDto = {
            id: blog.id,
            title: blog.title,
            description: blog.description,
            coverImage: blog.coverImage,
            slug: blog.slug,
            author: blog.author.fullName,
            createdAt: blog.createdAt
        };
        return blogRes;
    }

    async createBlog (blog : CreateBlogDto, userId : string) : Promise<Blog> {
        const slug = convertToSlug(blog.title);
        const newBlog = this.blogRepository.create({...blog, slug, userId});
        return await this.blogRepository.save(newBlog);
    }

    async updateBlog (slug : string, blog : UpdateBlogDto) {
        const existedBlog = await this.blogRepository.findOne({
            where: {slug: slug},
        })
        if (!existedBlog) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        existedBlog.title = blog.title;
        existedBlog.description = blog.description;
        existedBlog.coverImage = blog.coverImage;
        existedBlog.slug = convertToSlug(blog.title);
        return await this.blogRepository.save(existedBlog);
    }

    async deleteBlog (slug : string) {
        const existedBlog = await this.blogRepository.findOne({
            where: {slug: slug},
        });
        if (!existedBlog) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        return await this.blogRepository.softRemove(existedBlog);
    }
    
    
    async multiDeleteBlog (slugs : string[]) {
        const existedBlogs = await this.blogRepository.find({
            where: {slug: In(slugs)},
        });
        if (!existedBlogs || existedBlogs.length === 0) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        return await this.blogRepository.softRemove(existedBlogs);
    }
}
