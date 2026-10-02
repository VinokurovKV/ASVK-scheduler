import { Route, Routes } from "react-router-dom";

import { AppLayout } from "./layout/AppLayout.tsx";
import { EventsPage } from "./pages/EventsPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { MeetingsPage } from "./pages/MeetingsPage.tsx";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.tsx";
import { RegisterPage } from "./pages/RegisterPage.tsx";
import { SchedulePage } from "./pages/SchedulePage.tsx";

const App = () => {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />

      <Route path="register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="profile" element={<ProfilePage />} />

        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />

          <Route path="schedule" element={<SchedulePage />} />

          <Route path="events" element={<EventsPage />} />

          <Route path="meetings" element={<MeetingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
