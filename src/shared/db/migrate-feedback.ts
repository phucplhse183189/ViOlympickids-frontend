import { sql } from "@vercel/postgres";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  try {
    console.log("Creating feedback_status enum...");
    await sql`CREATE TYPE "public"."feedback_status" AS ENUM('pending', 'public', 'hidden', 'resolved');`;
    console.log("Enum created.");
  } catch (e: any) {
    console.log("Enum might already exist:", e.message);
  }

  try {
    console.log("Adding status column to feedback_posts...");
    await sql`ALTER TABLE "feedback_posts" ADD COLUMN "status" "public"."feedback_status" DEFAULT 'pending' NOT NULL;`;
    console.log("Column added.");
  } catch (e: any) {
    console.log("Column might already exist:", e.message);
  }
}

main().catch(console.error);
