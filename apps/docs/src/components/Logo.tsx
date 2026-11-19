/**
 * The Elea mark: a golden sphere under an arc of ice. Elea is the name of the woman found
 * asleep under the Antarctic ice in Barjavel's "La Nuit des temps"; the sphere is the one that
 * kept her world. The colours are the tokens' own, so the mark follows the theme.
 */
export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M4.5 19.5A11.5 11.5 0 0 1 27.5 19.5" fill="none" stroke="var(--elea-color-primary-600)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="16" cy="21" r="6" fill="var(--elea-color-secondary-500)" />
    </svg>
  );
}
