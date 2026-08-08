
import { useNavigate } from "react-router-dom";
import { Pin, ExternalLink } from "lucide-react";
import type { DashboardProject } from "@/hooks/useDashboard";

interface PinnedProjectsProps {
  projects: DashboardProject[];
}

const GRADIENTS = [
  "from-indigo-500 via-violet-500 to-purple-500",
  "from-teal-500 via-emerald-500 to-cyan-500",
  "from-fuchsia-500 via-purple-500 to-indigo-500",
  "from-amber-500 via-orange-500 to-rose-500",
];

function gradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function PinnedProjects({ projects }: PinnedProjectsProps) {
  const navigate = useNavigate();

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
          <Pin className="w-3.5 h-3.5" />
        </div>
        <h2 className="text-sm font-semibold text-foreground">Pinned</h2>
        <span className="text-[11px] text-muted-foreground">Â· {projects.length}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/project/${p.id}/pages`)}
            className="group text-left"
          >
            <div className={`relative aspect-video rounded-xl bg-gradient-to-br ${gradient(p.id)} flex items-center justify-center mb-1.5 overflow-hidden shadow-[0_8px_20px_-8px_rgba(0,0,0,0.35)]`}>
              <span className="text-lg font-bold text-white drop-shadow">
                {p.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {p.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
