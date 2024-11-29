import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductDetailsService } from '@/modules/product-details/product-details.service';
import { CategoryService } from '@/modules/category/category.service';

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
    private readonly categoryService: CategoryService,
  ) {}

  async create(productData: CreateProductDto) {
    const existingProduct = await this.productRepository.findOne({
      where: { name: productData.name }
    });
  
    if (existingProduct) {
      throw new Error(ErrorCode.PRODUCT_ALREADY_EXIST);
    }
  
    const { productDetails, categoryId, ...productInfo } = productData;

    const slug = convertToSlug(productData.name);
    const category = await this.categoryService.findOne(categoryId);
    
    if (!category) {
      throw new Error(ErrorCode.CATEGORY_NOT_FOUND);
    }

    const productWithFullInfo = { ...productInfo, category, slug };
  
    const product = this.productRepository.create(productWithFullInfo);
    const savedProduct = await this.productRepository.save(product);
  
    const productDetailsData = [];

    for (const productDetail of productDetails) {
      const productDetailData = {
        ...productDetail,
        product: savedProduct
      };

      productDetailsData.push(productDetailData);
    }
  
    await Promise.all(
      productDetailsData.map(productDetail => 
        this.productDetailsService.create(productDetail)
      )
    );

    return savedProduct;
  }

  async findAll() {
    return await this.productRepository.find(
      {relations: {
        productDetails: true,
        category: true
      }}
    );
  }

  async findOne(productId: string) {
    return await this.productRepository.findOne({
      where: { id: productId },
      relations: {
        productDetails: true,
        category: true
      }
    });
  }

  async update(productId: string, productUpdateData: UpdateProductDto) {
    const product = await this.findOne(productId);

    if(!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }
    
    const {productDetails, categoryId, ...productInfo } = productUpdateData;

    const slug = productInfo.name ? convertToSlug(productUpdateData.name) : '';

    if (!categoryId){
      for (const productDetail of product.productDetails) {
        await this.productDetailsService.remove(productDetail.id);
      }
      const productUpdateInfo = { ...productInfo, slug };
  
      Object.assign(product, productUpdateInfo);

      const productUpdated = await this.productRepository.save(product);

      const productDetailsData = [];

      for (const productDetail of productDetails) {
        const productDetailData = {
          ...productDetail,
          product: productUpdated
        };

        productDetailsData.push(productDetailData);
      }
    
      await Promise.all(
        productDetailsData.map(productDetail => 
          this.productDetailsService.create(productDetail)
        )
      );
  
      return productUpdated;
    }
    else {
      const category = await this.categoryService.findOne(categoryId);
    
      if (!category) {
        throw new Error(ErrorCode.CATEGORY_NOT_FOUND);
      }

      for (const productDetail of product.productDetails) {
        await this.productDetailsService.remove(productDetail.id);
      }
      const productUpdateInfo = { ...productInfo, category, slug };
  
      Object.assign(product, productUpdateInfo);

      const productUpdated = await this.productRepository.save(product);

      const productDetailsData = [];

      for (const productDetail of productDetails) {
        const productDetailData = {
          ...productDetail,
          product: productUpdated
        };

        productDetailsData.push(productDetailData);
      }
    
      await Promise.all(
        productDetailsData.map(productDetail => 
          this.productDetailsService.create(productDetail)
        )
      );
    
      return productUpdated;
    }
  }

  async remove(productId: string) {
    const product = await this.findOne(productId);

    if(!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }

    return await this.productRepository.remove(product);  
  }
}
