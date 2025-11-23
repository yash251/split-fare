export function Coin({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Coin circle */}
      <circle cx="50" cy="50" r="40" fill="currentColor" opacity="0.9" />
      <circle cx="50" cy="50" r="30" fill="none" stroke="white" strokeWidth="3" />
      {/* Dollar sign inside */}
      <path
        d="M 50 30 L 50 35 M 50 65 L 50 70 M 42 40 C 42 35 45 32 50 32 C 55 32 58 35 58 40 C 58 45 55 48 50 48 C 45 48 42 51 42 56 C 42 61 45 64 50 64 C 55 64 58 61 58 56"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
