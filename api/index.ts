import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../server/src/app.module';
import { HttpExceptionFilter } from '../server/src/common/filters/http-exception.filter';
import { ResponseInterceptor } from '../server/src/common/interceptors/response.interceptor';

let cachedServer: express.Express;

async function bootstrap(): Promise<express.Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const server = express();
  
  // Normalize req.url for Vercel's routing where the /api prefix might be stripped
  server.use((req: any, res: any, next: any) => {
    if (req.url && !req.url.startsWith('/api')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    next();
  });

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  app.setGlobalPrefix('api');
  
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.init();
  cachedServer = server;
  return server;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}
