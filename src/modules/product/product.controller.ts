import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Put, 
  Param, 
  Delete, 
  NotFoundException,
  BadRequestException,
  UseGuards,
  Query
} from '@nestjs/common';

import { ErrorCode, Role } from '@/common/enums';

import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '@/modules/auth/roles.decorator';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { RolesGuard } from '@/modules/auth/roles.guard';

import { ProductService } from './product.service';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductListDto } from './dto/get-product-list.dto';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
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

  @Get('list')
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'sortStyle', required: false, type: String })
  @ApiQuery({ name: 'categoryGender', required: false, type: String })
  @ApiQuery({ name: 'price', required: false, type: String })
  @ApiQuery({ name: 'categoryType', required: false, type: String })
  @ApiQuery({ name: 'colorName', required: false, type: String })
  getProductList(
    @Query() params: GetProductListDto
  ) {
    try {
      return this.productService.getProductList(params);
    } catch (error) {
      throw error;
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
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

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
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
