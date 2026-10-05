const appPaletteVariable = (path: string) =>
  `var(--mui-palette-app-${path.replaceAll(".", "-")})`;

export const appShadows = {
  appBar: `0 1px 5px ${appPaletteVariable("shadow.medium")}`,
  topBar: `0 2px 10px ${appPaletteVariable("shadow.soft")}`,
  avatar: `0 2px 8px ${appPaletteVariable("shadow.soft")}`,
  button: `0 1px 3px ${appPaletteVariable("shadow.navy")}`,
  card: `0 18px 50px ${appPaletteVariable("shadow.card")}`,
  primary: `0 10px 28px ${appPaletteVariable("shadow.primary")}`,
  floating: `0 3px 10px ${appPaletteVariable("shadow.strong")}`,
  menu: `0 8px 28px ${appPaletteVariable("shadow.medium")}`,
  toast: `0 6px 24px ${appPaletteVariable("shadow.strong")}`,
};

export const appGradients = {
  auth: `radial-gradient(circle at 18% 82%, ${appPaletteVariable("gradient.meeting")}, transparent 32%), radial-gradient(circle at 82% 18%, ${appPaletteVariable("gradient.lecture")}, transparent 34%)`,
};

export type AppShadows = typeof appShadows;
export type AppGradients = typeof appGradients;
