export default function Star({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="18" y="18" width="64" height="64" />
      <rect x="18" y="18" width="64" height="64" transform="rotate(45 50 50)" />
      <rect x="34" y="34" width="32" height="32" transform="rotate(22.5 50 50)" opacity=".7" />
      <circle cx="50" cy="50" r="4.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
