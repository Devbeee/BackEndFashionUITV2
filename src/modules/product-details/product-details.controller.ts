import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductDetailsService } from './product-details.service';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ProductDetails')
@Controller('product-details')
export class ProductDetailsController {
  constructor(private readonly productDetailsService: ProductDetailsService) {}

  @Post()
  create(@Body() createProductDetailDto: CreateProductDetailDto) {
    return this.productDetailsService.create(createProductDetailDto);
  }

  @Get()
  findAll() {
    return this.productDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productDetailsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDetailDto: UpdateProductDetailDto) {
    return this.productDetailsService.update(id, updateProductDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productDetailsService.remove(id);
  }
}
