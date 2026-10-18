export function Arrow({ direction = "right", className = "" }: { direction?: "right" | "left" | "external" | "down"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={`arrow arrow-${direction} ${className}`}>
      <path d="M4 12h15M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
