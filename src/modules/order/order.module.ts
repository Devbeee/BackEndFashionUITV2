import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';
import { CartModule } from '@/modules/cart/cart.module';

import { Product } from '@/modules/product/entities/product.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';
import { CartProduct } from '@/modules/cart-product/entities/cart-product.entity';
import { Order, OrderAddress, OrderProduct } from '@/modules/order/entities';

import { OrderService } from './order.service';

import { OrderController } from './order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Product,
      OrderProduct,
      ProductDetail,
      CartProduct,
      OrderAddress,
    ]),
    AuthModule,
    CartModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
