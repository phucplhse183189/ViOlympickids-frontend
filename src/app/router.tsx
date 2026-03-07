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
        <Route path="game/number-sequence" element={<NumberSequenceGame />} />
        <Route path="quiz/math2-b2" element={<Math2QuizPage />} />
        <Route path="result/math2-b2" element={<Math2ResultPage />} />
      </Route>
    </Routes>
  );
}
