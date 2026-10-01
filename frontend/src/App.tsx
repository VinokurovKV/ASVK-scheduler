import { Route, Routes } from "react-router-dom";

import { AppLayout } from "./layout/AppLayout.tsx";
import { EventsPage } from "./pages/EventsPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { MeetingsPage } from "./pages/MeetingsPage.tsx";
import { SchedulePage } from "./pages/SchedulePage.tsx";

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="meetings" element={<MeetingsPage />} />
      </Route>
    </Routes>
  );
};

export default App;
