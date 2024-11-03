import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductDetailsModule } from '../product-details/product-details.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), ProductDetailsModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
