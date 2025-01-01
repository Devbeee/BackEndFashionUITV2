import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Order } from '@/modules/order/entities';
import { AuthModule } from '@/modules/auth/auth.module';
import { OrderModule } from '@/modules/order/order.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';
import { StripeProvider } from './stripe.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AuthModule, OrderModule],
  controllers: [StripeController],
  providers: [StripeService, StripeProvider],
})
export class StripeModule {}
