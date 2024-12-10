import { Module } from '@nestjs/common';
import { CartProductService } from './cart-product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartProduct } from './entities/cart-product.entity';
import { ProductDetailsModule } from '../product-details/product-details.module';

@Module({
  imports: [TypeOrmModule.forFeature([CartProduct]), ProductDetailsModule],
  providers: [CartProductService],
  exports: [CartProductService],
})
export class CartProductModule {}
