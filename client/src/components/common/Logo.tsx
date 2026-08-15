import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export default function Logo({ size = 32, showWordmark = false, className }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="img"
        aria-label="Craftboard logo"
        className="shrink-0 drop-shadow-[0_2px_6px_-2px_rgba(0,0,0,0.35)]"
      >
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="11" fill="url(#logo-grad)" />

        {/* swoosh ring */}
        <path
          d="M14.3 13.3 A8.8 8.8 0 1 0 25.7 13.3"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.3"
          strokeLinecap="round"
        />

        {/* fountain pen nib */}
        <path
          d="M20 13.5 C23.2 15.2 23.6 19.6 20 27.2 C16.4 19.6 16.8 15.2 20 13.5 Z"
          fill="#ffffff"
        />

        {/* nib slit */}
        <path
          d="M20 15.2 L20 24.2"
          fill="none"
          stroke="url(#logo-grad)"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* breather hole */}
        <circle cx="20" cy="17.2" r="1.1" fill="url(#logo-grad)" opacity="0.9" />
      </svg>

      {showWordmark && (
        <span className="text-base font-semibold text-foreground whitespace-nowrap">
          Craftboard
        </span>
      )}
    </span>
  );
}
