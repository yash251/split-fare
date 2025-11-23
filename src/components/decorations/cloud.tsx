export function Cloud({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M150 60C150 48.954 141.046 40 130 40C127.386 40 124.922 40.556 122.708 41.564C118.654 28.742 106.822 20 93 20C76.431 20 63 33.431 63 50C63 50.685 63.024 51.364 63.070 52.038C56.296 54.492 51 61.096 51 69C51 79.493 59.507 88 70 88H135C144.389 88 152 80.389 152 71C152 65.754 149.328 61.174 145.268 58.522C147.706 57.024 149.444 54.671 150 60Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="white"
      />
    </svg>
  );
}
