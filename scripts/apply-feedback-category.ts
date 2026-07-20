import { sql } from "@vercel/postgres";

await sql.query("ALTER TABLE feedback_posts ADD COLUMN IF NOT EXISTS category varchar(32) DEFAULT 'general' NOT NULL");
const result = await sql.query("SELECT column_name, data_type, column_default, is_nullable FROM information_schema.columns WHERE table_name = 'feedback_posts' AND column_name = 'category'");
console.log(JSON.stringify(result.rows));
