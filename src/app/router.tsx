import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { ForgotPasswordPage } from "@/pages/forgot-password";
import { ResetPasswordPage } from "@/pages/reset-password";
import { ProfilePickerPage } from "@/pages/profile-picker";
import {
  OverviewPage,
  ProgressPage,
  HistoryPage,
  SubscriptionPage,
  PaymentPage,
  ProfilePage,
} from "@/pages/dashboard";
import {
  Math2TableOfContents,
  NumberSequenceGame,
  Math2QuizPage,
  Math2ResultPage,
  Math2Quiz3DPage,
  Math2Quiz3DShapesPage,
  Math2B46WarehouseGame,
  Math2B46DetectiveGame,
  Math2B1Game,
  Math2B1QuizPage,
  MatificCoinGame,
  Math2B2TheoryPage,
  Math2B2GamePage,
  Math2B7Game,
  PipeBalanceGame,
  LeaderboardPage,
} from "@/pages/student";
import { AddChildPage } from "@/pages/add-child";
import { ParentDashboardLayout } from "@/widgets/dashboard-layout";
import { StudentLayout } from "@/widgets/student-layout";
import {
  AdminOverviewPage,
  AdminPerformancePage,
  AdminFinancePage,
  AdminUsersPage,
} from "@/pages/admin";
import { AdminLayout } from "@/widgets/admin-layout";

export function RouterProvider() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/profile-picker" element={<ProfilePickerPage />} />
      <Route path="/add-child" element={<AddChildPage />} />

      {/* Parent Dashboard (behind PIN gate) */}
      <Route path="/dashboard" element={<ParentDashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="payment" element={<PaymentPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Student Portal */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Math2TableOfContents />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="game/math2-b1" element={<Math2B1Game />} />
        <Route path="game/math2-b7" element={<Math2B7Game />} />
        <Route path="game/pipe-balance" element={<PipeBalanceGame />} />
        <Route path="game/matific-coin" element={<MatificCoinGame />} />
        <Route path="quiz/math2-b1" element={<Math2B1QuizPage />} />
        <Route path="result/math2-b1" element={<Math2ResultPage />} />

        {/* Lesson 46 routes */}
        <Route path="game/math2-quiz-3d" element={<Math2Quiz3DPage />} />
        <Route
          path="game/math2-quiz-3d-shapes"
          element={<Math2Quiz3DShapesPage />}
        />
        <Route
          path="game/math2-b46-warehouse"
          element={<Math2B46WarehouseGame />}
        />
        <Route
          path="game/math2-b46-detective"
          element={<Math2B46DetectiveGame />}
        />

        {/* Lesson 2 */}
        <Route path="theory/math2-b2" element={<Math2B2TheoryPage />} />
        <Route path="game/math2-b2" element={<Math2B2GamePage />} />
        <Route path="game/number-sequence" element={<NumberSequenceGame />} />
        <Route path="quiz/math2-b2" element={<Math2QuizPage />} />
        <Route path="result/math2-b2" element={<Math2ResultPage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin-login" element={<Navigate to="/login" replace />} />
      <Route path="/login-admin" element={<Navigate to="/login" replace />} />
      <Route path="/admin." element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverviewPage />} />
        <Route path="performance" element={<AdminPerformancePage />} />
        <Route path="finance" element={<AdminFinancePage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>
    </Routes>
  );
}
