import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/modules/auth/auth.module';
import { OrderProduct } from '@/modules/order/entities';
import { User } from '@/modules/user/entities/user.entity';
import { Order } from '@/modules/order/entities/order.entity';
import { Product } from '@/modules/product/entities/product.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';

import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Product,
      ProductDetail,
      Order,
      OrderProduct,
    ]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
