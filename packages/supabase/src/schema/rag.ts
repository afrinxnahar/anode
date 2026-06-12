// 1. ADD jsonb TO YOUR PG-CORE IMPORTS HERE:
import { pgTable, uuid, text, varchar, timestamp, customType, jsonb } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

const vector = customType<{ data: number[] }>({
  dataType() {
    return 'vector(1536)';
  },
});

export const knowledgeSources = pgTable('knowledge_sources', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  type: varchar('type', { length: 50 }).notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chunks = pgTable('chunks', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  sourceId: uuid('source_id').references(() => knowledgeSources.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  embedding: vector('embedding').notNull(),
  
  // 2. ADD THIS NEW COLUMN DEFINITION HERE:
  metadata: jsonb('metadata').$type<{ index: number; charLength: number }>().notNull(),
  
  minRole: varchar('min_role', { length: 50 }).default('user').notNull(), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
});