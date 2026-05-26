import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  console.log("Altering avatar_id column to varchar(500)...");
  await sql`ALTER TABLE users ALTER COLUMN avatar_id TYPE varchar(500)`;
  console.log("✅ Done!");
}

run().catch(console.error);
