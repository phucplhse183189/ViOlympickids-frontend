import type { VercelRequest, VercelResponse } from "@vercel/node";

import adminParents from "./_internal/admin_parents.js";
import adminParentsIdStatus from "./_internal/admin_parents_[id]_status.js";
import adminStats from "./_internal/admin_stats.js";
import adminStudentsIdStatus from "./_internal/admin_students_[id]_status.js";

import authLogin from "./_internal/auth_login.js";
import authRegister from "./_internal/auth_register.js";

import childrenAdd from "./_internal/children_add.js";
import childrenIndex from "./_internal/children_index.js";
import childrenIdActivities from "./_internal/children_[id]_activities.js";
import childrenIdDashboard from "./_internal/children_[id]_dashboard.js";
import childrenIdPlan from "./_internal/children_[id]_plan.js";

import lessonsCompleted from "./_internal/lessons_completed.js";
import lessonsTopics from "./_internal/lessons_topics.js";
import lessonsIdComplete from "./_internal/lessons_[id]_complete.js";
import lessonsIdQuiz from "./_internal/lessons_[id]_quiz.js";

import parentProfile from "./_internal/parent_profile.js";

import transactionsIndex from "./_internal/transactions_index.js";

import leaderboardLessons from "./_internal/leaderboard_lessons.js";
import leaderboardSubmit from "./_internal/leaderboard_submit.js";
import leaderboardQuiz from "./_internal/leaderboard_quiz.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-user-id");
  if (req.method === "OPTIONS") return res.status(200).end();

  const urlPath = (req.url || "").split("?")[0];
  const parts = urlPath.split("/").filter(Boolean);
  
  // parts[0] = "api"
  const group = parts[1]; // "auth", "children", etc.
  const segs = parts.slice(2);

  if (group === "admin") {
    if (segs.length === 1 && segs[0] === "parents") return adminParents(req, res);
    if (segs.length === 1 && segs[0] === "stats") return adminStats(req, res);
    if (segs.length === 3 && segs[0] === "parents" && segs[2] === "status") { req.query.id = segs[1]; return adminParentsIdStatus(req, res); }
    if (segs.length === 3 && segs[0] === "students" && segs[2] === "status") { req.query.id = segs[1]; return adminStudentsIdStatus(req, res); }
  }

  if (group === "auth") {
    if (segs.length === 1 && segs[0] === "login") return authLogin(req, res);
    if (segs.length === 1 && segs[0] === "register") return authRegister(req, res);
  }

  if (group === "children") {
    if (segs.length === 0) return childrenIndex(req, res);
    if (segs.length === 1 && segs[0] === "add") return childrenAdd(req, res);
    if (segs.length === 2 && segs[1] === "dashboard") { req.query.id = segs[0]; return childrenIdDashboard(req, res); }
    if (segs.length === 2 && segs[1] === "activities") { req.query.id = segs[0]; return childrenIdActivities(req, res); }
    if (segs.length === 2 && segs[1] === "plan") { req.query.id = segs[0]; return childrenIdPlan(req, res); }
  }

  if (group === "lessons") {
    if (segs.length === 1 && segs[0] === "topics") return lessonsTopics(req, res);
    if (segs.length === 1 && segs[0] === "completed") return lessonsCompleted(req, res);
    if (segs.length === 2 && segs[1] === "quiz") { req.query.id = segs[0]; return lessonsIdQuiz(req, res); }
    if (segs.length === 2 && segs[1] === "complete") { req.query.id = segs[0]; return lessonsIdComplete(req, res); }
  }

  if (group === "parent") {
    if (segs.length === 1 && segs[0] === "profile") return parentProfile(req, res);
  }

  if (group === "transactions") {
    if (segs.length === 0) return transactionsIndex(req, res);
  }

  if (group === "leaderboard") {
    if (segs.length === 1 && segs[0] === "lessons") return leaderboardLessons(req, res);
    if (segs.length === 1 && segs[0] === "submit") return leaderboardSubmit(req, res);
    if (segs.length === 1 && segs[0] !== "lessons" && segs[0] !== "submit") {
      req.query.lessonId = segs[0];
      return leaderboardQuiz(req, res);
    }
  }

  return res.status(404).json({ error: "Route not found in master router" });
}
