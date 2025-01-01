import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as basicAuth from 'express-basic-auth';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { CustomExceptionFilter } from '@/common/exceptions';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.use(
    ['/api-docs', '/docs-json'],
    basicAuth({
      challenge: true,
      users: { admin: process.env.BASIC_AUTH_PASSWORD },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BackEndFashionUITV2 api')
    .setDescription('The BackEndFashionUITV2 API description')
    .setVersion('1.0')
    .addTag('BackEndFashionUITV2')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const port = configService.get<number>('PORT') || 3000;

  SwaggerModule.setup('api-docs', app, document);

  app.enableCors({
    origin: process.env.CLIENT_URLS.split(','),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new CustomExceptionFilter());
  await app.listen(port);
}
bootstrap();
