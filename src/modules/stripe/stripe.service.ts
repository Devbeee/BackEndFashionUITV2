import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Inject, Injectable } from '@nestjs/common';

import Stripe from 'stripe';

import { Order } from '@/modules/order/entities';
import { User } from '@/modules/user/entities/user.entity';

import { OrderService } from '@/modules/order/order.service';

import {
  OrderStatus,
  PaymentStatus,
  VerifyPaymentStatus,
} from '@/common/enums';
import {
  VerifyPaymentDto,
  CreateStripeUrlDto,
  RepayStripeDto,
} from '@/modules/stripe/dto';

@Injectable()
export class StripeService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    private readonly orderService: OrderService,
    @Inject('STRIPE_CLIENT')
    private readonly stripe: Stripe,
  ) {}
  async createStripeUrl(createStripeUrlDto: CreateStripeUrlDto, user: User) {
    const order = await this.orderService.create(createStripeUrlDto, user);
    const lineItems = order.orderProducts.map((item) => {
      return {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: item.name,
            description: `price: ${item.price}, discount: ${item.discount}%`,
          },
          unit_amount: Math.ceil((item.price * (100 - item.discount)) / 100),
        },
        quantity: item.quantity,
      };
    });
    const returnUrl = `${process.env.CLIENT_URLS.split(',')[0]}/verify-payment/?orderId=${order.orderId}&sessionId={CHECKOUT_SESSION_ID}`;
    const session = await this.stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        order_id: order.orderId,
      },

      expand: ['payment_intent'],

      success_url: returnUrl,
      cancel_url: returnUrl,
    });
    const existedOrder = await this.orderRepository.findOne({
      where: {
        id: order.orderId,
      },
    });
    existedOrder.paymentSessionId = session.id;
    this.orderRepository.save(existedOrder);
    return session.url;
  }
  async repayStripe(repayStripeDto: RepayStripeDto) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const order = await this.orderRepository.findOne({
      relations: ['products', 'address'],
      where: {
        id: repayStripeDto.orderId,
      },
    });
    const lineItems = order.products.map((item) => {
      return {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: item.name,
            description: `price: ${item.price}, discount: ${item.discount}%`,
          },
          unit_amount: Math.ceil((item.price * (100 - item.discount)) / 100),
        },
        quantity: item.quantity,
      };
    });
    const returnUrl = `${process.env.CLIENT_URLS.split(',')[0]}/verify-payment/?orderId=${order.id}&sessionId={CHECKOUT_SESSION_ID}`;
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      metadata: {
        order_id: order.id,
      },
      expand: ['payment_intent'],
      success_url: returnUrl,
      cancel_url: returnUrl,
    });

    order.paymentSessionId = session.id;
    this.orderRepository.save(order);

    return session.url;
  }

  async verifyPayment(verifyPaymentDto: VerifyPaymentDto) {
    const { orderId } = verifyPaymentDto;

    const order = await this.orderRepository.findOne({
      where: {
        id: orderId,
      },
    });
    const session = await this.stripe.checkout.sessions.retrieve(
      order.paymentSessionId,
    );

    if (session.payment_status === 'paid') {
      const paymentIntentId = session.payment_intent as Stripe.PaymentIntent;

      await this.stripe.paymentIntents.update(paymentIntentId.toString(), {
        metadata: {
          order_id: orderId,
        },
      });
      if (order.paymentStatus === PaymentStatus.Unpaid) {
        order.paymentStatus = PaymentStatus.Paid;
        order.paymentInvoiceId = paymentIntentId.toString();
        order.orderStatus = OrderStatus.Confirmed;
        order.paidAt = new Date();
        await this.orderRepository.save(order);
        return {
          status: VerifyPaymentStatus.Success,
          message: 'Thanh toán thành công',
        };
      } else {
        return {
          status: VerifyPaymentStatus.Success,
          message: 'Đơn hàng đã được thanh toán',
        };
      }
    } else {
      return {
        status: VerifyPaymentStatus.Failed,
        message: 'Thanh toán không thành công',
      };
    }
  }
}
