import { env } from "$env/dynamic/private";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

if (!env.POSTGRES_URL) throw new Error("POSTGRES_URL is not set");

export const db = drizzle(env.POSTGRES_URL, { schema });

// Type helper for queries
export type DB = typeof db;
