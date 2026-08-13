import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Plus, RefreshCw } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { ProjectsSection } from "@/components/dashboard/ProjectsSection";
import { RecentPages } from "@/components/dashboard/RecentPages";
import { PinnedProjects } from "@/components/dashboard/PinnedProjects";
import { PendingRequests } from "@/components/dashboard/PendingRequests";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { SidebarStats } from "@/components/dashboard/SidebarStats";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { data, loading, error, refresh } = useDashboard();

  const firstName = user?.firstName || user?.username || "";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const pendingCount = data?.stats.pendingRequests ?? 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-500">
            {today}
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-foreground">
            {firstName ? `${greeting}, ${firstName}` : greeting}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening across your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/project")}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-[linear-gradient(110deg,#0ea5e9,#38bdf8)] px-3.5 text-xs font-medium text-white hover:opacity-90 shadow-[0_6px_18px_-8px_rgba(14,165,233,0.7)] transition-opacity"
          >
            <Plus size={14} />
            New project
          </button>
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"
        >
          {error}
        </motion.div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : data ? (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-8 lg:col-span-2">
            {data.recentPages?.length > 0 && <RecentPages pages={data.recentPages} />}
            <ProjectsSection projects={data.projects} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-8 self-start lg:sticky lg:top-6">
            <SidebarStats stats={data.stats} />
            {data.pinnedProjects?.length > 0 && (
              <PinnedProjects projects={data.pinnedProjects} />
            )}
            {pendingCount > 0 && (
              <PendingRequests requests={data.pendingRequests} onRespond={refresh} />
            )}
            <QuickActions />
          </aside>
        </div>
      ) : null}
    </div>
  );
}
