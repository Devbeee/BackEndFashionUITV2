import { ApiTags } from '@nestjs/swagger';

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  NotFoundException
} from '@nestjs/common';

import { ErrorCode } from '@/common/enums';

import { ProductDetailsService } from './product-details.service';

import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';

@ApiTags('ProductDetails')
@Controller('product-details')
export class ProductDetailsController {
  constructor(private readonly productDetailsService: ProductDetailsService) {}

  @Post()
  create(@Body() createProductDetailDto: CreateProductDetailDto) {
    try {
      return this.productDetailsService.create(createProductDetailDto);
    } catch (error) {      
      throw error;      
    }
  }

  @Get()
  findAll() {
    try {
      return this.productDetailsService.findAll();
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') productDetailId: string) {
    try {
      return this.productDetailsService.findOne(productDetailId);
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  update(@Param('id') productDetailId: string, @Body() updateProductDetailDto: UpdateProductDetailDto) {
    try {
      return this.productDetailsService.update(productDetailId, updateProductDetailDto);
    } catch (error) {
      if (error.message === ErrorCode.PRODUCT_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
      }
      else {
        throw error;
      }
    }
  }

  @Delete(':id')
  remove(@Param('id') productDetailId: string) {
    try {
      return this.productDetailsService.remove(productDetailId);
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
