import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";

import { AppLayout } from "./layout/AppLayout.tsx";

import { ActiveSessionsPage } from "./pages/ActiveSessionsPage.tsx";
import { ChangePasswordPage } from "./pages/ChangePasswordPage.tsx";
import { EventsPage } from "./pages/EventsPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { MeetingsPage } from "./pages/MeetingsPage.tsx";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { SchedulePage } from "./pages/SchedulePage.tsx";
import { SettingsPage } from "./pages/SettingsPage.tsx";
import { SupportPage } from "./pages/SupportPage.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route path="register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />

          <Route path="schedule" element={<SchedulePage />} />

          <Route path="events" element={<EventsPage />} />

          <Route path="meetings" element={<MeetingsPage />} />

          <Route path="profile" element={<ProfilePage />} />

          <Route path="settings" element={<SettingsPage />} />

          <Route path="settings/sessions" element={<ActiveSessionsPage />} />

          <Route path="settings/password" element={<ChangePasswordPage />} />

          <Route path="support" element={<SupportPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
