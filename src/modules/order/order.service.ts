import { Injectable } from '@nestjs/common';

import { DataSource, Equal, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ErrorCode, OrderStatus, SortOptions } from '@/common/enums';
import { Order } from '@/modules/order/entities/order.entity';
import { User } from '@/modules/user/entities/user.entity';
import { OrderProduct } from '@/modules/order/entities/order-product.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';
import { CreateOrderDto } from '@/modules/order/dto/create-order.dto';
import { CartService } from '@/modules/cart/cart.service';
import { GetOrdersDto } from '@/modules/order/dto/get-orders.dto';
import { CancelOrdersDto } from '@/modules/order/dto/cancel-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,
    private readonly cartService: CartService,
    private readonly connection: DataSource,
  ) {}
  async create(order: CreateOrderDto, user: User) {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newOrder = this.orderRepository.create({
        user,
        address: order.address,
        message: order.message,
        paymentMethod: order.paymentMethod,
        totalPrice: order.totalPrice,
      });
      await queryRunner.manager.save(newOrder);

      const productDetails = await this.productDetailRepository.find({
        select: {
          id: true,
          colorName: true,
          size: true,
          stock: true,
          imgUrl: true,
          product: {
            name: true,
            price: true,
            slug: true,
            discount: true,
          },
        },
        relations: { product: true },
        where: {
          id: In(order.products.map((product) => product.productDetailId)),
        },
      });

      const newOrderProducts = [];
      for (const product of order.products) {
        const orderProductDetail = productDetails.find(
          (detail) => detail.id === product.productDetailId,
        );

        if (
          !orderProductDetail ||
          orderProductDetail.stock < product.quantity
        ) {
          throw new Error(ErrorCode.OUT_OF_STOCK);
        }

        newOrderProducts.push(
          this.orderProductRepository.create({
            name: orderProductDetail.product.name,
            price: orderProductDetail.product.price,
            slug: orderProductDetail.product.slug,
            size: orderProductDetail.size,
            color: orderProductDetail.colorName,
            imgUrl: orderProductDetail.imgUrl,
            quantity: product.quantity,
            discount: orderProductDetail.product.discount,
            order: newOrder,
          }),
        );
      }

      await queryRunner.manager.save(newOrderProducts);

      const cartProductIds = order.products.map((item) => item.cartProductId);
      await this.cartService.removeMultiple(cartProductIds, user.id);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      return error;
    } finally {
      await queryRunner.release();
    }
  }
  async getAllOrders(user: User) {
    try {
      const orders = await this.orderRepository.find({
        select: {
          id: true,
          address: {
            name: true,
            phoneNumber: true,
            province: true,
            district: true,
            ward: true,
            addressDetail: true,
          },
          orderStatus: true,
          paymentMethod: true,
          paymentStatus: true,
          totalPrice: true,
          message: true,
          products: {
            name: true,
            slug: true,
            imgUrl: true,
            price: true,
            quantity: true,
            color: true,
            size: true,
            discount: true,
          },
        },
        relations: ['products', 'address'],

        where: {
          user: Equal(user.id),
        },
      });
      return orders;
    } catch (error) {
      return error;
    }
  }

  async getOrders(getOrdersDto: GetOrdersDto, user: User) {
    let { page, keyword, limit = 4, sortBy = SortOptions.None } = getOrdersDto;
    let skip = (page - 1) * limit;
    try {
      const queryBuilder = this.orderRepository
        .createQueryBuilder('orders')
        .select([
          'orders.id',
          'orders.createdAt',
          'address.name',
          'address.phoneNumber',
          'address.province',
          'address.district',
          'address.ward',
          'address.addressDetail',
          'orders.orderStatus',
          'orders.paymentMethod',
          'orders.paymentStatus',
          'orders.totalPrice',
          'orders.message',
          'orderProduct.id',
          'orderProduct.name',
          'orderProduct.slug',
          'orderProduct.imgUrl',
          'orderProduct.price',
          'orderProduct.quantity',
          'orderProduct.color',
          'orderProduct.size',
          'orderProduct.discount',
        ])

        .leftJoin('orders.products', 'orderProduct')
        .leftJoin('orders.address', 'address')
        .where('orders.user = :userId', { userId: user.id });
      if (sortBy !== SortOptions.None) {
        switch (sortBy) {
          case SortOptions.DateDecrease: {
            queryBuilder.orderBy(`orders.createdAt`, 'DESC');
            break;
          }
          case SortOptions.DateIncrease: {
            queryBuilder.orderBy(`orders.createdAt`, 'ASC');
            break;
          }
          case SortOptions.PriceDecrease: {
            queryBuilder.orderBy(`orders.totalPrice`, 'DESC');
            break;
          }
          case SortOptions.PriceIncrease: {
            queryBuilder.orderBy(`orders.totalPrice`, 'ASC');
            break;
          }
        }
      }

      queryBuilder.distinct(true);

      let [orders] = await queryBuilder.getManyAndCount();
      let filteredOrders = orders;
      if (keyword) {
        filteredOrders = orders.filter((order) => {
          const matchingProducts = order.products.some((product) =>
            product.name.toLowerCase().includes(keyword.toLowerCase()),
          );

          const matchingOrderId = order.id
            .toLowerCase()
            .includes(keyword.toLowerCase());

          return matchingProducts || matchingOrderId;
        });
      }
      if (skip < orders.length) {
        orders = filteredOrders.slice(skip, skip + limit);
      } else {
        page = 1;
        skip = (page - 1) * limit;
        orders = filteredOrders.slice(skip, skip + limit);
      }
      return {
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(filteredOrders.length / limit),
          limit: limit,
          totalOrders: filteredOrders.length,
        },
        orders,
      };
    } catch (error) {
      return error;
    }
  }

  async cancelOrder(cancelOrdersDto: CancelOrdersDto) {
    try {
      const order = await this.orderRepository.findOneBy({
        id: cancelOrdersDto.id,
      });
      if (order.orderStatus === OrderStatus.Pending) {
        order.orderStatus = OrderStatus.Canceled;
        return await this.orderRepository.save(order);
      } else {
        throw new Error(ErrorCode.ORDER_CAN_NOT_BE_CANCEL_AFTER_CONFIRMED);
      }
    } catch (error) {
      return error;
    }
  }
}
