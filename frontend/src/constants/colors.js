// Purpose: colors implements this source module.
export const COLORS = {
  // Brand / Accent Colors
  primary: "#B85C38",
  primaryHover: "#8E432B",
  primaryLight: "#F0DFD4",
  
  // Backgrounds & Neutrals
  dark: "#2A2622",
  grayText: "#6E665C",
  grayMuted: "#9A9084",
  grayBg: "#EDE6DC",
  grayBgHover: "#E7D8C9",
  cardBg: "#FFFDF8",
  headerBg: "#F8F4EE",

  // Status Tones
  success: "#4F7A62",
  warning: "#A9792F",
  error: "#B04A3A",
  info: "#8B6F5A",
  purple: "#806A82",

  // Named aliases for new and refactored UI work.
  blue1: "#B85C38",
  blueDark: "#8E432B",
  green1: "#4F7A62",
  greenDark: "#365A46",
  red1: "#B04A3A",
  redDark: "#85362C",
  gray1: "#EDE6DC",
  gray2: "#F5F1EA",

  // Shared page-title gradient, paired with the active theme.
  pageTitleStart: "#2A2622",
  pageTitleEnd: "#B85C38",
  pageTitleStartDark: "#2A2622",
  pageTitleEndDark: "#B85C38",
};

export const COLOR_CLASSES = {
  // Common text color utilities
  textDark: "text-token-primary",
  textMuted: "text-token-muted",
  textSubtle: "text-token-secondary",
  textPrimary: "text-token-accent",

  // Common background utilities
  bgLight: "field-token",
  bgCard: "surface-token",
  bgPrimaryLight: "accent-surface-token",
};

// Purpose: map semantic status names to compiled theme-aware text tokens.
export const STATUS_TEXT_CLASSES = {
  Todo: "text-token-muted",
  "In Progress": "text-token-accent",
  Done: "text-token-success",
  Unconfirmed: "text-token-warning",
  Registered: "text-token-warning",
  Confirmed: "text-token-success",
  "Checked In": "text-token-accent",
  Rejected: "text-token-error",
  Completed: "text-token-success",
  LIVE: "text-token-success",
  current: "text-token-accent",
  complete: "text-token-muted",
  upcoming: "text-token-secondary",
};

// Purpose: map semantic priority names to compiled theme-aware text tokens.
export const PRIORITY_TEXT_CLASSES = {
  Critical: "text-token-error",
  High: "text-token-warning",
  Medium: "text-token-accent",
  Low: "text-token-muted",
};
