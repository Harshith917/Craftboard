import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  search?: string;
  onSearch?: (val: string) => void;
  searchPlaceholder?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  search,
  onSearch,
  searchPlaceholder = "Search...",
  refreshing,
  onRefresh,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-6 w-full mb-8">
      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>

        {onSearch && (
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
            <Input
              value={search ?? ""}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9 h-9 rounded-lg bg-card shadow-sm border-border focus-visible:ring-2 focus-visible:ring-primary/30"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={refreshing}
            className="h-9 w-9 rounded-lg"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </Button>
        )}
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            className="h-9 rounded-lg bg-[linear-gradient(110deg,#6d5bf5,#a855f7)] hover:opacity-90 text-white border-0 shadow-[0_8px_20px_-8px_rgba(139,92,246,0.7)]"
          >
            + {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
