import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import EditorLayout from "@/layouts/EditorLayout";
import LandingPage from "@/pages/LandingPage";
import SignInPage from "@/pages/SignInPage";
import SignUpPage from "@/pages/SignUpPage";
import SyncPage from "@/pages/SyncPage";
import DashboardPage from "@/pages/DashboardPage";
import ProjectListPage from "@/pages/ProjectListPage";
import ProjectPagesPage from "@/pages/ProjectPagesPage";
import ProjectSettingsPage from "@/pages/ProjectSettingsPage";
import AccessPage from "@/pages/AccessPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import UserProfilePage from "@/pages/UserProfilePage";
import InvitationsPage from "@/pages/InvitationsPage";
import RequestsPage from "@/pages/RequestsPage";
import InvitationTokenPage from "@/pages/InvitationTokenPage";
import EditorPage from "@/pages/EditorPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/sign-in/*" element={<SignInPage />} />
      <Route path="/sign-up/*" element={<SignUpPage />} />
      <Route path="/invitations/:token" element={<InvitationTokenPage />} />

      <Route element={<MainLayout />}>
        <Route path="/sync" element={<SyncPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project" element={<ProjectListPage />} />
        <Route path="/project/:id" element={<Navigate to="pages" replace />} />
        <Route path="/project/:id/pages" element={<ProjectPagesPage />} />
        <Route path="/project/:id/settings" element={<ProjectSettingsPage />} />
        <Route path="/access" element={<AccessPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        <Route path="/invitations" element={<InvitationsPage />} />
        <Route path="/requests" element={<RequestsPage />} />
      </Route>

      <Route element={<EditorLayout />}>
        <Route path="/editor/:projectId/page/:pageId" element={<EditorPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
