import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import session from 'express-session';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // 可以跨域
  app.enableCors();

  // 配置session
  app.use(
    session({
      secret: 'lmc-session-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );

  // 生成api文档, swagger
  const config = new DocumentBuilder()
    .setTitle('lingmengcan api')
    .setDescription('api文档')
    .setVersion('0.1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('doc', app, document);

  await app.listen(configService.get('http.port'));
}
bootstrap();
