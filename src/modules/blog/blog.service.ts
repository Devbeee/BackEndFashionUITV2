import { Injectable } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ErrorCode } from '@/common/enums';

import { Blog } from './entities/blog.entity';
import { User } from '../user/entities/user.entity';

import { generateSlug } from '@/utils';

import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { ResponseBlogDto } from './dtos/response-blog.dto';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private blogRepository : Repository<Blog>,
        @InjectRepository(User)
        private userRepository : Repository<User>,
    ) {}

    async getAll (page : number = 1, limit : number = 8) {
        const [blogs, total] =  await this.blogRepository.findAndCount({
            withDeleted: false,
            order: {
                createdAt: 'DESC',
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        if (!blogs || blogs.length === 0) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        const  blogsRes : ResponseBlogDto[] = [];
        for (let i = 0; i < blogs.length; i++) {
            const user = await this.userRepository.findOne({
                where: {id: blogs[i].userId},
            });
            blogsRes[i] = {
                id: blogs[i].id,
                title: blogs[i].title,
                description: blogs[i].description,
                coverImage: blogs[i].coverImage,
                slug: blogs[i].slug,
                user: user.fullName,
                createdAt: blogs[i].createdAt
            }
        }
        return { 
            data: blogsRes,
            total,
            page,
            limit,
        };
    }

    async getOne (slug : string) {
        const blog = await this.blogRepository.findOne({
            where: {slug: slug},
            withDeleted: false,
        });
        if (!blog) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        const user = await this.userRepository.findOne({
            where: {id: blog.userId},
        })
        const blogRes : ResponseBlogDto = {
            id: blog.id,
            title: blog.title,
            description: blog.description,
            coverImage: blog.coverImage,
            slug: blog.slug,
            user: user.fullName,
            createdAt: blog.createdAt
        };
        return blogRes;
    }

    async createBlog (blog : CreateBlogDto, userId : string) : Promise<Blog> {
        const slug = generateSlug(blog.title, {timestamp: true});
        const newBlog = this.blogRepository.create({...blog, slug, userId});
        return await this.blogRepository.save(newBlog);
    }

    async updateBlog (slug : string, blog : UpdateBlogDto) {
        const existedBlog = await this.blogRepository.findOne({
            where: {slug: slug},
            withDeleted: false,
        })
        if (!existedBlog) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        existedBlog.title = blog.title;
        existedBlog.description = blog.description;
        existedBlog.coverImage = blog.coverImage;
        existedBlog.slug = generateSlug(blog.title, {timestamp: true});
        return await this.blogRepository.save(existedBlog);
    }

    async deleteBlog (slug : string) {
        const existedBlog = await this.blogRepository.findOne({
            where: {slug: slug},
            withDeleted: false,
        });
        if (!existedBlog) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        return await this.blogRepository.softRemove(existedBlog);
    }
    
    
    async multiDeleteBlog (slugs : string[]) {
        const existedBlogs = await this.blogRepository.find({
            where: {slug: In(slugs)},
            withDeleted: false,
        });
        if (!existedBlogs || existedBlogs.length === 0) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        return await this.blogRepository.softRemove(existedBlogs);
    }
}
