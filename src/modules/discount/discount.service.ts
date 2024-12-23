import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorCode } from '@/common/enums';

import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

import { Discount } from './entities/discount.entity';

import { Product } from '@/modules/product/entities/product.entity';

import { In, Repository } from 'typeorm';

@Injectable()
export class DiscountService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto) {
    const { productId, discountValue, timeRange, date } = createDiscountDto;
    
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }

    const existedDiscount = await this.discountRepository.findOne({
      where: {
        date: date,
        product: product,
        timeRange: timeRange,
      },
    });

    if (existedDiscount) {
      throw new Error(ErrorCode.DISCOUNT_ALREADY_EXIST);
    }

    const discount = this.discountRepository.create({
      discountValue,
      timeRange,
      date,
      product,
    });

    return this.discountRepository.save(discount);
  }

  async findAll() {
    return await this.discountRepository.find({ relations: ['product'] });
  }

  async update(id: string, updateDiscountDto: UpdateDiscountDto) {
    const discount = await this.discountRepository.findOne({ where: { id } });
    if (!discount) {
      throw new Error(ErrorCode.DISCOUNT_NOT_FOUND);
    }
    Object.assign(discount, updateDiscountDto);
    return await this.discountRepository.save(discount);
  }

  async remove(id: string) {
    return await this.discountRepository.delete(id);
  }

  async removeMultiple(ids: string[]) {
    return await this.discountRepository.delete({ id: In(ids) });
  }
}
