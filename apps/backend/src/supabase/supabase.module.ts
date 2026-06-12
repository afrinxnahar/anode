import { Module, Global } from '@nestjs/common';
import { db } from '@anode/supabase';

@Global() // 👈 Add this decorator to make it available everywhere instantly!
@Module({
  providers: [
    {
      provide: 'DRIZZLE_DATABASE_CONNECTION',
      // 👇 FIX: useFactory dynamically retrieves the connected instance at runtime
      useFactory: () => {
        if (!db) {
          throw new Error('Drizzle database connection instance is not initialized yet!');
        }
        return db;
      },
    },
  ],
  exports: ['DRIZZLE_DATABASE_CONNECTION'], // 👈 Make sure this is exported!
})
export class SupabaseModule {}