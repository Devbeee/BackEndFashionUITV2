import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, UpdateQuantityAction } from '@/common/enums';
import { UsersService } from '@/modules/user/user.service';
import { UpdateCartProductDto } from '@/modules/cart-product/dto/update-cart-product.dto';
import { CartProductService } from '@/modules/cart-product/cart-product.service';

import { Cart } from './entities/cart.entity';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly cartProductService: CartProductService,
    private readonly usersService: UsersService,
  ) { }
  async create(userId: string, createCartDto: CreateCartDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }

    const existingCart = await this.findByUserId(userId);

    if (!existingCart) {
      const newCart = this.cartRepository.create({ user, ...createCartDto });
      const savedCart = await this.cartRepository.save(newCart);
      return this.addCartProduct(savedCart, createCartDto);
    }

    const existingCartProduct = existingCart.cartProducts?.find(
      (cp) => cp.productDetail.id === createCartDto.cartProduct.productDetailId
    );

    if (existingCartProduct) {
      return this.cartProductService.updateQuantity(
        existingCartProduct.id,
        createCartDto.cartProduct as UpdateCartProductDto,
        UpdateQuantityAction.INCREMENT
      );
    }

    return this.addCartProduct(existingCart, createCartDto);
  }

  private async addCartProduct(cart: Cart, createCartDto: CreateCartDto) {
    const cartProductData = {
      ...createCartDto.cartProduct,
      cart,
    };
    return await this.cartProductService.create(cartProductData);
  }

  async findByUserId(userId: string) {
    return await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: {
        cartProducts: {
          productDetail: {
            product: true,
          },
        },
      },
      select: {
        id: true,
        cartProducts: {
          id: true,
          quantity: true,
          productDetail: {
            colorName: true,
            size: true,
            stock: true,
            imgUrl: true,
            product: {
              name: true,
              price: true,
              discount: true,
            }
          }
        }
      },
    });
  }

  async update(cartProductId: string, updateCartDto: UpdateCartDto, userId: string) {
    const existingCart = await this.findByUserId(userId);
    const existingCartProduct = existingCart.cartProducts?.find(
      (cp) => cp.id === cartProductId
    );

    if (!existingCartProduct) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND)
    }

    return await this.cartProductService.updateQuantity(cartProductId, updateCartDto.cartProduct, UpdateQuantityAction.INCREMENT);
  }

  async remove(cartProductId: string, userId: string) {
    const existingCart = await this.findByUserId(userId);
    const existingCartProduct = existingCart.cartProducts?.find(
      (cp) => cp.id === cartProductId
    );

    if (!existingCartProduct) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND)
    }
    return await this.cartProductService.remove(cartProductId)
  }
  async removeMultiple(cartProductIds: string[], userId: string) {
    const existingCart = await this.findByUserId(userId);

    const missingIds = cartProductIds.filter((id) => 
      !existingCart.cartProducts.map(cp => cp.id).includes(id));

    if (missingIds.length) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND)
    }
    return await this.cartProductService.removeMultiple(cartProductIds)
  }

}
