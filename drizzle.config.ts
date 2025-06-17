import { defineConfig } from "drizzle-kit";
import dotenv from 'dotenv';

// Carrega variáveis do arquivo .env
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não encontrada no arquivo .env");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
