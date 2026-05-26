import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("⏳ Applying schema changes...");

  // 1. Add google_id column to users table
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100) UNIQUE`;
    console.log("✅ Added google_id column to users table");
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("⏭️  google_id column already exists");
    } else {
      throw err;
    }
  }

  // 2. Create password_reset_tokens table
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        token VARCHAR(100) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✅ Created password_reset_tokens table");
  } catch (err: any) {
    if (err.message?.includes("already exists")) {
      console.log("⏭️  password_reset_tokens table already exists");
    } else {
      throw err;
    }
  }

  console.log("🎉 Schema migration complete!");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
