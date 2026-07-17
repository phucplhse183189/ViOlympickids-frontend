import { db } from "../_db.js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Deducting 1 day from all non-FREE plans...");
  
  await db.execute(sql`
    UPDATE children 
    SET plan_days_left = plan_days_left - 1 
    WHERE plan_days_left > 0 AND plan != 'FREE'
  `);
  
  const result = await db.execute(sql`
    SELECT id, name, plan, plan_days_left 
    FROM children 
    WHERE plan != 'FREE'
  `);
  
  console.table(result.rows);
  process.exit(0);
}

main().catch(console.error);

main().catch(console.error);
