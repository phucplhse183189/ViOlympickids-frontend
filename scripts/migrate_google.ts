import { sql } from "@vercel/postgres";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function migrate() {
  console.log("Running migration...");
  console.log("POSTGRES_URL:", process.env.POSTGRES_URL ? "SET" : "NOT SET");
  
  try {
    // Add google_id column
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100)`;
    console.log("✅ Added google_id column");

    // Add unique constraint (ignore if exists)
    try {
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_unique ON users(google_id)`;
      console.log("✅ Added google_id unique index");
    } catch (e) {
      console.log("⚠️ google_id unique index may already exist:", (e as Error).message);
    }

    // Create password_reset_tokens table
    await sql`CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id),
      token VARCHAR(100) UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )`;
    console.log("✅ Created password_reset_tokens table");

    console.log("\n🎉 Migration completed!");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
