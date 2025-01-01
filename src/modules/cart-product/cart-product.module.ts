import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartProduct } from './entities/cart-product.entity';
import { Category } from '@/modules/category/entities/category.entity';

import { CartProductService } from './cart-product.service';

import { ProductDetailsModule } from '../product-details/product-details.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartProduct, Category]),
    ProductDetailsModule,
  ],
  providers: [CartProductService],
  exports: [CartProductService],
})
export class CartProductModule {}
