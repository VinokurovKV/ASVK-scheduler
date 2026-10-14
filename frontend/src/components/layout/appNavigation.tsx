import { CalendarMonth, Event, Groups, Home } from "@mui/icons-material";

export const appNavigation = [
  { label: "Сегодня", path: "/", icon: <Home /> },
  { label: "Расписание", path: "/schedule", icon: <CalendarMonth /> },
  { label: "События", path: "/events", icon: <Event /> },
  { label: "Встречи", path: "/meetings", icon: <Groups /> },
];
