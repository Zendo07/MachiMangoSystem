import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve static files from frontend folder
  // When compiled, __dirname is in dist/src, so we go up twice: dist/src -> dist -> root
  app.useStaticAssets(join(__dirname, '..', '..', 'frontend'));

  // Enable CORS
  app.enableCors();

  // API routes prefix
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 Backend API: http://localhost:3000/api');
  console.log(
    '🎨 Landing Page: http://localhost:3000/pages/landing/index.html',
  );
}
bootstrap();
