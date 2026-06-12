import { Injectable, Inject } from '@nestjs/common';
import { schema } from '@anode/supabase';
import type { DbClient } from '@anode/supabase'; 
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto'; // 👈 IMPORT THIS FOR UNIQUE ID GENERATION

@Injectable()
export class IngestionService {
  private hfToken: string;

  constructor(
    @Inject('DRIZZLE_DATABASE_CONNECTION') private readonly database: DbClient, 
    private readonly configService: ConfigService,
  ) {
    // Grabs your Hugging Face token securely from system memory environment variables
    this.hfToken = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  async createSource(tenantId: string, name: string, type: 'file' | 'url', location?: string) {
    // 1. Generate a brand-new, production-safe unique UUID anchor
    const newSourceId = randomUUID();

    // 2. Insert the metadata row layout cleanly inside your Supabase schema using Drizzle
    await this.database.insert(schema.knowledgeSources).values({
      id: newSourceId,
      tenantId: tenantId,
      name: name,
      type: type,
      ...(location && { location }), // Stash optional URL maps or file system traces if given
    });

    // 3. Return the exact ID details so Postman/Frontend workflows can immediately use it
    return {
      success: true,
      message: 'Knowledge source registered successfully.',
      sourceId: newSourceId,
    };
  }

  private chunkText(text: string, chunkSize = 1000, chunkOverlap = 200): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      chunks.push(text.substring(startIndex, endIndex).trim());
      startIndex += chunkSize - chunkOverlap;
    }
    return chunks;
  }

  async processIngestion(tenantId: string, sourceId: string, rawContent: string) {
    const textSegments = this.chunkText(rawContent);
    if (textSegments.length === 0) return { success: true, chunksProcessed: 0 };

    // 1. Call Hugging Face Serverless API with the explicit feature-extraction pipeline task suffix
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction",
      {
        headers: { 
          Authorization: `Bearer ${this.hfToken}`, 
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        method: "POST",
        body: JSON.stringify({ inputs: textSegments }),
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face API failed: ${errorText}`);
    }

    // Hugging Face returns an array of vector arrays: number[][]
    const embeddings: number[][] = await response.json();

    // 2. Map text chunks with generated high-fidelity vector metrics
    const insertRecords = textSegments.map((segment, index) => {
      const rawVector = embeddings[index];
      let vector = Array.isArray(rawVector) ? (rawVector as any).flat() : rawVector;
      
      if (!vector || vector.length === 0) {
        throw new Error(`Failed to map vector embedding index ${index}`);
      }

      // Handle Hugging Face 768 dimensions to 1536 padding
      if (vector.length === 768) {
        const padding = new Array(768).fill(0);
        vector = [...vector, ...padding];
      }

      // Convert the array into a strictly bracketed string format.
      const vectorStringFormat = `[${vector.join(',')}]`;

      return {
        tenantId,
        sourceId,
        content: segment,
        embedding: vectorStringFormat as any, // Cast as any so Drizzle sends raw string through
        minRole: 'user',
        metadata: { index, charLength: segment.length },
      };
    });

    // 3. Insert records directly into your Supabase columns via Drizzle
    await this.database.insert(schema.chunks).values(insertRecords);

    return {
      success: true,
      chunksProcessed: insertRecords.length,
    };
  }
}