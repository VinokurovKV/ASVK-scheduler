import { createTheme } from "@mui/material/styles";

import { appColors, type AppColors } from "./colors";
import { appGradients, appShadows } from "./effects";
import { appTypography, variableFontFaces } from "./typography";

declare module "@mui/material/styles" {
  interface Palette {
    app: AppColors;
  }

  interface PaletteOptions {
    app?: AppColors;
  }

  interface Theme {
    appGradients: typeof appGradients;
    appShadows: typeof appShadows;
  }

  interface ThemeOptions {
    appGradients?: typeof appGradients;
    appShadows?: typeof appShadows;
  }
}

export const appTheme = createTheme({
  palette: {
    mode: "light",

    background: {
      default: appColors.background.default,
      paper: appColors.background.paper,
    },

    app: appColors,
  },

  appGradients,
  appShadows,

  typography: appTypography,

  components: {
    MuiCssBaseline: {
      styleOverrides: variableFontFaces,
    },
  },
});
