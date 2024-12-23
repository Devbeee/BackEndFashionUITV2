import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';

import { CustomExceptionFilter } from '@/common/exceptions';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    .setTitle('BackEndFashionUITV2 api')
    .setDescription('The BackEndFashionUITV2 API description')
    .setVersion('1.0')
    .addTag('BackEndFashionUITV2')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  const port = configService.get<number>('PORT') || 3000;

  SwaggerModule.setup('api', app, document);

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
