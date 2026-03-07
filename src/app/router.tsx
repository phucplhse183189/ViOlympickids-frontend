import { Routes, Route } from "react-router-dom";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import {
  OverviewPage,
  ProgressPage,
  HistoryPage,
  SubscriptionPage,
  ProfilePage,
} from "@/pages/dashboard";
import {
  LearningMapPage,
  InteractiveMathSpacePage,
  LessonIntroPage,
  ExercisePage,
  ResultPage,
  Math2TableOfContents,
  NumberSequenceGame,
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
      <Route path="/add-child" element={<AddChildPage />} />

      {/* Parent Dashboard */}
      <Route path="/dashboard" element={<ParentDashboardLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Student Portal */}
      <Route path="/student" element={<StudentLayout />}>
        <Route index element={<Math2TableOfContents />} />
        <Route path="map" element={<LearningMapPage />} />
        <Route path="lesson" element={<InteractiveMathSpacePage />} />
        <Route path="lesson/:id" element={<LessonIntroPage />} />
        <Route path="exercise/:id" element={<ExercisePage />} />
        <Route path="result/:id" element={<ResultPage />} />
        <Route path="game/number-sequence" element={<NumberSequenceGame />} />
      </Route>
    </Routes>
  );
}
