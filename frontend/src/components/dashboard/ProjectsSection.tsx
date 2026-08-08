"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FolderOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { ProjectCard } from "./ProjectCard";
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

interface ProjectsSectionProps {
  projects: DashboardProject[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const debouncedSearch = useDebounce(search);
  const [favorites, setFavorites] = useState(getFavorites);
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);

  const handleInvite = useCallback((project: { id: string }) => {
    setInviteProjectId(project.id);
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch = !debouncedSearch ||
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (p.description?.toLowerCase() || "").includes(debouncedSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (showFavorites) return favorites.has(p.id);
    return true;
  });

  return (
    <div className="rounded-2xl surface p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted">
            <button
              onClick={() => setShowFavorites(false)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                !showFavorites
                  ? "bg-white text-primary shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowFavorites(true)}
              className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                showFavorites
                  ? "bg-white text-primary shadow-sm font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Favorites
            </button>
          </div>
        </div>

        <div className="relative w-56">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-8 h-8 text-xs rounded-lg bg-card"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center mb-3 ring-1 ring-black/5">
            <FolderOpen size={20} className="text-violet-400" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => router.push(`/project/${project.id}/pages`)}
              onInvite={handleInvite}
            />
          ))}
        </div>
      )}

      <InviteDialog
        open={inviteProjectId !== null}
        onOpenChange={(open) => { if (!open) setInviteProjectId(null); }}
        projectId={inviteProjectId ?? ""}
      />
    </div>
  );
}
