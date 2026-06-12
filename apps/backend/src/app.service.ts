import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  // Look, no constructor or ConfigService injection needed anymore!

  getHello(): string {
    // Read directly from Node.js system environment memory loaded by dotenv
    const port = process.env.PORT ?? 8000;
    const databaseUrl = process.env.SUPABASE_URL || 'Not Found';
    
    return `Hello from Backend on port ${port} with database: ${databaseUrl}`;
  }
}