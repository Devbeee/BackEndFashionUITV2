import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductDetailsModule } from '@/modules/product-details/product-details.module';
import { CartProductModule } from '@/modules/cart-product/cart-product.module';
import { UsersModule } from '@/modules/user/user.module';
import { AuthModule } from '@/modules/auth/auth.module';

import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart]), ProductDetailsModule, CartProductModule, AuthModule, UsersModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
