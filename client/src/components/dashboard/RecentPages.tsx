import { useNavigate } from "react-router-dom";
import { ArrowUpRight, FileText } from "lucide-react";
import type { RecentPage } from "@/hooks/useDashboard";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const GRADIENTS = [
  "from-indigo-500 via-indigo-400 to-cyan-400",
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-indigo-600 via-violet-600 to-purple-600",
  "from-slate-800 via-slate-700 to-slate-600",
];

function gradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

interface RecentPagesProps {
  pages: RecentPage[];
}

export function RecentPages({ pages }: RecentPagesProps) {
  const navigate = useNavigate();
  const visible = pages.slice(0, 6);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Continue where you left off</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Jump back into your most recent work</p>
        </div>
        <span className="text-[11px] font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
          {visible.length} recent page{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 pt-0 sm:grid-cols-2">
        {visible.map((p) => (
          <button
            key={p.pageId}
            onClick={() => navigate(`/editor/${p.projectId}/page/${p.pageId}`)}
            className="group flex items-center gap-4 rounded-xl border border-border bg-app p-4 text-left transition-all hover:border-neutral-300 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-14px_rgba(0,0,0,0.3)] dark:hover:border-neutral-600"
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient(p.projectId)} text-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]`}
            >
              <FileText size={20} className="drop-shadow" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {p.pageName}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {p.projectName} · {timeAgo(p.visitedAt)}
              </p>
            </div>
            <span className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
              <ArrowUpRight size={16} />
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
