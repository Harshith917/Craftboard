import { cn } from "@/lib/utils";

interface AppLoaderProps {
  message?: string;
  fullscreen?: boolean;
  className?: string;
}

export default function AppLoader({ message, fullscreen = false, className }: AppLoaderProps) {
  return (
    <div
      role="status"
      aria-label={message || "Loading"}
      className={cn(
        "flex flex-col items-center justify-center gap-5",
        fullscreen ? "absolute inset-0 z-50 bg-background/60 backdrop-blur-sm" : "py-24",
        className,
      )}
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-sky-200/70" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-sky-500 animate-spin" />
        <div className="absolute inset-[16px] rounded-full bg-sky-500/25 animate-pulse" />
      </div>
      {message && <p className="text-sm font-medium text-muted-foreground">{message}</p>}
    </div>
  );
}
