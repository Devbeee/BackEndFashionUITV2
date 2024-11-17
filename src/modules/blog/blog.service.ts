import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { ErrorCode, SortStyles } from '@/common/enums';
import { convertToSlug } from '@/utils';

import { Blog } from './entities/blog.entity';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { ResponseBlogDto } from './dtos/response-blog.dto';
import { GetAllParamsDto } from './dtos/get-all-params.dto';

@Injectable()
export class BlogService {
    constructor(
        @InjectRepository(Blog)
        private blogRepository : Repository<Blog>
    ) {}

    async getAll (params : GetAllParamsDto) {
        const { page, limit, keyword, authors, sortStyle, createDateRange } = params;
        const queryBuilder = this.blogRepository.createQueryBuilder('blog')
            .leftJoinAndSelect('blog.author', 'author')
            .skip((page -1) * limit)
            .take(limit);

        if (authors && authors.length > 0) {
            queryBuilder.andWhere('blog.author.id IN (:...authors)', {authors});
        }

        if (createDateRange && createDateRange.length === 2) {
            queryBuilder.andWhere('blog.createdAt BETWEEN :startDate AND :endDate', {
                startDate: createDateRange[0],
                endDate: createDateRange[1],
            });
        }

        if (keyword) {
            queryBuilder.andWhere('blog.title LIKE :keyword OR blog.description LIKE :keyword', {keyword: `%${keyword}%`});
        }

        switch (sortStyle) {
            case SortStyles.name_asc:
                queryBuilder.orderBy('blog.title', 'ASC');
                break;
            case SortStyles.name_desc:
                queryBuilder.orderBy('blog.title', 'DESC');
                break;
            case SortStyles.date_asc:
                queryBuilder.orderBy('blog.createdAt', 'ASC');
                break;
            case SortStyles.date_desc:
                queryBuilder.orderBy('blog.createdAt', 'DESC');
                break;
            default:
                queryBuilder.orderBy('blog.createdAt', 'DESC');
                break;
        }

        const [blogs, total] = await queryBuilder.getManyAndCount();

        if (!blogs || blogs.length === 0) {
            return { 
                data: [],
                total,
                page,
                limit,
            };
        }
        const  blogsRes : ResponseBlogDto[] = blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            description: blog.description,
            coverImage: blog.coverImage,
            slug: blog.slug,
            author: {
                id: blog.author.id,
                fullName: blog.author.fullName,
            },
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
            author: {
                id: blog.author.id,
                fullName: blog.author.fullName,
            },
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

    async getAllAuthors () {
        const authors = await this.blogRepository.createQueryBuilder('blog')
            .select('author.id', 'id')
            .addSelect('author.fullName', 'fullName')
            .leftJoin('blog.author', 'author')
            .groupBy('author.id')
            .getRawMany();
        return authors;
    }
}
