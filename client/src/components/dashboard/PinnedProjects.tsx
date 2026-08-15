
import { useNavigate } from "react-router-dom";
import { Pin } from "lucide-react";
import type { DashboardProject } from "@/hooks/useDashboard";

interface PinnedProjectsProps {
  projects: DashboardProject[];
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

export function PinnedProjects({ projects }: PinnedProjectsProps) {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
          <Pin size={15} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground leading-none">Pinned</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{projects.length} pinned</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/project/${p.id}/pages`)}
            className="group text-left"
          >
            <div
              className={`relative aspect-video rounded-xl bg-gradient-to-br ${gradient(p.id)} flex items-center justify-center mb-1.5 overflow-hidden shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)] ring-1 ring-black/5`}
            >
              <span className="text-base font-bold text-white drop-shadow">
                {p.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <p className="text-[11px] font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {p.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
