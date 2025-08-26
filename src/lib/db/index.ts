import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the drizzle instance
export const db = drizzle(pool, { schema });

// Export the pool for manual connections if needed
export { pool };
