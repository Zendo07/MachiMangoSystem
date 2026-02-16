import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  // API routes prefix
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 Backend API: http://localhost:3000/api');
  console.log('📝 Signup endpoint: http://localhost:3000/api/auth/signup');
}
void bootstrap();
