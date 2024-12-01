import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ProductDetailsService } from '@/modules/product-details/product-details.service';
import { CategoryService } from '@/modules/category/category.service';

import { convertToSlug } from '@/utils';

import { ErrorCode, FilterPriceProduct, SortStylesProduct } from '@/common/enums';

import { Product } from './entities/product.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductListDto } from './dto/get-product-list.dto';

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

  private getSortOrder(sortStyle: string) {
    const sortStyles = {
      [SortStylesProduct.NEWEST]: { createdAt: 'DESC' },
      [SortStylesProduct.OLDEST]: { createdAt: 'ASC' },
      [SortStylesProduct.PRICE_ASC]: { price: 'ASC' },
      [SortStylesProduct.PRICE_DESC]: { price: 'DESC' },
      [SortStylesProduct.NAME_ASC]: { name: 'ASC' },
      [SortStylesProduct.NAME_DESC]: { name: 'DESC' },
      [SortStylesProduct.DEFAULT]: { createdAt: 'DESC' }
    };
    return sortStyles[sortStyle] || sortStyles[SortStylesProduct.DEFAULT];
  }

  private getFilterPrice(priceArray: string[]) {
    const filterPriceMap: Record<string, [number, number]> = {
      [FilterPriceProduct.LESS_THAN_100]: [0, 100],
      [FilterPriceProduct.FROM_100_TO_200]: [100, 200],
      [FilterPriceProduct.FROM_200_TO_500]: [200, 500],
      [FilterPriceProduct.FROM_500_TO_1000]: [500, 1000],
      [FilterPriceProduct.GREATER_THAN_1000]: [1000, 2147483647],
      [FilterPriceProduct.DEFAULT]: [0, 2147483647]
    };
    return priceArray.map((price) => filterPriceMap[price] || filterPriceMap['Default']);
  }

  async getProductList(params: GetProductListDto) {
    const { 
      page, 
      limit, 
      sortStyle, 
      categoryGender, 
      price, 
      categoryType, 
      colorName
    } = params;
  
    const pageNumber = parseInt(page.toString());
    const limitNumber = parseInt(limit.toString());
  
    const priceArray = price ? price.split(',') : [];
    const categoryTypeArray = categoryType ? categoryType.split(',') : [];
    const colorNameArray = colorName ? colorName.split(',') : [];
  
    const filterPrice = this.getFilterPrice(priceArray);
    const sortOrder = this.getSortOrder(sortStyle);
    
    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productDetails', 'productDetails')
      .leftJoinAndSelect('product.category', 'category');
  
    if (filterPrice.length > 0) {
      const priceConditions = filterPrice
        .map(
          (range, index) => `(product.price >= :min${index} AND product.price <= :max${index})`
        )
        .join(' OR ');
    
      queryBuilder.andWhere(`(${priceConditions})`, 
        Object.fromEntries(
          filterPrice.flatMap(([min, max], index) => [
            [`min${index}`, min], 
            [`max${index}`, max]
          ])
        )
      );
    }
    
    if (categoryGender) {
      queryBuilder.andWhere('category.gender = :gender', { gender: categoryGender });
    }
    
    if (categoryTypeArray && categoryTypeArray.length > 0) {
      queryBuilder.andWhere('category.type IN (:...categoryTypes)', { categoryTypes: categoryTypeArray });
    }
    
    if (colorNameArray && colorNameArray.length > 0) {
      queryBuilder.andWhere('productDetails.colorName IN (:...colors)', { colors: colorNameArray });
    }

    queryBuilder
      .skip((pageNumber - 1) * limitNumber)
      .take(limitNumber);

    if (sortOrder) {
      Object.entries(sortOrder).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`product.${key}`, value as 'ASC' | 'DESC');
      });
    }
    const [products, total] = await queryBuilder.getManyAndCount();
  
    return {
        data: products,
        total,
        page: pageNumber,
        limit: limitNumber,
    };
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
