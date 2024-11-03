import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDetailDto } from './dto/create-product-detail.dto';
import { UpdateProductDetailDto } from './dto/update-product-detail.dto';
import { ProductDetail } from './entities/product-detail.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductDetailsService {
  constructor(
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>
  ){}
  async create(createProductDetailDto: CreateProductDetailDto) {
    const productDetail = this.productDetailRepository.create(createProductDetailDto);
    return await this.productDetailRepository.save(productDetail);
  }

  async findAll() {
    return await this.productDetailRepository.find(
      {relations: {
        product: true
      }}
    );
  }

  async findOne(id: string) {
    return await this.productDetailRepository.findOne({
      where: { id },
      relations: {
        product: true
      }
    });
  }

  async update(id: string, updateProductDetailDto: UpdateProductDetailDto) {
    const productDetail = await this.findOne(id);

    if(!productDetail) {
      throw new NotFoundException(`ProductDetail #${id} not found`);
    }
    
    Object.assign(productDetail, updateProductDetailDto);

    return await this.productDetailRepository.save(productDetail);
  }

  async remove(id: string) {
    const productDetail = await this.findOne(id);

    if(!productDetail) {
      throw new NotFoundException(`ProductDetail #${id} not found`);
    }

    return await this.productDetailRepository.remove(productDetail);
  }

  async findByProductId(productId: string) {
    return await this.productDetailRepository.find({
      where: { productId },
      relations: {
        product: true
      }
    });
  }
}
