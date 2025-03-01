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
  Query,
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
import { GetBySearchQueryDto } from './dto/get-by-search-query.dto';
import { GetRelatedProductsDto } from './dto/get-related-products.dto';

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
      } else if (error.message === ErrorCode.CATEGORY_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
      } else {
        throw error;
      }
    }
  }

  @Get('list')
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'sortStyle', required: false, type: String })
  @ApiQuery({ name: 'categoryGender', required: false, type: String })
  @ApiQuery({ name: 'price', required: false, type: String })
  @ApiQuery({ name: 'categoryType', required: false, type: String })
  @ApiQuery({ name: 'colorName', required: false, type: String })
  getProductList(@Query() params: GetProductListDto) {
    return this.productService.getProductList(params);
  }

  @Get('search')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'searchQuery', required: true, type: String })
  getProductSearch(@Query() searchQuery: GetBySearchQueryDto) {
    return this.productService.getProductSearch(searchQuery);
  }

  @Get('discounted')
  async getDiscountedProducts() {
    try {
      return this.productService.getDiscountedProducts();
    } catch (error) {
      throw error;
    }
  }

  @Get('top-selling')
  async getTopSellingProducts() {
    try {
      return this.productService.getTopSellingProducts();
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

  @Get('related')
  @ApiQuery({ name: 'page', required: true, type: Number })
  @ApiQuery({ name: 'limit', required: true, type: Number })
  @ApiQuery({ name: 'productId', required: false, type: String })
  @ApiQuery({ name: 'categoryGender', required: false, type: String })
  @ApiQuery({ name: 'categoryType', required: false, type: String })
  async findRelatedProducts(@Query() params : GetRelatedProductsDto) {
    try {
      return this.productService.findRelatedProducts(params);
    }
    catch (error) {
      if (error.message === ErrorCode.PRODUCT_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
      } else {
        throw error;
      }
    }
  }

  @Get(':id')
  findOne(@Param('id') productId: string) {
    try {
      return this.productService.findOne(productId);
    } catch (error) {
      if (error.message === ErrorCode.PRODUCT_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
      } else {
        throw error;
      }
    }
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  update(
    @Param('id') productId: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    try {
      return this.productService.update(productId, updateProductDto);
    } catch (error) {
      if (error.message === ErrorCode.PRODUCT_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
      }
      if (error.message === ErrorCode.CATEGORY_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.CATEGORY_NOT_FOUND);
      } else {
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
      } else {
        throw error;
      }
    }
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug : string) {
    try {
      return this.productService.findOneBySlug(slug);
    }
    catch (error) {
      if (error.message === ErrorCode.PRODUCT_NOT_FOUND) {
        throw new NotFoundException(ErrorCode.PRODUCT_NOT_FOUND);
      } else {
        throw error;
      }
    }
  }
}
