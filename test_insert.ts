import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db, schema } from "./api/_db.js";
import { eq } from "drizzle-orm";

async function run() {
  const parentId = "a7d6fd7a-e163-4c83-994f-3b7d2442dc38";
  try {
    const [child] = await db
      .insert(schema.children)
      .values({
        parentId,
        name: "Test Child",
        grade: "Lớp 2",
        avatarEmoji: "🐻",
        avatarBg: "bg-blue-100",
        plan: "FREE",
        gender: undefined, // undefined to simulate AddChildPage
        status: "active",
      })
      .returning();
    console.log("Success:", child);
  } catch (err) {
    console.error("Error:", err);
  }
  process.exit(0);
}
run();
