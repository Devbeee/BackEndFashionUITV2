import { Injectable } from '@nestjs/common';
import { Brackets, DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import {
  CancelOrdersDto,
  CreateOrderDto,
  DeleteOrderDto,
  GetOrderDto,
  GetOrdersDto,
  RestoreOrderDto,
  UpdateOrderDto,
} from '@/modules/order/dto';

import { Order, OrderAddress, OrderProduct } from '@/modules/order/entities';
import { User } from '@/modules/user/entities/user.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';

import { CartService } from '@/modules/cart/cart.service';

import {
  ErrorCode,
  FilterOptions,
  OrderStatus,
  PaymentStatus,
  SortOptions,
} from '@/common/enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,

    @InjectRepository(OrderAddress)
    private readonly orderAddressRepository: Repository<OrderAddress>,

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
      const newOrderAddress = this.orderAddressRepository.create(order.address);
      await queryRunner.manager.save(newOrderAddress);

      const newOrder = this.orderRepository.create({
        user,
        address: newOrderAddress,
        message: order.message,
        paymentMethod: order.paymentMethod,
        totalPrice: order.totalPrice,
      });
      await queryRunner.manager.save(newOrder);

      const productDetails = await this.productDetailRepository.find({
        select: {
          id: true,
          colorName: true,
          color: true,
          size: true,
          stock: true,
          imgUrl: true,
          product: {
            name: true,
            price: true,
            slug: true,
            discount: true,
            category: {
              id: true,
            },
          },
        },
        relations: {
          product: {
            category: true,
          },
        },
        where: {
          id: In(order.products.map((product) => product.productDetailId)),
        },
      });
      const newOrderProducts = [];
      for (const product of order.products) {
        const orderProductDetail = productDetails.find(
          (productDetail) => productDetail.id === product.productDetailId,
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
            colorName: orderProductDetail.colorName,
            color: orderProductDetail.color,
            imgUrl: orderProductDetail.imgUrl,
            quantity: product.quantity,
            discount: orderProductDetail.product.discount,
            order: newOrder,
            category: {
              id: orderProductDetail.product.category.id,
            },
          }),
        );
        orderProductDetail.stock = orderProductDetail.stock - product.quantity;
        await queryRunner.manager.save(orderProductDetail);
      }

      await queryRunner.manager.save(newOrderProducts);

      const cartProductIds = order.products.map((item) => item.cartProductId);
      await this.cartService.removeMultiple(cartProductIds, user.id);
      await queryRunner.commitTransaction();
      return {
        orderId: newOrder.id,
        orderProducts: newOrderProducts,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(error.message);
    } finally {
      await queryRunner.release();
    }
  }
  async getAllOrders(getOrdersDto: GetOrdersDto) {
    let {
      page,
      keyword,
      limit,
      sortBy = SortOptions.DateDecrease,
      filter = FilterOptions.None,
    } = getOrdersDto;
    limit = parseInt(limit.toString()) || 4;
    page = parseInt(page.toString()) || 1;
    let skip = (page - 1) * limit;
    const queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select([
        'orders.id',
        'orders.createdAt',
        'orders.orderStatus',
        'orders.paymentMethod',
        'orders.paymentStatus',
        'orders.totalPrice',
        'orders.paidAt',
        'orders.deletedAt',
        'orderProduct.id',
        'orderProduct.name',
        'orderProduct.slug',
        'orderProduct.imgUrl',
        'orderProduct.price',
        'orderProduct.quantity',
        'orderProduct.colorName',
        'orderProduct.size',
        'orderProduct.discount',
        'user',
      ])
      .withDeleted()
      .leftJoin('orders.products', 'orderProduct')
      .leftJoin('orders.user', 'user')
      .leftJoin('orders.address', 'address');
    if (sortBy) {
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
    if (filter !== FilterOptions.None) {
      queryBuilder.andWhere('orders.orderStatus = :Filter', {
        Filter: filter,
      });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('CAST(orders.id AS TEXT) LIKE :keyword', {
            keyword: `%${keyword.toLowerCase()}%`,
          }).orWhere('LOWER(orderProduct.name) LIKE :keyword', {
            keyword: `%${keyword.toLowerCase()}%`,
          });
        }),
      );
    }

    queryBuilder.skip(skip).take(limit);
    queryBuilder.distinct(true);

    const [orders, totalOrder] = await queryBuilder.getManyAndCount();

    return {
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(orders.length / limit),
        limit: limit,
        totalOrders: totalOrder,
      },
      orders: orders,
    };
  }
  async getUserOrders(getOrdersDto: GetOrdersDto, user: User) {
    let {
      page,
      keyword,
      limit,
      sortBy = SortOptions.DateDecrease,
      filter = FilterOptions.None,
    } = getOrdersDto;
    limit = parseInt(limit.toString()) || 4;
    page = parseInt(page.toString()) || 1;
    let skip = (page - 1) * limit;
    const queryBuilder = this.orderRepository
      .createQueryBuilder('orders')
      .select([
        'orders.id',
        'orders.createdAt',
        'orders.orderStatus',
        'orders.paymentMethod',
        'orders.paymentStatus',
        'orders.totalPrice',
        'orders.paidAt',
        'orders.deletedAt',
        'orderProduct.id',
        'orderProduct.name',
        'orderProduct.slug',
        'orderProduct.imgUrl',
        'orderProduct.price',
        'orderProduct.quantity',
        'orderProduct.colorName',
        'orderProduct.size',
        'orderProduct.discount',
        'user',
      ])
      .leftJoin('orders.products', 'orderProduct')
      .leftJoin('orders.user', 'user')
      .leftJoin('orders.address', 'address')
      .where('orders.user.id = :UserId', {
        UserId: user.id,
      });
    if (sortBy) {
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
    if (filter !== FilterOptions.None) {
      queryBuilder.andWhere('orders.orderStatus = :Filter', {
        Filter: filter,
      });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('CAST(orders.id AS TEXT) LIKE :keyword', {
            keyword: `%${keyword.toLowerCase()}%`,
          }).orWhere('LOWER(orderProduct.name) LIKE :keyword', {
            keyword: `%${keyword.toLowerCase()}%`,
          });
        }),
      );
    }

    queryBuilder.skip(skip).take(limit);
    queryBuilder.distinct(true);

    const [orders, totalOrder] = await queryBuilder.getManyAndCount();

    return {
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(orders.length / limit),
        limit: limit,
        totalOrders: totalOrder,
      },
      orders: orders,
    };
  }
  async getOrder(getOrderDto: GetOrderDto) {
    const order = await this.orderRepository.findOne({
      select: {
        id: true,
        user: {
          id: true,
        },
        address: {
          id: true,
          name: true,
          phoneNumber: true,
          province: true,
          district: true,
          ward: true,
          addressDetail: true,
          latitude: true,
          longitude: true,
        },
        paymentStatus: true,
        paymentMethod: true,
        orderStatus: true,
        products: {
          name: true,
          colorName: true,
          color: true,
          discount: true,
          quantity: true,
          price: true,
          slug: true,
          size: true,
          imgUrl: true,
          id: true,
        },
        message: true,
        paymentSessionId: true,
        paymentInvoiceId: true,
        completedAt: true,
        totalPrice: true,
        paidAt: true,
        createdAt: true,
        deletedAt: true,
      },

      where: {
        id: getOrderDto.id,
      },
      relations: {
        address: true,
        user: true,
        products: true,
      },
    });
    return order;
  }
  private updatePaymentStatus(order: Order, paymentStatus: PaymentStatus) {
    if (paymentStatus === PaymentStatus.Paid) {
      order.paymentStatus = PaymentStatus.Paid;
      order.paidAt = new Date();
    } else {
      order.paymentStatus = PaymentStatus.Unpaid;
      order.paidAt = null;
      if (order.paymentInvoiceId) {
        order.paymentInvoiceId = null;
      }
    }
  }
  private updateOrderStatus(order: Order, orderStatus: OrderStatus) {
    if (orderStatus === OrderStatus.Delivered) {
      order.completedAt = new Date();
    } else if (order.orderStatus === OrderStatus.Delivered) {
      order.completedAt = null;
    }
    order.orderStatus = orderStatus;
  }
  async updateOrder(orderId: string, updateOrdersDto: UpdateOrderDto) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new Error(ErrorCode.ORDER_NOT_FOUND);
    }
    const { orderStatus, paymentStatus } = updateOrdersDto;
    if (!orderStatus && !paymentStatus) {
      throw new Error(ErrorCode.MISSING_PARAM_TO_UPDATE_ORDER);
    }
    if (paymentStatus && paymentStatus !== order.paymentStatus) {
      this.updatePaymentStatus(order, paymentStatus);
    }
    if (orderStatus && orderStatus !== order.orderStatus) {
      this.updateOrderStatus(order, orderStatus);
    }
    return this.orderRepository.save(order);
  }
  async cancelOrder(cancelOrdersDto: CancelOrdersDto) {
    const order = await this.orderRepository.findOneBy({
      id: cancelOrdersDto.id,
    });
    if (order.orderStatus === OrderStatus.Pending) {
      order.orderStatus = OrderStatus.Cancelled;
      return await this.orderRepository.save(order);
    } else {
      throw new Error(ErrorCode.ORDER_CAN_NOT_BE_CANCEL_AFTER_CONFIRMED);
    }
  }
  async deleteOrder(deleteOrderDto: DeleteOrderDto) {
    const order = await this.orderRepository.findOneBy({
      id: deleteOrderDto.id,
    });
    return await this.orderRepository.softRemove(order);
  }
  async restoreOrder(restoreOrderDto: RestoreOrderDto) {
    return await this.orderRepository.restore(restoreOrderDto.id);
  }
}
