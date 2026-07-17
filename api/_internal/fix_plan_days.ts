import { db } from "../_db.js";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Tìm các tài khoản trùng lặp...");

  // Tìm các parent_id có nhiều hơn 1 child cùng tên
  const duplicateRows = await db.execute(sql`
    SELECT parent_id, name, COUNT(*) as c 
    FROM children 
    GROUP BY parent_id, name 
    HAVING COUNT(*) > 1
  `);

  if (duplicateRows.rows.length === 0) {
    console.log("Không tìm thấy tài khoản bé nào bị trùng lặp.");
    process.exit(0);
  }

  console.log(`Tìm thấy ${duplicateRows.rows.length} trường hợp trùng lặp. Đang xử lý...`);

  for (const row of duplicateRows.rows) {
    // Lấy ID của child được tạo sau cùng (mới nhất) để xoá
    const dupes = await db.execute(sql`
      SELECT id, created_at 
      FROM children 
      WHERE parent_id = ${row.parent_id} AND name = ${row.name}
      ORDER BY created_at DESC
    `);

    // Xoá record đầu tiên (mới nhất)
    const duplicateId = dupes.rows[0].id;

    await db.execute(sql`
      DELETE FROM children WHERE id = ${duplicateId}
    `);
    console.log(`Đã xóa tài khoản bị trùng (ID: ${duplicateId}) của bé ${row.name}`);
  }

  console.log("Dọn dẹp hoàn tất!");
  process.exit(0);
}

main().catch(console.error);
