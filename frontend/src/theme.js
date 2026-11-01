// Purpose: theme implements this source module.
export const colors = {
  background: {
    primary: "#F5F1EA",
    secondary: "#FFFDF8",
    glass: "rgba(255,253,248,0.62)",
    glassStrong: "rgba(255,253,248,0.86)",
  },
  accent: {
    gold: "#A9792F",
    goldHover: "#8E6424",
  },
  state: {
    success: "#4F7A62",
    warning: "#A9792F",
    error: "#B04A3A",
    info: "#8B6F5A",
  },
  text: {
    primary: "#2A2622",
    secondary: "#6E665C",
    muted: "#9A9084",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
};

export const radius = {
  card: 20,
  button: 16,
  input: 16,
  navbar: 26,
  sidebar: 28,
  modal: 32,
  pill: 999,
};

export const blur = {
  card: 22,
  navbar: 24,
  sidebar: 30,
  modal: 28,
};

export const shadows = {
  card: "0 8px 32px rgba(83,60,42,.06)",
  cardHover: "0 14px 42px rgba(83,60,42,.12)",
  hero: "0 18px 48px rgba(83,60,42,.1)",
  sidebar: "0 18px 48px rgba(83,60,42,.105)",
  gold: "0 0 0 1px rgba(169,121,47,.45), 0 14px 34px rgba(169,121,47,.16)",
};

export const animations = {
  fast: 0.15,
  medium: 0.25,
  slow: 0.35,
  spring: {
    stiffness: 320,
    damping: 26,
  },
};
