import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sql } from "drizzle-orm";
import { db } from "../_db.js";

/**
 * GET /api/admin/analytics-stats?days=30
 * Tổng hợp số liệu truy cập (Web Analytics tự build) cho trang admin:
 *   totalViews, uniqueVisitors, totalSessions, viewsToday,
 *   dailyViews[], topPages[], deviceBreakdown[], topReferrers[]
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const daysRaw = Number(req.query.days);
    const days = Number.isFinite(daysRaw) && daysRaw > 0 && daysRaw <= 365 ? Math.floor(daysRaw) : 30;
    const interval = sql.raw(`'${days} days'`);
    // Loại toàn bộ visitor từng phát sinh referrer local để dữ liệu test cũ
    // không lẫn vào số liệu của các nền tảng đã triển khai.
    const deployedOnly = sql`
      visitor_id NOT IN (
        SELECT visitor_id FROM page_views
        WHERE lower(COALESCE(referrer, '')) LIKE '%localhost%'
           OR lower(COALESCE(referrer, '')) LIKE '%127.0.0.1%'
      )
    `;

    const [
      totalsResult,
      todayResult,
      dailyResult,
      topPagesResult,
      deviceResult,
      referrerResult,
    ] = await Promise.all([
      db.execute(sql`
        SELECT
          count(*)::int AS total_views,
          count(DISTINCT visitor_id)::int AS unique_visitors,
          count(DISTINCT session_id)::int AS total_sessions
        FROM page_views
        WHERE created_at >= now() - interval ${interval} AND ${deployedOnly}
      `),
      db.execute(sql`
        SELECT count(*)::int AS views_today
        FROM page_views
        WHERE created_at >= date_trunc('day', now()) AND ${deployedOnly}
      `),
      db.execute(sql`
        SELECT
          to_char(created_at, 'YYYY-MM-DD') AS date,
          count(*)::int AS views,
          count(DISTINCT visitor_id)::int AS visitors
        FROM page_views
        WHERE created_at >= now() - interval ${interval} AND ${deployedOnly}
        GROUP BY 1
        ORDER BY 1
      `),
      db.execute(sql`
        SELECT path, count(*)::int AS views
        FROM page_views
        WHERE created_at >= now() - interval ${interval} AND ${deployedOnly}
        GROUP BY path
        ORDER BY views DESC
        LIMIT 10
      `),
      db.execute(sql`
        SELECT device, count(*)::int AS count
        FROM page_views
        WHERE created_at >= now() - interval ${interval} AND ${deployedOnly}
        GROUP BY device
        ORDER BY count DESC
      `),
      db.execute(sql`
        SELECT
          COALESCE(NULLIF(referrer, ''), 'Trực tiếp') AS referrer,
          count(*)::int AS count
        FROM page_views
        WHERE created_at >= now() - interval ${interval} AND ${deployedOnly}
        GROUP BY 1
        ORDER BY count DESC
        LIMIT 8
      `),
    ]);

    const totals = (totalsResult.rows[0] || {}) as Record<string, number>;
    const today = (todayResult.rows[0] || {}) as Record<string, number>;

    return res.status(200).json({
      rangeDays: days,
      totalViews: Number(totals.total_views ?? 0),
      uniqueVisitors: Number(totals.unique_visitors ?? 0),
      totalSessions: Number(totals.total_sessions ?? 0),
      viewsToday: Number(today.views_today ?? 0),
      dailyViews: dailyResult.rows.map((r: any) => ({
        date: r.date,
        views: Number(r.views),
        visitors: Number(r.visitors),
      })),
      topPages: topPagesResult.rows.map((r: any) => ({
        path: r.path,
        views: Number(r.views),
      })),
      deviceBreakdown: deviceResult.rows.map((r: any) => ({
        device: r.device,
        count: Number(r.count),
      })),
      topReferrers: referrerResult.rows.map((r: any) => ({
        referrer: r.referrer,
        count: Number(r.count),
      })),
    });
  } catch (err) {
    console.error("Admin analytics stats error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
