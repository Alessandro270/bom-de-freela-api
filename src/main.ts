import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: configService.get<string>('APP_URL', 'http://localhost:3000'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Bom de Freela API')
    .setDescription(
      'API REST da plataforma de freelancing digital Bom de Freela',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Token JWT de autenticação',
        in: 'header',
      },
      'JWT',
    )
    .addTag('Auth', 'Autenticação e gestão de conta')
    .addTag('Users', 'Gestão de dados do utilizador')
    .addTag('Profiles', 'Perfis de cliente e freelancer')
    .addTag('Categories', 'Categorias e subcategorias')
    .addTag('Projects', 'Gestão de projetos')
    .addTag('Proposals', 'Gestão de propostas')
    .addTag('Contracts', 'Gestão de contratos')
    .addTag('Payments', 'Gestão de pagamentos')
    .addTag('Reviews', 'Avaliações')
    .addTag('Notifications', 'Notificações do sistema')
    .addTag('Admin', 'Painel de administração')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(`Bom de Freela API a correr na porta ${port}`);
  console.log(`Swagger disponível em http://localhost:${port}/api/docs`);
}
bootstrap();
