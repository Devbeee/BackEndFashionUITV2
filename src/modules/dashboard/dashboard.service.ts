import * as dayjs from 'dayjs';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Role } from '@/common/enums';
import { getDateRange } from '@/utils';
import { OrderProduct } from '@/modules/order/entities';
import { User } from '@/modules/user/entities/user.entity';
import { Order } from '@/modules/order/entities/order.entity';
import { Product } from '@/modules/product/entities/product.entity';
import { ProductDetail } from '@/modules/product-details/entities/product-detail.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductDetail)
    private readonly productDetailRepository: Repository<ProductDetail>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
  ) {}

  async getQuantityUser() {
    return this.userRepository.count({
      where: [{ role: Role.User }],
      withDeleted: true,
    });
  }

  async getQuantityProduct() {
    return this.productRepository.count({
      withDeleted: true,
    });
  }

  async getQuantityOrder() {
    return this.orderRepository.count({
      withDeleted: true,
    });
  }

  async getRevenue() {
    return this.orderRepository.sum('totalPrice');
  }

  async getChartOrder(
    filter: 'thisWeek' | 'lastWeek' | 'thisYear' | 'lastYear',
  ) {
    const today = dayjs();

    const dateRange = getDateRange(filter, today);

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt BETWEEN :start AND :end', {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      })
      .getMany();

    return filter === 'thisWeek' || filter === 'lastWeek'
      ? this.getWeeklyChart(orders, dateRange.start)
      : this.getYearlyChart(orders);
  }

  private getWeeklyChart(orders: Order[], startDate: dayjs.Dayjs) {
    const revenue = this.calculateRevenueByDay(orders, startDate);
    const profit = revenue.map((revenue) => revenue * 0.3);

    return {
      labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
      revenue,
      profit,
    };
  }

  private getYearlyChart(orders: Order[]) {
    const revenue = this.calculateRevenueByMonth(orders);
    const profit = revenue.map((revenue) => revenue * 0.3);

    return {
      labels: [
        'JAN',
        'FEB',
        'MAR',
        'APR',
        'MAY',
        'JUN',
        'JUL',
        'AUG',
        'SEP',
        'OCT',
        'NOV',
        'DEC',
      ],
      revenue,
      profit,
    };
  }

  async getChartCategory() {
    const queryResult = await this.orderProductRepository
      .createQueryBuilder('order_product')
      .innerJoin(
        'category',
        'category',
        'order_product.categoryId = category.id',
      )
      .select('category.gender', 'gender')
      .addSelect('SUM(order_product.quantity) as total')
      .where('category.deletedAt IS NULL')
      .groupBy('category.gender')
      .orderBy('total', 'DESC')
      .getRawMany();

    const genderMap: Record<string, string> = {
      nữ: 'Woman',
      nam: 'Man',
      'trẻ em': 'Child',
    };

    const labels = queryResult.map(
      (item) => genderMap[item.gender] || item.gender,
    );
    const data = queryResult.map((item) => Number(item.total) || 0);

    return {
      labels,
      data,
    };
  }

  async getCustomersStat() {
    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.orders', 'order')
      .select('user.id', 'id')
      .addSelect('user.fullName', 'fullName')
      .addSelect('user.email', 'email')
      .addSelect('user.avatar', 'avatar')
      .addSelect('CAST(SUM(order.totalPrice) AS FLOAT) as totalSpent')
      .groupBy('user.id')
      .addGroupBy('user.fullName')
      .addGroupBy('user.email')
      .orderBy('totalSpent', 'DESC')
      .limit(10)
      .getRawMany();
  }

  async getProductStat() {
    return await this.orderProductRepository
      .createQueryBuilder('order_product')
      .innerJoin(
        'category',
        'category',
        'order_product.categoryId = category.id',
      )
      .select('order_product.slug', 'slug')
      .addSelect('order_product.name', 'name')
      .addSelect('order_product.imgUrl', 'imgUrl')
      .addSelect('order_product.price', 'price')
      .addSelect('category.gender', 'category')
      .addSelect('SUM(order_product.quantity) as sold')
      .groupBy('order_product.slug')
      .addGroupBy('order_product.name')
      .addGroupBy('order_product.imgUrl')
      .addGroupBy('order_product.price')
      .addGroupBy('category.gender')
      .orderBy('sold', 'DESC')
      .limit(10)
      .getRawMany();
  }

  private calculateRevenueByDay(
    orders: Order[],
    startOfWeek: dayjs.Dayjs,
  ): number[] {
    const revenueByDay = Array(7).fill(0);

    orders.forEach((order) => {
      const orderDate = dayjs(order.createdAt);
      const dayIndex = orderDate.diff(startOfWeek, 'day');
      if (dayIndex >= 0 && dayIndex < 7) {
        revenueByDay[dayIndex] += order.totalPrice;
      }
    });

    return revenueByDay;
  }

  private calculateRevenueByMonth(orders: Order[]): number[] {
    const revenueByMonth = Array(12).fill(0);

    orders.forEach((order) => {
      const monthIndex = dayjs(order.createdAt).month();
      revenueByMonth[monthIndex] += order.totalPrice;
    });

    return revenueByMonth;
  }
}
