import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthGuard } from '@/modules/auth/auth.guard';
import { User } from '@/modules/user/entities/user.entity';
import { currentUser } from '@/modules/user/user.decorator';
import { StripeService } from '@/stripe/stripe.service';
import {
  CreateStripeUrlDto,
  RepayStripeDto,
  VerifyPaymentDto,
} from '@/stripe/dto';

@UseGuards(AuthGuard)
@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/create-payment-url')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Stripe payment url created successfully!',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  @ApiBody({
    description: 'Data to create stripe url',
    type: CreateStripeUrlDto,
  })
  async createStripeUrl(
    @Body() createOrderDto: CreateStripeUrlDto,
    @currentUser() user: User,
  ) {
    try {
      return await this.stripeService.createStripeUrl(createOrderDto, user);
    } catch (error) {
      throw error;
    }
  }

  @Post('/create-repay-url')
  @HttpCode(201)
  @ApiCreatedResponse({
    description: 'Stripe payment url created successfully!',
  })
  @ApiBadRequestResponse({ description: 'Missing input!' })
  @ApiBody({
    description: 'Data to create repay stripe url',
    type: RepayStripeDto,
  })
  async repayStripe(@Body() repayStripeDto: RepayStripeDto) {
    try {
      return await this.stripeService.repayStripe(repayStripeDto);
    } catch (error) {
      throw error;
    }
  }

  @Patch('/verify-payment')
  @HttpCode(200)
  @ApiBody({
    description: 'Data to create stripe url',
    type: CreateStripeUrlDto,
  })
  async verifyPayment(@Query() verifyPaymentDto: VerifyPaymentDto) {
    try {
      return await this.stripeService.verifyPayment(verifyPaymentDto);
    } catch (error) {
      throw error;
    }
  }
}
