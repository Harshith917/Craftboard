"use client";

import { useRouter } from "next/navigation";
import { History, ExternalLink, FileText } from "lucide-react";
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

interface RecentPagesProps {
  pages: RecentPage[];
}

export function RecentPages({ pages }: RecentPagesProps) {
  const router = useRouter();

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-violet-50 text-violet-600">
          <History className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Recent Pages</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {pages.map((p) => (
          <button
            key={p.pageId}
            onClick={() => router.push(`/editor/${p.projectId}/page/${p.pageId}`)}
            className="flex items-center gap-3 p-3 rounded-xl surface surface-hover text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center shrink-0 ring-1 ring-black/5">
              <FileText className="w-4 h-4 text-violet-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {p.pageName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {p.projectName} · {timeAgo(p.visitedAt)}
              </p>
            </div>
            <ExternalLink className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary shrink-0 transition-colors" />
          </button>
        ))}
      </div>
    </section>
  );
}
