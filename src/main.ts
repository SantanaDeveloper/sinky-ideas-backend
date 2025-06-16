import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder, SwaggerCustomOptions } from '@nestjs/swagger';
import { ClassSerializerInterceptor } from '@nestjs/common';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  // Configuração base do OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Mural de Ideias')
    .setDescription('API para listar ideias, registrar votos e criar novas ideias')
    .setVersion('1.0')
    .addTag('ideas')
    .addTag('auth')
    .addTag('users')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Opções customizadas do Swagger UI
  const swaggerOptions: SwaggerCustomOptions = {
    // Define título da aba
    customSiteTitle: 'Mural de Ideias API Docs',
    // Habilita o seletor de esquemas (útil se tiver mais de um)
    explorer: true,
    swaggerOptions: {
      // Preenche o campo de Authorization com "Bearer "
      authAction: {
        'access-token': {
          name: 'Authorization',
          schema: {
            type: 'http',
            in: 'header',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
          value: 'Bearer ',
        },
      },
    },
    // Estilização extra
    customCss: `
      .swagger-ui .topbar { background-color: #000; }
      .swagger-ui .authorize-popup { border-radius: 8px; }
    `,
  };

  // Monta o Swagger UI em /api
  SwaggerModule.setup('api', app, document, swaggerOptions);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
