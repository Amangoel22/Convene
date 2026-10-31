// Purpose: typography implements this source module.
export const TYPOGRAPHY = {
  fontFamily: {
    sans: ["Inter", "system-ui", "sans-serif"],
    mono: ["JetBrains Mono", "monospace"],
  },
  fontSize: {
    pageTitle: "clamp(1.8rem, 2.35vw, 2.35rem)",
    pageTitleHero: "clamp(2.4rem, 4vw, 3.5rem)",
    badge: "10px",
    xs: "12px",
    sm: "14px",
    base: "16px",
    lg: "18px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "30px",
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
    pageTitle: 800,
  },
  letterSpacing: {
    pageTitle: "-0.055em",
  },
  lineHeight: {
    pageTitle: 1.08,
  },
};
