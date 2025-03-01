import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { convertToSlug } from '@/utils';

import {
  ErrorCode,
  FilterPriceProduct,
  SortStylesProduct,
} from '@/common/enums';

import { Product } from './entities/product.entity';
import { Discount } from '@/modules/discount/entities/discount.entity';
import { OrderProduct } from '../order/entities';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductListDto } from './dto/get-product-list.dto';
import { GetBySearchQueryDto } from './dto/get-by-search-query.dto';
import { GetRelatedProductsDto } from './dto/get-related-products.dto';

import { ProductDetailsService } from '@/modules/product-details/product-details.service';
import { CategoryService } from '@/modules/category/category.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    private readonly productDetailsService: ProductDetailsService,
    private readonly categoryService: CategoryService,
  ) {}

  async create(productData: CreateProductDto) {
    const existingProduct = await this.productRepository.findOne({
      where: { name: productData.name },
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
        product: savedProduct,
      };

      productDetailsData.push(productDetailData);
    }

    await Promise.all(
      productDetailsData.map((productDetail) =>
        this.productDetailsService.create(productDetail),
      ),
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
      [SortStylesProduct.DEFAULT]: { createdAt: 'DESC' },
    };
    return sortStyles[sortStyle] || sortStyles[SortStylesProduct.DEFAULT];
  }

  private getFilterPrice(priceArray: string[]) {
    const filterPriceMap: Record<string, [number, number]> = {
      [FilterPriceProduct.LESS_THAN_100]: [0, 100000],
      [FilterPriceProduct.FROM_100_TO_200]: [100000, 200000],
      [FilterPriceProduct.FROM_200_TO_500]: [200000, 500000],
      [FilterPriceProduct.FROM_500_TO_1000]: [500000, 1000000],
      [FilterPriceProduct.GREATER_THAN_1000]: [1000000, 2147483647],
      [FilterPriceProduct.DEFAULT]: [0, 2147483647],
    };
    return priceArray.map(
      (price) => filterPriceMap[price] || filterPriceMap['DEFAULT'],
    );
  }

  async getProductList(params: GetProductListDto) {
    const limit = 12;
    const { page, sortStyle, categoryGender, price, categoryType, colorName } =
      params;

    const priceArray = price ? price.split(',') : [];
    const categoryTypeArray = categoryType
      ? categoryType.split(',').map((item) => item.trim().toLowerCase())
      : [];
    const colorNameArray = colorName ? colorName.split(',') : [];

    const filterPrice = this.getFilterPrice(priceArray);
    const sortOrder = this.getSortOrder(sortStyle);

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productDetails', 'productDetails')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.discounts', 'discounts');

    if (filterPrice.length > 0) {
      const priceConditions = filterPrice
        .map(
          (_, index) =>
            `(product.price >= :min${index} AND product.price <= :max${index})`,
        )
        .join(' OR ');

      queryBuilder.andWhere(
        `(${priceConditions})`,
        Object.fromEntries(
          filterPrice.flatMap(([min, max], index) => [
            [`min${index}`, min],
            [`max${index}`, max],
          ]),
        ),
      );
    }

    if (categoryGender) {
      queryBuilder.andWhere('category.gender = :gender', {
        gender: categoryGender.toLowerCase(),
      });
    }

    if (categoryTypeArray && categoryTypeArray.length > 0) {
      queryBuilder.andWhere('category.type IN (:...categoryTypes)', {
        categoryTypes: categoryTypeArray,
      });
    }

    if (colorNameArray && colorNameArray.length > 0) {
      queryBuilder.andWhere('productDetails.colorName IN (:...colors)', {
        colors: colorNameArray,
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    if (sortOrder) {
      Object.entries(sortOrder).forEach(([key, value]) => {
        queryBuilder.addOrderBy(`product.${key}`, value as 'ASC' | 'DESC');
      });
    }
    const [products, total] = await queryBuilder.getManyAndCount();

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const effectiveDiscount = await this.getEffectiveDiscount(product.id);
        return { ...product, discount: effectiveDiscount };
      }),
    );

    return {
      data: updatedProducts,
      total,
      page: page,
    };
  }

  async getProductSearch(searchQuery: GetBySearchQueryDto) {
    const limit = searchQuery.page ? 16 : 4;
    const queryBuilder = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productDetails', 'productDetails')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.discounts', 'discounts');

    queryBuilder.andWhere('product.name ILIKE :searchQuery', {
      searchQuery: `%${searchQuery.searchQuery}%`,
    });

    if (searchQuery.page) {
      queryBuilder.skip((searchQuery.page - 1) * limit).take(limit);
    } else {
      queryBuilder.take(limit);
    }

    const [products, total] = await queryBuilder.getManyAndCount();

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const effectiveDiscount = await this.getEffectiveDiscount(product.id);
        return { ...product, discount: effectiveDiscount };
      }),
    );

    return {
      data: updatedProducts,
      total,
      page: searchQuery.page,
    };
  }

  async getDiscountedProducts() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    const products = await this.productRepository
    .createQueryBuilder('product')
    .leftJoinAndSelect('product.category', 'category')
    .leftJoinAndSelect('product.discounts', 'discounts')
    .leftJoinAndSelect('product.productDetails', 'productDetails')
    .getMany();

    const discountProducts = products.filter((product) =>
      product.discounts.some(
        (discount) =>
          discount.date.toISOString().startsWith(currentDate) &&
          discount.discountValue > product.discount,
      ),
    );

    const updatedProducts = await Promise.all(
      discountProducts.map(async (product) => {
        const effectiveDiscount = await this.getEffectiveDiscount(product.id);
        return { ...product, discount: effectiveDiscount };
      }),
    );

    return updatedProducts;
  }

  async getTopSellingProducts() {
    const salesData = await this.orderProductRepository
      .createQueryBuilder('orderProduct')
      .select('orderProduct.slug', 'slug')
      .addSelect('SUM(orderProduct.quantity)', 'sold_quantity')
      .groupBy('orderProduct.slug')
      .orderBy('sold_quantity', 'DESC')
      .limit(6)
      .getRawMany();

    if (!salesData.length) {
      const products = await this.productRepository.find({
        relations: ['category', 'productDetails', 'discounts'],
        take: 6,
        order: { createdAt: 'ASC' },
      });

      const updatedProducts = await Promise.all(
        products.map(async (product) => {
          const effectiveDiscount = await this.getEffectiveDiscount(product.id);
          return { ...product, discount: effectiveDiscount };
        }),
      );

      return updatedProducts.map((product) => ({
        ...product,
        sold: 0,
      }));
    }

    const topProducts = await Promise.all(
      salesData.map(async (sale) => {
        const product = await this.productRepository.findOne({
          where: { slug: sale.slug },
          relations: ['category', 'productDetails', 'discounts'],
        });

        return {
          ...product,
          sold: Number(sale.sold_quantity),
        };
      }),
    );

    const updatedProducts = await Promise.all(
      topProducts.map(async (product) => {
        const effectiveDiscount = await this.getEffectiveDiscount(product.id);
        return { ...product, discount: effectiveDiscount };
      }),
    );

    return updatedProducts;
  }

  async findAll() {
    return await this.productRepository.find({
      relations: {
        productDetails: true,
        category: true,
      },
    });
  }

  async findOne(productId: string) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: {
        productDetails: true,
        category: true,
      },
    });
    if (!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }
    return product;
  }

  async update(productId: string, productUpdateData: UpdateProductDto) {
    const product = await this.findOne(productId);

    if (!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }

    const { productDetails, categoryId, ...productInfo } = productUpdateData;

    const slug = productInfo.name ? convertToSlug(productUpdateData.name) : '';

    const category = await this.categoryService.findOne(categoryId);

    if (!category) {
      throw new Error(ErrorCode.CATEGORY_NOT_FOUND);
    }

    await Promise.all(
      product.productDetails.map((detail) =>
        this.productDetailsService.remove(detail.id),
      ),
    );

    const productUpdateInfo = { ...productInfo, category, slug };

    Object.assign(product, productUpdateInfo);

    const productUpdated = await this.productRepository.save(product);

    const productDetailsData = [];

    for (const productDetail of productDetails) {
      const productDetailData = {
        ...productDetail,
        product: productUpdated,
      };

      productDetailsData.push(productDetailData);
    }

    await Promise.all(
      productDetailsData.map((productDetail) =>
        this.productDetailsService.create(productDetail),
      ),
    );

    return productUpdated;
  }

  async remove(productId: string) {
    const product = await this.findOne(productId);

    if (!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }

    return await this.productRepository.remove(product);
  }

  async getEffectiveDiscount(productId: string): Promise<number> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['discounts'],
    });

    if (!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.getHours();

    const applicableDiscount = product.discounts.find(
      (discount) =>
        this.isWithinTimeRange(discount.timeRange, currentTime) &&
        discount.date.toISOString().startsWith(currentDate),
    );

    if (
      applicableDiscount &&
      applicableDiscount.discountValue > product.discount
    ) {
      return applicableDiscount.discountValue;
    }

    return product.discount;
  }

  private isWithinTimeRange(range: string, currentTime: number): boolean {
    const [start, end] = range
      .split('-')
      .map((time) => parseInt(time.replace('h', ''), 10));

    if (start <= currentTime && currentTime < end) {
      return true;
    }

    if (start > end) {
      return currentTime >= start || currentTime < end;
    }

    return false;
  }

  async findOneBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['productDetails', 'category', 'discounts'],
    });

    if (!product) {
      throw new Error(ErrorCode.PRODUCT_NOT_FOUND);
    }
    const effectiveDiscount = await this.getEffectiveDiscount(product.id);
    return { ...product, discount: effectiveDiscount };
  }

  async findRelatedProducts(params: GetRelatedProductsDto) {
    const { page, limit, productId, categoryGender, categoryType } = params;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productDetails', 'productDetails')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.discounts', 'discounts');

    if (productId) {
      queryBuilder.andWhere('product.id != :productId', { productId });
    }

    if (categoryGender) {
      queryBuilder.andWhere('category.gender = :gender', {
        gender: categoryGender,
      });
    }

    if (categoryType) {
      queryBuilder.andWhere('category.type = :categoryType', {
        categoryType: categoryType,
      });
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    const updatedProducts = await Promise.all(
      products.map(async (product) => {
        const effectiveDiscount = await this.getEffectiveDiscount(product.id);
        return { ...product, discount: effectiveDiscount };
      }),
    );

    return {
      data: updatedProducts,
      total,
      page: page,
    };
  }
}
