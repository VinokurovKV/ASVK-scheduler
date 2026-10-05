import { CssBaseline, ThemeProvider } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { type PropsWithChildren, useMemo } from "react";

import { appTheme } from "./theme";
import {
  ThemePreferenceContext,
  type ThemePreference,
} from "./theme-context";

const THEME_STORAGE_KEY = "asvk-theme";

const ThemePreferenceController = ({ children }: PropsWithChildren) => {
  const { mode, setMode } = useColorScheme();
  const themePreference: ThemePreference =
    mode === "dark" || mode === "system" ? mode : "light";

  const contextValue = useMemo(
    () => ({
      themePreference,
      setThemePreference: (preference: ThemePreference) => setMode(preference),
    }),
    [setMode, themePreference],
  );

  return (
    <ThemePreferenceContext.Provider value={contextValue}>
      {children}
    </ThemePreferenceContext.Provider>
  );
};

export const AppThemeProvider = ({ children }: PropsWithChildren) => (
  <ThemeProvider
    theme={appTheme}
    defaultMode="light"
    modeStorageKey={THEME_STORAGE_KEY}
    noSsr
    disableTransitionOnChange
  >
    <CssBaseline />
    <ThemePreferenceController>{children}</ThemePreferenceController>
  </ThemeProvider>
);
