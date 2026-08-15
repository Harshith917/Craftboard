import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  search?: string;
  onSearch?: (val: string) => void;
  searchPlaceholder?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actionLabel,
  onAction,
  actionIcon,
  search,
  onSearch,
  searchPlaceholder = "Search...",
  refreshing,
  onRefresh,
}: PageHeaderProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
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
              className="h-9 rounded-lg bg-primary text-primary-foreground border-0 hover:bg-primary/90 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)]"
            >
              {actionIcon}
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
      <div className="h-px w-full bg-border mt-5" />
    </div>
  );
}
