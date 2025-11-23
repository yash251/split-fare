interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-20 h-20",
  };

  const textSizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <img
        src="/logo.svg"
        alt="SplitFare Logo"
        className={sizeClasses[size]}
      />

      {/* Logo Text */}
      {showText && (
        <span className={`font-heading font-black ${textSizeClasses[size]}`}>
          SPLITFARE
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  return <Logo className={className} showText={false} size={size} />;
}
