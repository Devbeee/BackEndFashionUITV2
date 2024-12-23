import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export const StripeProvider = {
  provide: 'STRIPE_CLIENT',
  useFactory: (configService: ConfigService) => {
    const secretKey = configService.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    return new Stripe(secretKey);
  },
  inject: [ConfigService],
};
