import { Injectable, Inject } from '@nestjs/common';
import { schema } from '@anode/supabase';
import type { DbClient } from '@anode/supabase';
import { ConfigService } from '@nestjs/config';
import { and, eq, sql } from 'drizzle-orm';

@Injectable()
export class RagService {
  private hfToken: string;

  constructor(
    @Inject('DRIZZLE_DATABASE_CONNECTION') private readonly database: DbClient,
    private readonly configService: ConfigService,
  ) {
    // Grabs your token securely from environment variables
    this.hfToken = this.configService.get<string>('OPENAI_API_KEY') || '';
  }

  /**
   * Core Search: Converts natural user text into a vector, queries Supabase,
   * and clamps results strictly to the provided tenant boundary.
   */
  async searchVectorChunks(
    tenantId: string,
    queryText: string,
    minRole = 'user',
    limit = 3
  ): Promise<any[]> {
    // 1. Generate the raw vector coordinates for the user query string
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction",
      {
        headers: {
          Authorization: `Bearer ${this.hfToken}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        method: "POST",
        body: JSON.stringify({ inputs: [queryText] }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Hugging Face Search Vectorization failed: ${errorText}`);
    }

    const embeddings: number[][] = await response.json();
    let queryVector = embeddings[0];

    // 2. Pad dimensions from 768 to 1536 to perfectly match your ingestion data blueprint
    if (queryVector?.length === 768) {
      const padding = new Array(768).fill(0);
      queryVector = [...queryVector, ...padding];
    }

    const vectorString = `[${queryVector?.join(',')}]`;

    // 3. Execute Vector Cosine Similarity Search inside Supabase using Drizzle
    // Considers tenant context and filters out data before running math algorithms
    const similarityExpression = sql`1 - (${schema.chunks.embedding} <=> ${vectorString}::vector)`;

    const matchingChunks = await this.database
      .select({
        id: schema.chunks.id,
        content: schema.chunks.content,
        sourceId: schema.chunks.sourceId,
        metadata: schema.chunks.metadata,
        similarity: similarityExpression,
      })
      .from(schema.chunks)
      .where(
        and(
          eq(schema.chunks.tenantId, tenantId), // 🔒 IRONCLAD TENANT GUARDRAIL
          sql`1 - (${schema.chunks.embedding} <=> ${vectorString}::vector) > 0.3` // Only pull relevant chunks
        )
      )
      .orderBy(sql`(${schema.chunks.embedding} <=> ${vectorString}::vector) ASC`) // Closest distance first
      .limit(limit);

    return matchingChunks;
  }

  /**
   * LLM Synthesis Phase: Takes query + matching chunks, generates a secure,
   * dynamic system architecture prompt, and crafts a concise, human-like answer.
   */
  async refineAnswer(
    userQuery: string,
    retrievedChunks: any[],
    sourceName = 'your uploaded documentation'
  ): Promise<string> {
    if (!retrievedChunks || retrievedChunks.length === 0) {
      return "I could not find any relevant information within your uploaded documents to answer this question.";
    }

    // Combine chunks into a clean text block for the LLM context window
    const contextText = retrievedChunks.map(chunk => chunk.content).join('\n\n');

    // DYNAMIC MULTI-TENANT SYSTEM INSTRUCTIONS
    // Adjusts its core personality dynamically depending on the file name being read
    const systemInstruction = `You are a precision QA assistant extracting data from a file named: "${sourceName}".

Core Rules:
1. Provide a direct, straightforward, to-the-point answer. 
2. Do NOT use introductory filler phrases like "According to the provided context...", "Based on the text...", or "Therefore, the answer is...".
3. Answer the question immediately in a single sentence or phrase if possible.
4. Stick strictly to the provided text extracts. If the text snippets do not contain the facts, say exactly: "Context insufficient."`;

    // Execute high-speed LLM generation via OpenAI-Compatible Hugging Face Router
    try {
      const response = await fetch(
        "https://router.huggingface.co/v1/chat/completions",
        {
          headers: {
            "Authorization": `Bearer ${this.hfToken}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            model: "meta-llama/Meta-Llama-3-8B-Instruct:together", // High speed Together AI inference channel
            messages: [
              {
                role: "system",
                content: systemInstruction
              },
              {
                role: "user",
                content: `CONTEXT EXTRACTS:\n${contextText}\n\nUSER QUESTION:\n${userQuery}`
              }
            ],
            max_tokens: 450,
            temperature: 0.15, // Low temperature forces strict compliance with provided text facts
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face Inference Router failed: ${errorText}`);
      }

      const result = await response.json();
      return result.choices?.[0]?.message?.content || "Failed to parse text from generation engine.";

    } catch (error) {
      console.error('RAG Error during LLM Refinement:', error);
      // Cast error as 'any' or an Error object explicitly to clear the compiler warning
      throw new Error(`Failed to synthesize answer via LLM: ${(error as any).message}`);
    }
  }

  /**
   * Helper method to fetch a human-readable file name from your parent table
   * to populate your dynamic system prompts elegantly.
   */
  async getSourceName(sourceId: string): Promise<string> {
    try {
      const source = await this.database
        .select({ name: schema.knowledgeSources.name })
        .from(schema.knowledgeSources)
        .where(eq(schema.knowledgeSources.id, sourceId))
        .limit(1);

      return source[0]?.name || 'Uploaded Documentation';
    } catch {
      return 'Uploaded Documentation';
    }
  }
}