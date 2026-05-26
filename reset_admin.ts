import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db, schema } from "./api/_db.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function run() {
  const newHash = await bcrypt.hash("admin123", 10);
  const [updated] = await db
    .update(schema.users)
    .set({ passwordHash: newHash })
    .where(eq(schema.users.phone, "0901234567"))
    .returning();
  console.log("Admin password reset OK:", updated.name, updated.phone);
  process.exit(0);
}

run();
