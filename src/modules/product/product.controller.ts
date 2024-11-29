import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete, 
  NotFoundException,
  BadRequestException
} from '@nestjs/common';

import { ErrorCode } from '@/common/enums';

import { ApiTags } from '@nestjs/swagger';

import { ProductService } from './product.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    try {
      return this.productService.create(createProductDto);
    } catch (error) {
      if (error.message === ErrorCode.PRODUCT_ALREADY_EXIST) {
        throw new BadRequestException(ErrorCode.PRODUCT_ALREADY_EXIST);
      }
      else if (error.message === ErrorCode.CATEGORY_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
      }
      else {
        throw error;
      }
    }
  }

  @Get()
  findAll() {
    try {
      return this.productService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') productId: string) {
    try {
      return this.productService.findOne(productId);
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  update(@Param('id') productId: string, @Body() updateProductDto: UpdateProductDto) {
    try {
      return this.productService.update(productId, updateProductDto);
    } catch (error) {
      if (error.message === ErrorCode.PRODUCT_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
      }
      if (error.message === ErrorCode.CATEGORY_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
      }
      else {
        throw error;
      }
    }
  }

  @Delete(':id')
  remove(@Param('id') productId: string) {
    try {
      return this.productService.remove(productId);
    } catch (error) {
      if (error.message === ErrorCode.PRODUCT_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
      }
      else {
        throw error;
      }
    }
  }
}
