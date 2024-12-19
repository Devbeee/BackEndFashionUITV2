import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '@/modules/order/entities/order.entity';
import { AuthModule } from '@/modules/auth/auth.module';
import { OrderModule } from '@/modules/order/order.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AuthModule, OrderModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
