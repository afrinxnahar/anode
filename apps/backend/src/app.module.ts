import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { RagController } from './rag/rag.controller';
import { RagService } from './rag/rag.service';
import { IngestionService } from './rag/ingestion.service';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
@Module({
  imports: [
    SupabaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.join(__dirname, '../../../.env'),
    }),
  ],
  controllers: [AppController, RagController],
  providers: [AppService, RagService, IngestionService],
})
export class AppModule {}