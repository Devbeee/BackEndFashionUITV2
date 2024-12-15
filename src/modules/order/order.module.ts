import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { AuthModule } from '@/modules/auth/auth.module';
import { Product } from '@/modules/product/entities/product.entity';
import { OrderProduct } from '@/modules/order/entities/order-product.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';
import { CartModule } from '@/modules/cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, OrderProduct, ProductDetail]),
    AuthModule,
    CartModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
