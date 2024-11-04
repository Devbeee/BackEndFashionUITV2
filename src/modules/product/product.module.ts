import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductDetailsModule } from '@/modules/product-details/product-details.module';

import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';


@Module({
  imports: [TypeOrmModule.forFeature([Product]), ProductDetailsModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
