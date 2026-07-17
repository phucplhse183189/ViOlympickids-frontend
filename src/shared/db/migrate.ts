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

  // 3. Make phone column nullable (Google users will have phone = null)
  try {
    await sql`ALTER TABLE users ALTER COLUMN phone DROP NOT NULL`;
    console.log("✅ Made phone column nullable");
  } catch (err: any) {
    console.log("⏭️  phone column already nullable or error:", err.message);
  }

  // 4. Clean up old placeholder phones (g_ prefix and 00 prefix) → set to NULL
  try {
    await sql`UPDATE users SET phone = NULL WHERE phone LIKE 'g_%' OR phone LIKE '00%'`;
    console.log("✅ Cleaned up placeholder phone values → NULL");
  } catch (err: any) {
    console.log("⚠️  Error cleaning up placeholder phones:", err.message);
  }

  // 5. Update admin phone numbers to realistic VN format
  try {
    await sql`UPDATE users SET phone = '0938471256' WHERE phone = '0999999991'`;
    await sql`UPDATE users SET phone = '0372856194' WHERE phone = '0999999992'`;
    console.log("✅ Updated admin phone numbers to realistic VN format");
  } catch (err: any) {
    console.log("⚠️  Error updating admin phones:", err.message);
  }

  console.log("🎉 Schema migration complete!");
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
