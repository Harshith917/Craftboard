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
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="36" height="36" rx="10" fill="url(#logo-grad)" />

        {/* board with folded corner */}
        <path
          d="M12 11h12a5 5 0 0 1 5 5v12a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4V11z"
          fill="#ffffff"
        />
        <path d="M24 11v5a0 0 0 0 0 0 0h5" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />

        {/* craft sparkle */}
        <circle cx="17" cy="21" r="2.2" fill="#4f46e5" />
        <path
          d="M17 15.4v1.8M17 24.8v1.8M11.4 21h1.8M20.8 21h1.8"
          stroke="#4f46e5"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className="text-base font-semibold text-foreground whitespace-nowrap">
          Craftboard
        </span>
      )}
    </span>
  );
}
