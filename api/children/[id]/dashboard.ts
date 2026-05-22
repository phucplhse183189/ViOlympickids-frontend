import type { VercelRequest, VercelResponse } from "@vercel/node";
import { eq } from "drizzle-orm";
import { db, schema } from "../../_db";

/**
 * GET /api/children/:id/dashboard
 * Lấy TOÀN BỘ dữ liệu dashboard cho 1 bé (chạy song song)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const childId = req.query.id as string;

    if (!childId) {
      return res.status(400).json({ error: "Thiếu childId" });
    }

    // Chạy tất cả các query cùng lúc để tăng tốc
    const [
      statsRows,
      studyDayRows,
      weeklyTrendRows,
      skillRows,
      activityRows,
      radarRows,
      streakRows,
      billingRows,
      alertRows,
    ] = await Promise.all([
      db
        .select()
        .from(schema.dashboardStats)
        .where(eq(schema.dashboardStats.childId, childId)),
      db
        .select()
        .from(schema.studyDays)
        .where(eq(schema.studyDays.childId, childId)),
      db
        .select()
        .from(schema.weeklyTrends)
        .where(eq(schema.weeklyTrends.childId, childId)),
      db
        .select()
        .from(schema.skills)
        .where(eq(schema.skills.childId, childId)),
      db
        .select()
        .from(schema.activities)
        .where(eq(schema.activities.childId, childId)),
      db
        .select()
        .from(schema.radarSkills)
        .where(eq(schema.radarSkills.childId, childId)),
      db
        .select()
        .from(schema.streakDaysTable)
        .where(eq(schema.streakDaysTable.childId, childId)),
      db
        .select()
        .from(schema.billing)
        .where(eq(schema.billing.childId, childId)),
      db
        .select()
        .from(schema.alerts)
        .where(eq(schema.alerts.childId, childId)),
    ]);

    return res.status(200).json({
      stats: statsRows[0] ?? null,
      studyDays: studyDayRows,
      weeklyTrends: weeklyTrendRows,
      skills: skillRows,
      activities: activityRows,
      radarSkills: radarRows,
      streakDays: streakRows,
      billing: billingRows[0] ?? null,
      alerts: alertRows,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "Lỗi server" });
  }
}
