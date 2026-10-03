const white = "#FFFFFF";
const pageBackground = "#F7F8FA";
const navy = "#16213E";
const navySoft = "#E7ECF7";
const fieldBackground = "#EEF1F5";
const onDark = white;
const onDarkSecondary = "rgba(255, 255, 255, 0.72)";
const onDarkMuted = "rgba(255, 255, 255, 0.5)";
const translucentWhite = "rgba(255, 255, 255, 0.08)";
const navigationActive = "rgba(76, 150, 255, 0.2)";
const navigationIcon = "#8BBCFF";
const navyShadow = "rgba(22, 33, 62, 0.08)";
const blackShadowSoft = "rgba(0, 0, 0, 0.12)";
const blackShadowMedium = "rgba(0, 0, 0, 0.18)";
const blackShadowStrong = "rgba(0, 0, 0, 0.22)";
const green = "#3B7D43";
const greenSurface = "#D8ECD9";
const errorSurface = "#FDECEC";

export const appColors = {
  common: {
    white,
  },

  background: {
    default: pageBackground,
    paper: white,
    field: fieldBackground,
  },

  brand: {
    navy,
    navyHover: "#202D4D",
    navySoft,
  },

  text: {
    event: navy,
    onDark,
    onDarkSecondary,
    onDarkMuted,
  },

  border: {
    field: "#C4CAD4",
    input: "rgba(0, 0, 0, 0.23)",
    onDark: "rgba(255, 255, 255, 0.22)",
    onDarkHover: "rgba(255, 255, 255, 0.38)",
    sidebar: translucentWhite,
  },

  navigation: {
    active: navigationActive,
    icon: navigationIcon,
    hover: translucentWhite,
  },

  status: {
    success: {
      text: green,
      surface: greenSurface,
      border: greenSurface,
    },
    error: {
      surface: errorSurface,
      border: "#F2C8C8",
    },
  },

  event: {
    lecture: {
      main: "#3478B9",
      surface: "#D9EAF7",
    },
    seminar: {
      main: green,
      surface: greenSurface,
    },
    workMeeting: {
      main: "#7255AD",
      surface: "#E2D9F1",
    },
    meeting: {
      main: "#C96D22",
      surface: "#FADDC4",
    },
  },

  overlay: {
    tooltip: "rgba(97, 97, 97, 0.96)",
    whiteStrong: white,
  },

  shadow: {
    card: navyShadow,
    primary: "rgba(25, 118, 210, 0.24)",
    navy: navyShadow,
    soft: blackShadowSoft,
    medium: blackShadowMedium,
    strong: blackShadowStrong,
  },

  gradient: {
    lecture: "rgba(52, 120, 185, 0.10)",
    meeting: "rgba(201, 109, 34, 0.10)",
  },
} as const;

export type AppColors = typeof appColors;
