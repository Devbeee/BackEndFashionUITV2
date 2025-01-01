import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ProductDetailsService } from '@/modules/product-details/product-details.service';

import { CreateCartProductDto } from './dto/create-cart-product.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';

import { CartProduct } from './entities/cart-product.entity';
import { Category } from '@/modules/category/entities/category.entity';

import { ErrorCode, UpdateQuantityAction } from '@/common/enums';
@Injectable()
export class CartProductService {
  constructor(
    @InjectRepository(CartProduct)
    private readonly cartProductRepository: Repository<CartProduct>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,

    private readonly productDetailService: ProductDetailsService,
  ) {}
  async create(createCartProductDto: CreateCartProductDto) {
    const productDetail = await this.productDetailService.findOne(
      createCartProductDto.productDetailId,
    );
    const category = await this.categoryRepository.findOne({
      where: {
        id: createCartProductDto.categoryId,
      },
    });
    if (!productDetail) {
      throw new Error(ErrorCode.PRODUCT_DETAIL_NOT_FOUND);
    }

    const newCartProduct = this.cartProductRepository.create({
      ...createCartProductDto,
      productDetail: productDetail,
      category: category,
    });

    return await this.cartProductRepository.save(newCartProduct);
  }

  async updateQuantity(
    id: string,
    updateCartProductDto: UpdateCartProductDto,
    action: UpdateQuantityAction,
  ) {
    const queryBuilder = this.cartProductRepository
      .createQueryBuilder()
      .update(CartProduct)
      .where('id = :id', { id });

    if (action === UpdateQuantityAction.INCREMENT) {
      queryBuilder.set({
        quantity: () => `quantity + ${updateCartProductDto.quantity}`,
      });
    } else if (action === UpdateQuantityAction.SET) {
      queryBuilder.set({
        quantity: updateCartProductDto.quantity,
      });
    }

    return await queryBuilder.execute();
  }

  async remove(id: string) {
    return await this.cartProductRepository.delete({ id: id });
  }

  async removeMultiple(ids: string[]) {
    return await this.cartProductRepository.delete({ id: In(ids) });
  }
}
