import { createContext, useContext } from "react";

export type ThemePreference = "light" | "dark" | "system";

interface ThemePreferenceContextValue {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

export const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

export const useAppTheme = () => {
  const context = useContext(ThemePreferenceContext);

  if (!context) {
    throw new Error("useAppTheme must be used inside AppThemeProvider");
  }

  return context;
};
