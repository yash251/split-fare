export function Dollar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dollar sign */}
      <path
        d="M 50 10 L 50 20 M 50 80 L 50 90 M 35 30 C 35 20 40 15 50 15 C 60 15 65 20 65 30 C 65 40 60 45 50 45 C 40 45 35 50 35 60 C 35 70 40 75 50 75 C 60 75 65 70 65 60"
        stroke="currentColor"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
