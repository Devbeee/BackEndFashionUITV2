import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductDetailsModule } from '@/modules/product-details/product-details.module';
import { CategoryModule } from '@/modules/category/category.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { OrderProduct } from '@/modules/order/entities/order-product.entity';

import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Product, OrderProduct]), ProductDetailsModule, CategoryModule, AuthModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}
