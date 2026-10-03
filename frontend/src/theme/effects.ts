import { appColors } from "./colors";

export const appShadows = {
  appBar: `0 1px 5px ${appColors.shadow.medium}`,
  topBar: `0 2px 10px ${appColors.shadow.soft}`,
  avatar: `0 2px 8px ${appColors.shadow.soft}`,
  button: `0 1px 3px ${appColors.shadow.navy}`,
  card: `0 18px 50px ${appColors.shadow.card}`,
  primary: `0 10px 28px ${appColors.shadow.primary}`,
  floating: `0 3px 10px ${appColors.shadow.strong}`,
  menu: `0 8px 28px ${appColors.shadow.medium}`,
  toast: `0 6px 24px ${appColors.shadow.strong}`,
} as const;

export const appGradients = {
  auth: `radial-gradient(circle at 18% 82%, ${appColors.gradient.meeting}, transparent 32%), radial-gradient(circle at 82% 18%, ${appColors.gradient.lecture}, transparent 34%)`,
} as const;
