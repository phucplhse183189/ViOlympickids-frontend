import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db, schema } from "./api/_db.js";

async function run() {
  const users = await db.select().from(schema.users);
  const children = await db.select().from(schema.children);
  
  users.forEach(u => {
    const kids = children.filter(c => c.parentId === u.id);
    console.log(`\nPhụ huynh: ${u.name} (SĐT: ${u.phone})`);
    if (kids.length === 0) {
      console.log(`  -> Chưa có hồ sơ bé nào`);
    } else {
      kids.forEach(k => {
        console.log(`  - Bé: ${k.name} | Gói: ${k.plan}`);
      });
    }
  });
  process.exit(0);
}

run();
