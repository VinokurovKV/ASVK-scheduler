import { createTheme, type PaletteMode } from "@mui/material/styles";

import {
  darkAppColors,
  lightAppColors,
  type AppColors,
} from "./colors";
import {
  appGradients,
  appShadows,
  type AppGradients,
  type AppShadows,
} from "./effects";
import { appTypography, variableFontFaces } from "./typography";

declare module "@mui/material/styles" {
  interface CssThemeVariables {
    enabled: true;
  }

  interface Palette {
    app: AppColors;
  }

  interface PaletteOptions {
    app?: AppColors;
  }

  interface Theme {
    appGradients: AppGradients;
    appShadows: AppShadows;
  }

  interface ThemeOptions {
    appGradients?: AppGradients;
    appShadows?: AppShadows;
  }
}

const createPalette = (mode: PaletteMode, colors: AppColors) => ({
  mode,
  primary: { main: mode === "dark" ? "#6EA8FF" : "#1976D2" },
  background: {
    default: colors.background.default,
    paper: colors.background.paper,
  },
  ...(mode === "dark"
    ? {
        text: { primary: "#F1F5FB", secondary: "#AAB6C7" },
        divider: "rgba(219, 228, 241, 0.14)",
      }
    : {}),
  app: colors,
});

export const appTheme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: { palette: createPalette("light", lightAppColors) },
    dark: { palette: createPalette("dark", darkAppColors) },
  },
  appGradients,
  appShadows,
  typography: appTypography,
  components: {
    MuiCssBaseline: { styleOverrides: variableFontFaces },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
  },
});
