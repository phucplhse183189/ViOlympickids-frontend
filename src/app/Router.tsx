import { Routes, Route, Navigate } from "react-router-dom";
import { PageTracker } from "./PageTracker";
import { HomePage } from "@/features/home/pages/HomePage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { RegisterPage } from "@/features/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "@/features/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";
import { CommunityPage } from "@/features/community/pages/CommunityPage";
import { ProfilePickerPage } from "@/features/dashboard/pages/ProfilePickerPage";
import { OverviewPage } from "@/features/dashboard/pages/OverviewPage";
import { ProgressPage } from "@/features/dashboard/pages/ProgressPage";
import { HistoryPage } from "@/features/dashboard/pages/HistoryPage";
import { SubscriptionPage } from "@/features/dashboard/pages/SubscriptionPage";
import { PaymentPage } from "@/features/dashboard/pages/PaymentPage";
import { ProfilePage } from "@/features/dashboard/pages/ProfilePage";
import { PaymentResultPage } from "@/features/dashboard/pages/PaymentResultPage";
import { PaymentCancelPage } from "@/features/dashboard/pages/PaymentCancelPage";
import { Math2TableOfContents } from "@/features/student/pages/Math2TableOfContents";
import { NumberSequenceGame } from "@/features/student/pages/NumberSequenceGame";
import { Math2QuizPage } from "@/features/student/pages/Math2QuizPage";
import { Math2ResultPage } from "@/features/student/pages/Math2ResultPage";
import { Math2Quiz3DShapesPage } from "@/features/student/pages/Math2Quiz3DShapesPage";
import { Math2B46WarehouseGame } from "@/features/student/pages/Math2B46WarehouseGame";
import { Math2B46DetectiveGame } from "@/features/student/pages/Math2B46DetectiveGame";
import { Math2B1Game } from "@/features/student/pages/Math2B1Game";
import { Math2B1QuizPage } from "@/features/student/pages/Math2B1QuizPage";
import { Math2B46QuizPage } from "@/features/student/pages/Math2B46QuizPage";
import { MatificCoinGame } from "@/features/student/pages/MatificCoinGame";
import { Math2B2TheoryPage } from "@/features/student/pages/Math2B2TheoryPage";
import { Math2B1TheoryPage } from "@/features/student/pages/Math2B1TheoryPage";
import { Math2B2GamePage } from "@/features/student/pages/Math2B2GamePage";
import { Math2B7Game } from "@/features/student/pages/Math2B7Game";
import { PipeBalanceGame } from "@/features/student/pages/PipeBalanceGame";
import { LeaderboardPage } from "@/features/student/pages/LeaderboardPage";
import { AddChildPage } from "@/features/dashboard/pages/AddChildPage";
import { ParentDashboardLayout } from "@/features/dashboard/components/ParentDashboardLayout";
import { StudentLayout } from "@/features/student/components/StudentLayout";
import { AdminOverviewPage } from "@/features/admin/pages/AdminOverviewPage";
import { AdminPerformancePage } from "@/features/admin/pages/AdminPerformancePage";
import { AdminFinancePage } from "@/features/admin/pages/AdminFinancePage";
import { AdminUsersPage } from "@/features/admin/pages/AdminUsersPage";
import { AdminUserDetailPage } from "@/features/admin/pages/AdminUserDetailPage";
import { AdminLessonsPage } from "@/features/admin/pages/AdminLessonsPage";
import { AdminAnalyticsPage } from "@/features/admin/pages/AdminAnalyticsPage";
import { AdminFeedbackPage } from "@/features/admin/pages/AdminFeedbackPage";
import { AdminLeaderboardPage } from "@/features/admin/pages/AdminLeaderboardPage";
import { AdminLayout } from "@/features/admin/components/AdminLayout";

export function RouterProvider() {
  return (
    <>
      <PageTracker />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/community" element={<CommunityPage />} />
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
        <Route path="payment-result" element={<PaymentResultPage />} />
        <Route path="payment-cancel" element={<PaymentCancelPage />} />
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
        <Route path="theory/math2-b1" element={<Math2B1TheoryPage />} />
        <Route path="result/math2-b1" element={<Math2ResultPage />} />

        {/* Lesson 46 routes */}
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
        <Route path="quiz/math2-b46" element={<Math2B46QuizPage />} />
        <Route path="result/math2-b46" element={<Math2ResultPage />} />

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
        <Route path="users/parents/:id" element={<AdminUserDetailPage type="parent" />} />
        <Route path="users/students/:id" element={<AdminUserDetailPage type="student" />} />
        <Route path="lessons" element={<AdminLessonsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
        <Route path="feedback" element={<AdminFeedbackPage />} />
        <Route path="leaderboard" element={<AdminLeaderboardPage />} />
      </Route>
    </Routes>
    </>
  );
}
