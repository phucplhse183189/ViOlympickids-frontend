import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./schema";

// Tạo instance drizzle kết nối tới Vercel Postgres
// @vercel/postgres tự động đọc POSTGRES_URL từ environment
export const db = drizzle(sql, { schema });
