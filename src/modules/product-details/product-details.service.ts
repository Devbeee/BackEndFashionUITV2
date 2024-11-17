import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@/common/enums';

import { ProductDetail } from './entities/product-detail.entity';

import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';

import { Repository } from 'typeorm';

@Injectable()
export class ProductDetailsService {
  constructor(
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>
  ){}
  async create(productDetailData: CreateProductDetailDto) {
    const productDetail = this.productDetailRepository.create(productDetailData);
    return await this.productDetailRepository.save(productDetail);
  }

  async findAll() {
    return await this.productDetailRepository.find(
      {relations: {
        product: true
      }}
    );
  }

  async findOne(productDetailId: string) {
    return await this.productDetailRepository.findOne({
      where: { id: productDetailId },
      relations: {
        product: true
      }
    });
  }

  async update(productDetailId: string, productDetailUpdateData: UpdateProductDetailDto) {
    const productDetail = await this.findOne(productDetailId);

    if(!productDetail) {
      throw new Error(ErrorCode.PRODUCT_DETAIL_NOT_FOUND);
    }
    
    Object.assign(productDetail, productDetailUpdateData);

    return await this.productDetailRepository.save(productDetail);
  }

  async remove(productDetailId: string) {
    const productDetail = await this.findOne(productDetailId);

    if(!productDetail) {
      throw new Error(ErrorCode.PRODUCT_DETAIL_NOT_FOUND);
    }

    return await this.productDetailRepository.remove(productDetail);
  }
}
