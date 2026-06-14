import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import YAML from 'yamljs';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => new BadRequestException(errors),
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API Documentation')
    .setVersion('1.0')
    .addTag('API')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => {
      return `${controllerKey.replace('Controller', '')}_${methodKey}`;
    },
  });
  SwaggerModule.setup('api/v1/docs', app, document);

  app
    .getHttpAdapter()
    .get('/api/v1/swagger.yaml', (req: Request, res: Response) => {
      const swaggerYaml = YAML.stringify(document);
      res.setHeader('Content-Type', 'application/x-yaml');
      res.send(swaggerYaml);
    });

  const port = process.env.PORT || 3000;

  await app.listen(port);

  logger.log(
    `Starting database query with prefix: '${process.env.DB_PREFIX ?? ''}'`,
  );
  logger.log(
    `Swagger UI is accessible at: http://localhost:${port}/api/v1/docs`,
  );
}

void bootstrap();
