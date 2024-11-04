import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductDetail } from './entities/product-detail.entity';
import { ProductDetailsService } from './product-details.service';
import { ProductDetailsController } from './product-details.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductDetail])],
  controllers: [ProductDetailsController],
  providers: [ProductDetailsService],
  exports: [ProductDetailsService]
})
export class ProductDetailsModule {}
