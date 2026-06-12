// 👇 THIS MUST BE LINE 1 - BEFORE ANY OTHER IMPORTS
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log('🚀 SYSTEM DIAGNOSTIC: ROOT ENV CHECK -> KEY LOADED:', !!process.env.OPENAI_API_KEY);
  const port = process.env.PORT ?? 3002
  await app.listen(port);
  console.log("Listening on port : ",port )
}
bootstrap();