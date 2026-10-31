// Purpose: Provides the shared Convene brand mark used throughout the app.
/** Renders the app-wide converging-path logo mark. */
export function ConveneMark({ size = 19, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M2.5 5.2c4.1 0 5.3 2.8 8.7 5.5M21.2 6.7c-3.7.2-5.4 2.2-8.1 4M3.5 19c3.6-.2 5.2-2.7 7.9-5.3m9.1 3.8c-3.6-.2-5.1-2.2-8-4"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
      <path d="m12 9.2 2.8 2.8-2.8 2.8L9.2 12 12 9.2Z" fill="currentColor" />
      <circle cx="12" cy="12" r="1" fill="var(--landing-paper, currentColor)" />
    </svg>
  );
}
