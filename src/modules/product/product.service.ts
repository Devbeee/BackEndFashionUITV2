import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductDetailsService } from '@/modules/product-details/product-details.service';
import { convertToSlug } from '@/utils';

import { ErrorCode } from '@/common/enums';

import { Product } from './entities/product.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Repository } from 'typeorm';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly productDetailsService: ProductDetailsService,
  ) {}

  async create(productData: CreateProductDto) {
    const existingProduct = await this.productRepository.findOne({
      where: { name: productData.name }
    });
  
    if (existingProduct) {
      throw new Error(ErrorCode.PRODUCT_ALREADY_EXIST);
    }
  
    const { sizes, colors, imgUrls, stocks, ...productInfo } = productData;

    const slug = convertToSlug(productData.name);
    
    const productInfoWithSlug = { ...productInfo, slug };
  
    const product = this.productRepository.create(productInfoWithSlug);
    const savedProduct = await this.productRepository.save(product);
  
    const productDetails = [];
    
    for (let sizeIndex = 0; sizeIndex < sizes.length; sizeIndex++) {
      for (let colorIndex = 0; colorIndex < colors.length; colorIndex++) {
        const index = sizeIndex * colors.length + colorIndex;
        
        const productDetail = {
          size: sizes?.at(sizeIndex),
          color: colors?.at(colorIndex),
          imgUrl: imgUrls?.at(index),
          stock: stocks?.at(index),
          product: savedProduct
        };
  
        productDetails.push(productDetail);
      }
    }
  
    await Promise.all(
      productDetails.map(productDetail => 
        this.productDetailsService.create(productDetail)
      )
    );

    return savedProduct;
  }

  async findAll() {
    return await this.productRepository.find(
      {relations: {
        productDetails: true
      }}
    );
  }

  async findOne(productId: string) {
    return await this.productRepository.findOne({
      where: { id: productId },
      relations: {
        productDetails: true
      }
    });
  }

  async update(productId: string, productUpdateData: UpdateProductDto) {
    const product = await this.findOne(productId);

    if(!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }
    
    const { sizes, colors, imgUrls, stocks, ...productInfo } = productUpdateData;

    const slug = productInfo.name ? convertToSlug(productUpdateData.name) : '';
    
    const productUpdateInfo = { ...productInfo, slug };

    Object.assign(product, productUpdateInfo);

    return await this.productRepository.save(product);
  }

  async remove(productId: string) {
    const product = await this.findOne(productId);

    if(!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }

    return await this.productRepository.remove(product);  
  }
}
