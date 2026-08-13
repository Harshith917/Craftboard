export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-pulse">
      {/* Main column */}
      <div className="space-y-8 lg:col-span-2">
        {/* Recent pages */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-44 bg-muted rounded" />
            <div className="h-3 w-24 bg-muted/60 rounded" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="h-14 w-14 shrink-0 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects table */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between p-5 pb-4">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded" />
              <div className="h-3 w-28 bg-muted/60 rounded" />
            </div>
            <div className="h-8 w-56 bg-muted rounded" />
          </div>
          <div className="space-y-1 px-5 pb-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="h-9 w-9 rounded-lg bg-muted" />
                <div className="h-3.5 flex-1 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted/60 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="h-8 w-8 rounded-lg bg-muted" />
              <div className="h-5 w-8 bg-muted rounded" />
              <div className="h-2.5 w-14 bg-muted/60 rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <div className="h-4 w-16 bg-muted rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-3 w-full bg-muted/60 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
