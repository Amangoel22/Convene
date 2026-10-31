// Purpose: PageTitle gives operational pages one shared display-heading style.
import { TYPOGRAPHY } from "@/constants/typography";

// Renders a theme-aware page heading using the shared design constants.
export function PageTitle({ children, className = "", size = "page" }) {
  return (
    <h1
      className={`workspace-page-title ${className}`.trim()}
      style={{
        fontSize: size === "hero" ? TYPOGRAPHY.fontSize.pageTitleHero : TYPOGRAPHY.fontSize.pageTitle,
        fontWeight: TYPOGRAPHY.fontWeight.pageTitle,
        letterSpacing: TYPOGRAPHY.letterSpacing.pageTitle,
        lineHeight: TYPOGRAPHY.lineHeight.pageTitle,
      }}
    >
      {children}
    </h1>
  );
}
