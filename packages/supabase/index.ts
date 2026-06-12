import { drizzle } from 'drizzle-orm/postgres-js';
import { createClient } from '@supabase/supabase-js';
import postgres from 'postgres';
import * as tenantsSchema from './src/schema/tenants';
import * as ragSchema from './src/schema/rag';

export const schema = { ...tenantsSchema, ...ragSchema };

const connectionString = process.env.DATABASE_URL

export const db = connectionString
  ? drizzle(postgres(connectionString, { max: 1, prepare: false }), { schema })
  : null as any;

export type DbClient = typeof db;

export const createSupabaseClient = (url: string, key: string) => {
  if (!url || !key) {
    return null as any;
  }
  return createClient(url, key);
};

export * from '@supabase/supabase-js';