export function Bill({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bill rectangle */}
      <rect
        x="10"
        y="30"
        width="80"
        height="40"
        rx="5"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Dollar sign in center */}
      <path
        d="M 50 40 L 50 42 M 50 58 L 50 60 M 45 45 C 45 42 47 40 50 40 C 53 40 55 42 55 45 C 55 48 53 50 50 50 C 47 50 45 52 45 55 C 45 58 47 60 50 60 C 53 60 55 58 55 55"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Corner circles */}
      <circle cx="20" cy="40" r="3" fill="white" opacity="0.6" />
      <circle cx="20" cy="60" r="3" fill="white" opacity="0.6" />
      <circle cx="80" cy="40" r="3" fill="white" opacity="0.6" />
      <circle cx="80" cy="60" r="3" fill="white" opacity="0.6" />
    </svg>
  );
}
