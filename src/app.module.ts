import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

import { DatabaseModule } from '@/database/database.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { ProductDetailsModule } from './modules/product-details/product-details.module';
import { CategoryModule } from './modules/category/category.module';
import { ContactModule } from './modules/contact/contact.module';
import { BlogModule } from './modules/blog/blog.module';
import { CartModule } from './modules/cart/cart.module';
import { CartProductModule } from './modules/cart-product/cart-product.module';
import { AddressModule } from './modules/address/address.module';
import { OrderModule } from '@/modules/order/order.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { DiscountModule } from './modules/discount/discount.module';
import { StoreSystemModule } from './modules/store-system/store-system.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        port: +process.env.EMAIL_PORT,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: process.env.EMAIL_SENDER,
      },
      template: {
        dir: './dist/templates/',
        adapter: new EjsAdapter({ inlineCssEnabled: true }),
        options: {
          strict: false,
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: +process.env.TIME_TO_LIVE,
        limit: +process.env.RATE_LIMIT,
      },
    ]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    ProductModule,
    ProductDetailsModule,
    CategoryModule,
    ContactModule,
    BlogModule,
    CartModule,
    CartProductModule,
    AddressModule,
    OrderModule,
    StripeModule,
    DiscountModule,
    StoreSystemModule,
    DashboardModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
