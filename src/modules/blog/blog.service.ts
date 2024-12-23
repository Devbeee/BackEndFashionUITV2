import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindManyOptions, Between, Like } from 'typeorm';

import { ErrorCode, SortStyles } from '@/common/enums';
import { convertToSlug } from '@/utils';

import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { GetAllParamsDto } from './dtos/get-all-params.dto';
import { AuthorDto } from './dtos/author.dto';

@Injectable() 
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private blogRepository : Repository<Blog>
    ) {}

    private addWhereConditions(filters: {
        authors?: string[];
        createDateRange?: Date[];
        keyword?: string;
    }) {
        const { authors, createDateRange, keyword } = filters;

        const baseConditions = (field: 'title' | 'description') => ({
            ...(authors?.length && { author: { id: In(authors) } }),
            ...(createDateRange?.length === 2 && {
                createdAt: Between(
                    new Date(new Date(createDateRange[0]).setUTCHours(0, 0, 0, 0)),
                    new Date(new Date(createDateRange[1]).setUTCHours(23, 59, 59, 999)),
                ),
            }),
            ...(keyword && { [field]: Like(`%${keyword}%`) }),
        });

        return [baseConditions('title'), baseConditions('description')];
    }

    private getSortOrder(sortStyle: string) {
        return {
            [SortStyles.NAME_ASC]: { title: 'ASC' },
            [SortStyles.NAME_DESC]: { title: 'DESC' },
            [SortStyles.DATE_ASC]: { createdAt: 'ASC' },
            [SortStyles.DATE_DESC]: { createdAt: 'DESC' },
        }[sortStyle] || { createdAt: 'DESC' };
    }
    
    async getAll(params: GetAllParamsDto) {
        const { page = 1, limit = 10, keyword, authors, sortStyle, createDateRange } = params;

        const query: FindManyOptions = {
            relations: ['author'],
            skip: (page - 1) * limit,
            take: limit,
            where: this.addWhereConditions({ authors, createDateRange, keyword }),
            order: this.getSortOrder(sortStyle),
            select: {
                author: { id: true, fullName: true, avatar: true },
            }
        };

        const [blogs, total] = await this.blogRepository.findAndCount(query);

        return {
            data: blogs,
            total,
            page,
            limit,
        };
    }

    async getOne (slug : string) {
        const blog = await this.blogRepository.findOne({
            relations: ['author'],
            where: {slug: slug},
            select: {
                author: { id: true, fullName: true, avatar: true },
            }
        });
        if (!blog) {
            throw new Error(ErrorCode.BLOG_NOT_FOUND);
        }
        return blog;
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
        existedBlog.content = blog.content;
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

    async getAllAuthors () {
        const blogs = await this.blogRepository.find({
            relations: ['author'],
        });

        const authorsMap = new Map<string, AuthorDto>(); 

        blogs.forEach(blog => {
            if (blog.author && !authorsMap.has(blog.author.id)) {
                authorsMap.set(blog.author.id, {
                    id: blog.author.id,
                    fullName: blog.author.fullName,
                });
            }
        });

        return Array.from(authorsMap.values());
    }
}
