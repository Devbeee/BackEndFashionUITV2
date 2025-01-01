import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { Role } from '@/common/enums';
import { AuthGuard } from '@/modules/auth/auth.guard';
import { Roles } from '@/modules/auth/roles.decorator';
import { RolesGuard } from '@/modules/auth/roles.guard';

import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Admin)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('quantity-stat')
  async getQuantity() {
    const [quantityCustomer, quantityProduct, quantityOrder, revenue] =
      await Promise.all([
        this.dashboardService.getQuantityUser(),
        this.dashboardService.getQuantityProduct(),
        this.dashboardService.getQuantityOrder(),
        this.dashboardService.getRevenue(),
      ]);
    return [
      {
        title: 'Customers',
        type: 'customer',
        quantity: quantityCustomer,
      },
      {
        title: 'Products',
        type: 'product',
        quantity: quantityProduct,
      },
      {
        title: 'Orders',
        type: 'order',
        quantity: quantityOrder,
      },
      {
        title: 'Revenue',
        type: 'revenue',
        quantity: revenue.toLocaleString('de-DE'),
      },
    ];
  }

  @Get('chart-order/:filter')
  async getChartOrder(@Param('filter') filter: 'thisWeek' | 'lastWeek') {
    return await this.dashboardService.getChartOrder(filter);
  }

  @Get('chart-category')
  async getChartCategory() {
    return await this.dashboardService.getChartCategory();
  }

  @Get('customers-stat')
  async getCustomersStat() {
    return await this.dashboardService.getCustomersStat();
  }

  @Get('products-stat')
  async getProductsStat() {
    return await this.dashboardService.getProductStat();
  }
}
