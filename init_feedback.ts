import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { sql } from "@vercel/postgres";

async function main() {
  console.log("Creating feedback tables...");
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "feedback_posts" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "rating" integer NOT NULL,
      "content" text NOT NULL,
      "likes_count" integer DEFAULT 0,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "feedback_replies" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "post_id" uuid NOT NULL REFERENCES "feedback_posts"("id"),
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "content" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  
  await sql.query(`
    CREATE TABLE IF NOT EXISTS "feedback_likes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "post_id" uuid NOT NULL REFERENCES "feedback_posts"("id"),
      "user_id" uuid NOT NULL REFERENCES "users"("id"),
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);
  
  console.log("Done!");
  process.exit(0);
}

main().catch(console.error);
