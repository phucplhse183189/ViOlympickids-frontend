import { config } from "dotenv";
config({ path: ".env.local" });

import { db, schema } from "./api/_db.ts";

async function main() {
  const lessons = await db.select().from(schema.lessons);
  console.log(`Found ${lessons.length} lessons`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
