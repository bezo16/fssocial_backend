import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

const config = new DocumentBuilder()
  .setTitle('Social Platform API')
  .setDescription('API documentation for the Social Platform')
  .setVersion('1.0')
  .addTag('beta')
  .addBearerAuth()
  .build();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // middleware
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  // pipes
  app.useGlobalPipes(new ValidationPipe());

  // swagger
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
