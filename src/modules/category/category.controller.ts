import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  ConflictException,
  Patch
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags
} from '@nestjs/swagger';

import { handleDataResponse } from '@/utils';
import { ErrorCode } from '@/common/enums';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

  @ApiTags('Manage Category')
  @Controller('category')
  export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post('create')
    @HttpCode(201)
    @ApiCreatedResponse({
      description: 'The category has been successfully created.',
    })
    @ApiConflictResponse({
      description: 'This category already exists!'
    })
    @ApiBadRequestResponse({
      description: 'Missing input!'
    })
    async create(@Body() createCategoryDto: CreateCategoryDto) {
      try {
        await this.categoryService.create(createCategoryDto);
        return handleDataResponse(
          'Added category successfully!'
        )
      }
      catch (error) {
        if (error.messsage === ErrorCode.CATEGORY_ALREADY_EXIST) {
          throw new ConflictException(ErrorCode.CATEGORY_ALREADY_EXIST)
        } else {
          throw error
        }
      }
    }

    @Get('all')
    @ApiOkResponse({
      description: 'Get all categories successfully!',
    })
    async findAll() {
      try {
        return await this.categoryService.findAll();
      } catch (error) {
        throw error;
      }
    }

    @Get(':id')
    @ApiOkResponse({
      description: 'Get category successfully!',
    })
    async findOne(@Param('id') id: string) {
      try {
        return await this.categoryService.findOne(id);
      } catch (error) {
        throw error;
      }
    }

    @Patch(':id')
    @ApiOkResponse({
      description: 'Update category successfully!',
    })
    @ApiBadRequestResponse({
      description: 'Invalid input data!',
    })
    async update(@Param('id') id: string, @Body('categoryData') categoryData: UpdateCategoryDto) {
      try {
        return await this.categoryService.update(id, categoryData);
      } catch (error) {
        throw error;
      }
    }

    @Delete('bulk-delete')
    @ApiOkResponse({
      description: 'Delete multiple categories successfully',
    })
    @ApiBadRequestResponse({
      description: 'Invalid list of IDs!',
    })
    async removeMultiple(@Body() ids: string[]) {
      try {
        return await this.categoryService.removeMultiple(ids);
      } catch (error) {
        throw error;
      }
    }

    @Delete('delete/:id')
    @ApiOkResponse({
      description: 'Delete category successfully!',
    })
    @ApiBadRequestResponse({
      description: 'Invalid ID!',
    })
    async remove(@Param('id') id: string) {
      try {
        return await this.categoryService.remove(id);
      } catch (error) {
        throw error;
      }
    }

  }
