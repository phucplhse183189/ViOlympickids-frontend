import { db } from "./api/_db.js";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(sql`SELECT * FROM quiz_attempts`);
  console.table(res.rows);
  process.exit(0);
}
main();
