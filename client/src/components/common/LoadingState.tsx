import AppLoader from "@/components/common/AppLoader";

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return <AppLoader message={message} />;
}

export function LoadingSpinner({ size = 16 }: { size?: number }) {
  return (
    <span className="relative inline-block" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full border-2 border-indigo-200/70" />
      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
    </span>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="w-full aspect-[16/10] bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="flex items-center gap-3 pt-2">
          <div className="h-3 bg-muted rounded w-12" />
          <div className="h-3 bg-muted rounded w-12" />
          <div className="flex-1" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardGrid({
  count = 6,
  cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg">
          <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-muted rounded w-1/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
          <div className="h-3 bg-muted rounded w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonSettings() {
  return (
    <div className="space-y-6 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-6">
          <div className="h-5 bg-muted rounded w-24 mb-5" />
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded-lg w-full" />
            <div className="h-20 bg-muted rounded-lg w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5">
            <div className="h-3 bg-muted rounded w-20 mb-3" />
            <div className="h-7 bg-muted rounded w-12" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="h-5 bg-muted rounded w-32 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] bg-muted rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5">
              <div className="h-3 bg-muted rounded w-24 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
