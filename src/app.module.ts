import { Module } from '@nestjs/common';

import { APP_GUARD } from '@nestjs/core';

import { ConfigModule } from '@nestjs/config';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';

import { DatabaseModule } from '@/database/database.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/user/user.module';
import { ContactModule } from './modules/contact/contact.module';

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
    ContactModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
