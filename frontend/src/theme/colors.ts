const lightAppColors = {
  common: { white: "#FFFFFF" },
  background: {
    default: "#F7F8FA",
    paper: "#FFFFFF",
    field: "#EEF1F5",
  },
  brand: {
    navy: "#16213E",
    navyChannel: "22 33 62",
    navyHover: "#202D4D",
    navySoft: "#E7ECF7",
    accent: "#16213E",
  },
  text: {
    event: "#16213E",
    onDark: "#FFFFFF",
    onDarkSecondary: "rgba(255, 255, 255, 0.72)",
    onDarkMuted: "rgba(255, 255, 255, 0.5)",
  },
  border: {
    card: "rgba(22, 33, 62, 0.06)",
    field: "#C4CAD4",
    input: "rgba(0, 0, 0, 0.23)",
    onDark: "rgba(255, 255, 255, 0.22)",
    onDarkHover: "rgba(255, 255, 255, 0.38)",
    sidebar: "rgba(255, 255, 255, 0.08)",
  },
  navigation: {
    active: "rgba(76, 150, 255, 0.2)",
    icon: "#8BBCFF",
    hover: "rgba(255, 255, 255, 0.08)",
  },
  status: {
    success: {
      text: "#3B7D43",
      textChannel: "59 125 67",
      surface: "#D8ECD9",
      border: "#D8ECD9",
    },
    error: {
      surface: "#FDECEC",
      border: "#F2C8C8",
    },
  },
  event: {
    lecture: { main: "#3478B9", surface: "#D9EAF7" },
    seminar: { main: "#3B7D43", surface: "#D8ECD9" },
    workMeeting: { main: "#7255AD", surface: "#E2D9F1" },
    meeting: { main: "#C96D22", surface: "#FADDC4" },
  },
  overlay: {
    tooltip: "rgba(97, 97, 97, 0.96)",
    whiteStrong: "#FFFFFF",
  },
  shadow: {
    card: "rgba(22, 33, 62, 0.08)",
    primary: "rgba(25, 118, 210, 0.24)",
    navy: "rgba(22, 33, 62, 0.08)",
    soft: "rgba(0, 0, 0, 0.12)",
    medium: "rgba(0, 0, 0, 0.18)",
    strong: "rgba(0, 0, 0, 0.22)",
  },
  gradient: {
    lecture: "rgba(52, 120, 185, 0.10)",
    meeting: "rgba(201, 109, 34, 0.10)",
  },
};

export type AppColors = typeof lightAppColors;

export const darkAppColors: AppColors = {
  common: { white: "#FFFFFF" },
  background: {
    default: "#182334",
    paper: "#223044",
    field: "#2B3A4F",
  },
  brand: {
    navy: "#07111F",
    navyChannel: "7 17 31",
    navyHover: "#0C1A2D",
    navySoft: "#293E59",
    accent: "#B8CCE5",
  },
  text: {
    event: "#EFF4FB",
    onDark: "#FFFFFF",
    onDarkSecondary: "rgba(255, 255, 255, 0.74)",
    onDarkMuted: "rgba(255, 255, 255, 0.52)",
  },
  border: {
    card: "rgba(219, 228, 241, 0.14)",
    field: "#526178",
    input: "rgba(219, 228, 241, 0.28)",
    onDark: "rgba(255, 255, 255, 0.22)",
    onDarkHover: "rgba(255, 255, 255, 0.4)",
    sidebar: "rgba(255, 255, 255, 0.08)",
  },
  navigation: {
    active: "rgba(91, 156, 255, 0.24)",
    icon: "#91BDFF",
    hover: "rgba(255, 255, 255, 0.08)",
  },
  status: {
    success: {
      text: "#86D99A",
      textChannel: "134 217 154",
      surface: "#263F34",
      border: "#365E47",
    },
    error: {
      surface: "#462D36",
      border: "#75414F",
    },
  },
  event: {
    lecture: { main: "#5FAAF0", surface: "#315B7F" },
    seminar: { main: "#68D681", surface: "#356349" },
    workMeeting: { main: "#AF8BE8", surface: "#554473" },
    meeting: { main: "#F19A58", surface: "#704B34" },
  },
  overlay: {
    tooltip: "rgba(6, 12, 22, 0.96)",
    whiteStrong: "#FFFFFF",
  },
  shadow: {
    card: "rgba(0, 0, 0, 0.28)",
    primary: "rgba(50, 125, 235, 0.3)",
    navy: "rgba(0, 0, 0, 0.2)",
    soft: "rgba(0, 0, 0, 0.2)",
    medium: "rgba(0, 0, 0, 0.3)",
    strong: "rgba(0, 0, 0, 0.38)",
  },
  gradient: {
    lecture: "rgba(70, 135, 205, 0.16)",
    meeting: "rgba(211, 126, 60, 0.14)",
  },
};

export { lightAppColors };
