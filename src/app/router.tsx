import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
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
  Math2B1Game,
  Math2B1QuizPage,
  MatificCoinGame,
  Math2B2TheoryPage,
  Math2B7Game,
  PipeBalanceGame,
} from "@/pages/student";
import { AddChildPage } from "@/pages/add-child";
import { ParentDashboardLayout } from "@/widgets/dashboard-layout";
import { StudentLayout } from "@/widgets/student-layout";

export function RouterProvider() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
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
        <Route path="game/math2-b1" element={<Math2B1Game />} />
        <Route path="game/math2-b7" element={<Math2B7Game />} />
        <Route path="game/pipe-balance" element={<PipeBalanceGame />} />
        <Route path="game/matific-coin" element={<MatificCoinGame />} />
        <Route path="quiz/math2-b1" element={<Math2B1QuizPage />} />
        <Route path="result/math2-b1" element={<Math2ResultPage />} />
        <Route path="game/number-sequence" element={<NumberSequenceGame />} />
        <Route path="game/math2-quiz-3d" element={<Math2Quiz3DPage />} />
        <Route path="theory/math2-b2" element={<Math2B2TheoryPage />} />
        <Route path="quiz/math2-b2" element={<Math2QuizPage />} />
        <Route path="result/math2-b2" element={<Math2ResultPage />} />
      </Route>
    </Routes>
  );
}
