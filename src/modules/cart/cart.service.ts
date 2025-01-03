import { ProductService } from './../product/product.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErrorCode, UpdateQuantityAction } from '@/common/enums';
import { UsersService } from '@/modules/user/user.service';
import { UpdateCartProductDto } from '@/modules/cart-product/dto/update-cart-product.dto';
import { CartProductService } from '@/modules/cart-product/cart-product.service';
import { ProductDetailsService } from '@/modules/product-details/product-details.service';

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
    private readonly productService: ProductService,
    private readonly productDetailsService: ProductDetailsService,
  ) {}
  async create(userId: string, createCartDto: CreateCartDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error(ErrorCode.USER_NOT_FOUND);
    }

    const productDetail = await this.productDetailsService.findOne(
      createCartDto.cartProduct.productDetailId,
    );

    if (productDetail.stock < createCartDto.cartProduct.quantity) {
      throw new Error(ErrorCode.OUT_OF_STOCK);
    }

    const existingCart = await this.findByUserId(userId);

    if (!existingCart) {
      const newCart = this.cartRepository.create({ user, ...createCartDto });
      const savedCart = await this.cartRepository.save(newCart);
      await this.addCartProduct(savedCart, createCartDto);

      const cart = await this.findByUserId(userId);
      return { cartProductLength: cart.cartProducts.length };
    }

    const existingCartProduct = existingCart.cartProducts?.find(
      (cp) => cp.productDetail.id === createCartDto.cartProduct.productDetailId,
    );

    if (existingCartProduct) {
      if (
        existingCartProduct.quantity >= existingCartProduct.productDetail.stock
      )
        throw new Error(ErrorCode.OUT_OF_STOCK);
      await this.cartProductService.updateQuantity(
        existingCartProduct.id,
        createCartDto.cartProduct as UpdateCartProductDto,
        UpdateQuantityAction.INCREMENT,
      );

      const cart = await this.findByUserId(userId);
      return { cartProductLength: cart.cartProducts.length };
    }

    await this.addCartProduct(existingCart, createCartDto);

    const cart = await this.findByUserId(userId);
    return { cartProductLength: cart.cartProducts.length };
  }

  private async addCartProduct(cart: Cart, createCartDto: CreateCartDto) {
    const cartProductData = {
      ...createCartDto.cartProduct,
      cart,
    };
    return await this.cartProductService.create(cartProductData);
  }

  async findByUserId(userId: string) {
    const cartItems = await this.cartRepository.findOne({
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
            id: true,
            colorName: true,
            size: true,
            stock: true,
            imgUrl: true,
            product: {
              id: true,
              name: true,
              price: true,
              discount: true,
              slug: true,
            },
          },
        },
      },
    });

    if (!cartItems) {
      return null;
    }

    const updatedCartProducts = await Promise.all(
      cartItems.cartProducts.map(async (cartProduct) => {
        const productDetail = cartProduct.productDetail;
        const product = productDetail.product;
        const effectiveDiscount =
          await this.productService.getEffectiveDiscount(product.id);

        return {
          ...cartProduct,
          productDetail: {
            ...productDetail,
            product: {
              ...product,
              discount: effectiveDiscount,
            },
          },
        };
      }),
    );

    return {
      id: cartItems.id,
      cartProducts: updatedCartProducts,
    } as Cart;
  }

  async update(
    cartProductId: string,
    updateCartDto: UpdateCartDto,
    userId: string,
  ) {
    const existingCart = await this.findByUserId(userId);
    const existingCartProduct = existingCart.cartProducts?.find(
      (cp) => cp.id === cartProductId,
    );

    if (!existingCartProduct) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND);
    }

    return await this.cartProductService.updateQuantity(
      cartProductId,
      updateCartDto.cartProduct,
      UpdateQuantityAction.SET,
    );
  }

  async remove(cartProductId: string, userId: string) {
    const existingCart = await this.findByUserId(userId);
    const existingCartProduct = existingCart.cartProducts?.find(
      (cp) => cp.id === cartProductId,
    );

    if (!existingCartProduct) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND);
    }
    return await this.cartProductService.remove(cartProductId);
  }
  async removeMultiple(cartProductIds: string[], userId: string) {
    const existingCart = await this.findByUserId(userId);

    const existingProductIds = new Set(
      existingCart.cartProducts.map((cp) => cp.id),
    );

    const missingIds = cartProductIds.filter(
      (id) => !existingProductIds.has(id),
    );

    if (missingIds.length > 0) {
      throw new Error(ErrorCode.CART_PRODUCT_NOT_FOUND);
    }

    return this.cartProductService.removeMultiple(cartProductIds);
  }
}
