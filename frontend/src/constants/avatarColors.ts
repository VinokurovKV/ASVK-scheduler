import type { Theme } from "@mui/material";

import type { AvatarColor } from "../types/Auth";

interface AvatarColorOption {
  value: AvatarColor;
  light: string;
  dark: string;
}

export const avatarColorOptions: AvatarColorOption[] = [
  { value: "BLUE", light: "#0b4cd9", dark: "#5678f5" },
  { value: "SKY", light: "#1b9fcf", dark: "#85d1ed" },
  { value: "TURQUOISE", light: "#12c4c4", dark: "#82e8e8" },
  { value: "MAGENTA", light: "#721a82", dark: "#d885f7" },
  { value: "VIOLET", light: "#5e21c1", dark: "#967de2" },
  { value: "PINK", light: "#d61796", dark: "#eb94c1" },
  { value: "BURGUNDY", light: "#ba0e41", dark: "#f389a7" },
  { value: "RED", light: "#cf1c1c", dark: "#f36269" },
  { value: "ORANGE", light: "#d85421", dark: "#ee9c70" },
  { value: "YELLOW", light: "#c4ba24", dark: "#eedc82" },
  { value: "LIME", light: "#6fa813", dark: "#baea6d" },
  { value: "GREEN", light: "#0c8619", dark: "#80e79a" },
];

export const getAvatarColorSx = (
  avatarColor: AvatarColor | null | undefined,
) => {
  const option =
    avatarColorOptions.find(({ value }) => value === avatarColor) ??
    avatarColorOptions[0];

  return {
    bgcolor: (theme: Theme) =>
      theme.palette.mode === "dark" ? option.dark : option.light,
    color: (theme: Theme) =>
      theme.palette.mode === "dark" ? "#0B1324" : "#FFFFFF",
  };
};
