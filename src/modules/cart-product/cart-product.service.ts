import { Injectable } from '@nestjs/common';
import { ErrorCode, UpdateQuantityAction } from '@/common/enums';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { ProductDetailsService } from '@/modules/product-details/product-details.service';

import { CreateCartProductDto } from './dto/create-cart-product.dto';
import { UpdateCartProductDto } from './dto/update-cart-product.dto';
import { CartProduct } from './entities/cart-product.entity';

@Injectable()
export class CartProductService {
  constructor(
    @InjectRepository(CartProduct)
    private readonly cartProductRepository: Repository<CartProduct>,
    private readonly productDetailService: ProductDetailsService,
  ) { }
  async create(createCartProductDto: CreateCartProductDto) {
    const productDetail = await this.productDetailService.findOne(createCartProductDto.productDetailId);

    if (!productDetail) {
      throw new Error(ErrorCode.PRODUCT_DETAIL_NOT_FOUND);
    }

    const newCartProduct = this.cartProductRepository.create({
      ...createCartProductDto,
      productDetail: productDetail,
    });

    return await this.cartProductRepository.save(newCartProduct);
  }

  async updateQuantity(
    id: string,
    updateCartProductDto: UpdateCartProductDto,
    action: UpdateQuantityAction
  ) {
    const queryBuilder = this.cartProductRepository
      .createQueryBuilder()
      .update(CartProduct)
      .where("id = :id", { id });

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
    const existedCartProduct = await this.cartProductRepository.findOne({
      where: { id: id }
    });
    if (!existedCartProduct) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND)
    } else {
      return await this.cartProductRepository.softRemove(existedCartProduct)
    }
  }

  async removeMultiple(ids: string[]) {
    const cartProducts = await this.cartProductRepository.findBy({ id: In(ids) });
    return await this.cartProductRepository.softRemove(cartProducts);
  }
}
