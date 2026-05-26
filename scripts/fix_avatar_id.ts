import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function run() {
  console.log("Changing avatar_id to TEXT...");
  await sql`ALTER TABLE users ALTER COLUMN avatar_id TYPE text`;
  console.log("✅ Done!");
}

run().catch(console.error);
