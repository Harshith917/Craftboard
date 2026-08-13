import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FolderOpen, Star, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { InviteDialog } from "@/components/invitations/InviteDialog";
import type { DashboardProject } from "@/hooks/useDashboard";

function getFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem("dashboard-favorites");
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

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

const THUMBNAIL_GRADIENTS = [
  "from-sky-500 via-sky-400 to-cyan-400",
  "from-slate-800 via-slate-700 to-slate-600",
  "from-sky-600 via-sky-500 to-cyan-500",
  "from-cyan-500 via-sky-400 to-sky-300",
];

function thumbnailGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return THUMBNAIL_GRADIENTS[Math.abs(hash) % THUMBNAIL_GRADIENTS.length];
}

const ROLE_BADGE: Record<string, string> = {
  owner: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  editor: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20",
  viewer: "bg-muted text-muted-foreground border-border",
};

interface ProjectsSectionProps {
  projects: DashboardProject[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const debouncedSearch = useDebounce(search);
  const [favorites, setFavorites] = useState(getFavorites);
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);

  const handleInvite = useCallback((project: { id: string }) => {
    setInviteProjectId(project.id);
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("dashboard-favorites", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !debouncedSearch ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.description?.toLowerCase() || "").includes(debouncedSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (showFavorites) return favorites.has(p.id);
    return true;
  });

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {filtered.length} of {projects.length} shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
            <button
              onClick={() => setShowFavorites(false)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                !showFavorites
                  ? "bg-card text-primary shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                showFavorites
                  ? "bg-card text-primary shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Favorites
            </button>
          </div>

          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-8 h-8 text-xs rounded-lg bg-app"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-50 to-cyan-100 flex items-center justify-center mb-3 ring-1 ring-black/5">
            <FolderOpen size={20} className="text-sky-500" />
          </div>
          <p className="text-sm text-muted-foreground">
            {debouncedSearch
              ? "No projects match your search"
              : showFavorites
                ? "No favorite projects yet"
                : "No projects yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-y border-border/60 bg-muted/40 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-2.5 font-medium">Project</th>
                <th className="hidden px-3 py-2.5 font-medium md:table-cell">Role</th>
                <th className="hidden px-3 py-2.5 text-right font-medium sm:table-cell">Pages</th>
                <th className="hidden px-3 py-2.5 text-right font-medium lg:table-cell">Members</th>
                <th className="hidden px-3 py-2.5 text-right font-medium md:table-cell">Updated</th>
                <th className="w-16 px-5 py-2.5 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const fav = favorites.has(project.id);
                return (
                  <tr
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}/pages`)}
                    className="group cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30 last:border-b-0"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${thumbnailGradient(
                            project.id,
                          )} text-[10px] font-bold text-white shadow-sm`}
                        >
                          {project.name.slice(0, 2).toUpperCase() || "PR"}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary">
                            {project.name}
                          </p>
                          {project.description && (
                            <p className="truncate text-xs text-muted-foreground">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-3 py-3.5 md:table-cell">
                      {project.myRole ? (
                        <span
                          className={`inline-block text-[10px] font-medium capitalize px-1.5 py-0.5 rounded-md border ${
                            ROLE_BADGE[project.myRole] || ROLE_BADGE.viewer
                          }`}
                        >
                          {project.myRole}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="hidden px-3 py-3.5 text-right text-xs tabular-nums text-muted-foreground sm:table-cell">
                      {project.pagesCount ?? 0}
                    </td>
                    <td className="hidden px-3 py-3.5 text-right text-xs tabular-nums text-muted-foreground lg:table-cell">
                      {project.memberCount ?? 0}
                    </td>
                    <td className="hidden px-3 py-3.5 text-right text-xs whitespace-nowrap text-muted-foreground md:table-cell">
                      {timeAgo(project.updatedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(project.id);
                          }}
                          title="Toggle favorite"
                          className={`rounded-md p-1.5 transition-colors ${
                            fav
                              ? "text-amber-400 hover:text-amber-500"
                              : "text-muted-foreground opacity-0 hover:text-amber-400 group-hover:opacity-100"
                          }`}
                        >
                          <Star size={14} fill={fav ? "currentColor" : "none"} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvite(project);
                          }}
                          title="Invite"
                          className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                        >
                          <UserPlus size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <InviteDialog
        open={inviteProjectId !== null}
        onOpenChange={(open) => {
          if (!open) setInviteProjectId(null);
        }}
        projectId={inviteProjectId ?? ""}
      />
    </section>
  );
}
