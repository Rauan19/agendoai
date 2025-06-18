import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

// Load environment variables from the root directory
dotenv.config({ path: '../.env' });

export default defineConfig({
  schema: './db/schema.js',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});