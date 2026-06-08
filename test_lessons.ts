import { config } from "dotenv";
config({ path: ".env.local" });

import { sql } from "drizzle-orm";
import { db } from "./api/_db.ts";

async function main() {
  console.log("Creating enum...");
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "lesson_status" AS ENUM('published', 'draft');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  console.log("Adding column...");
  await db.execute(sql`
    ALTER TABLE "lessons" ADD COLUMN IF NOT EXISTS "status" "lesson_status" DEFAULT 'draft' NOT NULL;
  `);

  console.log("Setting lessons 1, 2, 46 to published...");
  await db.execute(sql`
    UPDATE "lessons" SET "status" = 'published' WHERE "lesson_number" IN (1, 2, 46);
  `);

  console.log("Done.");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
