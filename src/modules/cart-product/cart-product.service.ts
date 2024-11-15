import { Injectable } from '@nestjs/common';
import { ErrorCode } from '@/common/enums';
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

  async incrementQuantity(id: string, updateCartProductDto: UpdateCartProductDto) {
    return await this.cartProductRepository
      .createQueryBuilder()
      .update(CartProduct)
      .set({
        quantity: () => `quantity + ${updateCartProductDto.quantity}`,
      })
      .where("id = :id", { id })
      .execute();
  }

  async setQuantity(id: string, updateCartProductDto: UpdateCartProductDto) {
    await this.cartProductRepository
      .createQueryBuilder()
      .update(CartProduct)
      .set({
        quantity: updateCartProductDto.quantity,
      })
      .where("id = :id", { id })
      .execute();
  }

  async remove(id: string) {
    const existedCartProduct = await this.cartProductRepository.findOne({
      where: { id: id }
    });
    if (!existedCartProduct) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND)
    } else {
      await this.cartProductRepository.softRemove(existedCartProduct)
      return existedCartProduct.deletedAt
    }
  }

  async removeMultiple(ids: string[]) {
    const cartProducts = await this.cartProductRepository.findBy({ id: In(ids) });
    await this.cartProductRepository.softRemove(cartProducts);

    const deletedAtTimestamps = cartProducts.map(cartProduct => cartProduct.deletedAt);
    return deletedAtTimestamps;
  }
}
