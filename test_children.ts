import { db } from "./api/_db.js";
import { sql } from "drizzle-orm";

async function main() {
  const res = await db.execute(sql`SELECT id, name FROM children`);
  console.table(res.rows);
  process.exit(0);
}
main();
