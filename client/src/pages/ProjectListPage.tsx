import { useEffect, useState, useCallback, useRef } from "react";
import { useApi } from "@/lib/api";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import {
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { SkeletonGrid } from "@/components/custom/SkeletonGrid";
import { EmptyState } from "@/components/custom/EmptyState";
import { ProjectCard, IProject } from "@/components/project/ProjectCard";
import { ProjectModal } from "@/components/project/ProjectModal";
import { InviteDialog } from "@/components/invitations/InviteDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useDebounce } from "@/hooks/useDebounce";

const LIMIT = 12;

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "owned", label: "Owned" },
  { value: "shared", label: "Shared" },
  { value: "favorites", label: "Favorites" },
  { value: "archived", label: "Archived" },
] as const;

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ProjectsPage() {
  const apiRef = useRef(useApi());
  const navigate = useNavigate();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<IProject | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [inviteProjectId, setInviteProjectId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IProject | null>(null);
  const [leaveTarget, setLeaveTarget] = useState<IProject | null>(null);
  const { user } = useUser();
  const debouncedSearch = useDebounce(search, 300);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), filter });
      if (debouncedSearch) params.set("search", debouncedSearch);
      const res = await apiRef.current.get(`project?${params}`);
      setProjects(res.items);
      setMeta(res);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [page, filter, debouncedSearch]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleToggleFavorite = useCallback(async (project: IProject) => {
    if (!project.membershipId) return;
    try {
      await apiRef.current.post(`project/membership/${project.membershipId}/toggle-favorite`);
      fetchProjects();
    } catch {
      toast.error("Failed to update favorite");
    }
  }, [fetchProjects]);

  const handleTogglePin = useCallback(async (project: IProject) => {
    try {
      await apiRef.current.post(`project/${project.id}/toggle-pin`);
      fetchProjects();
    } catch {
      toast.error("Failed to update pin");
    }
  }, [fetchProjects]);

  const handleToggleArchive = useCallback(async (project: IProject) => {
    if (!project.membershipId) return;
    try {
      await apiRef.current.post(`project/membership/${project.membershipId}/toggle-archive`);
      toast.success(project.isArchived ? "Project unarchived" : "Project archived");
      fetchProjects();
    } catch {
      toast.error("Failed to update archive status");
    }
  }, [fetchProjects]);

  const handleCreate = async (data: { name: string; description: string }) => {
    try {
      await apiRef.current.post("project", data);
      toast.success("Project created successfully");
      setModalOpen(false);
      fetchProjects();
    } catch {
      toast.error("Failed to create project");
    }
  };

  const handleRename = useCallback((project: IProject) => {
    setRenameTarget(project);
    setRenameValue(project.name);
  }, []);

  const handleRenameSubmit = useCallback(async () => {
    if (!renameTarget || !renameValue.trim()) return;
    try {
      await apiRef.current.patch(`project/${renameTarget.id}`, { name: renameValue.trim() });
      toast.success("Project renamed");
      setRenameTarget(null);
      fetchProjects();
    } catch {
      toast.error("Failed to rename project");
    }
  }, [renameTarget, renameValue, fetchProjects]);

  const handleDelete = useCallback((project: IProject) => {
    setDeleteTarget(project);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await apiRef.current.delete(`project/${deleteTarget.id}`);
      toast.success("Project deleted");
      setDeleteTarget(null);
      fetchProjects();
    } catch {
      toast.error("Failed to delete project");
    }
  }, [deleteTarget, fetchProjects]);

  const handleSettings = useCallback((project: IProject) => {
    navigate(`/project/${project.id}/settings`);
  }, [navigate]);

  const handleInvite = useCallback((project: IProject) => {
    setInviteProjectId(project.id);
  }, []);

  const handleLeave = useCallback(async (project: IProject) => {
    setLeaveTarget(project);
  }, []);

  const handleLeaveConfirm = useCallback(async () => {
    if (!leaveTarget || !user?.id) return;
    try {
      await apiRef.current.delete(`projects/${leaveTarget.id}/members/${user.id}`);
      toast.success("Left project");
      setLeaveTarget(null);
      fetchProjects();
    } catch {
      toast.error("Failed to leave project");
    }
  }, [leaveTarget, user?.id, fetchProjects]);

  const handleDuplicate = useCallback(async (project: IProject) => {
    try {
      await apiRef.current.post("project", {
        name: `${project.name} (copy)`,
        description: project.description,
        visibility: project.visibility,
      });
      toast.success("Project duplicated");
      fetchProjects();
    } catch {
      toast.error("Failed to duplicate project");
    }
  }, [fetchProjects]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">Workspace</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            {meta ? `${meta.total} project${meta.total !== 1 ? "s" : ""} in your workspace` : "Create and manage your design projects"}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 shadow-[0_8px_20px_-8px_rgba(14,165,233,0.6)] transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8 border-b border-border">
        <div className="flex items-center gap-5">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`py-2.5 text-sm transition-colors border-b-2 ${
                filter === opt.value
                  ? "text-foreground font-semibold border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="relative w-64 mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 bg-card"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <SkeletonGrid count={LIMIT} />
      ) : projects.length === 0 ? (
        <EmptyState
          illustration="projects"
          title={debouncedSearch ? `No results for "${debouncedSearch}"` : "No projects yet"}
          description={
            debouncedSearch
              ? "Try a different search term or clear the search."
              : "Create your first project and start collaborating with your team."
          }
          action={
            debouncedSearch
              ? undefined
              : { label: "New Project", onClick: () => setModalOpen(true) }
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => navigate(`/project/${project.id}/pages`)}
                onRename={handleRename}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onToggleFavorite={handleToggleFavorite}
                onToggleArchive={handleToggleArchive}
                onTogglePin={handleTogglePin}
                onSettings={handleSettings}
                onInvite={handleInvite}
                onLeave={handleLeave}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 px-4 py-3 border border-border rounded-xl bg-card">
              <p className="text-xs text-muted-foreground">
                Page {page} of {meta.totalPages} · {meta.total} project{meta.total !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1">
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 ||
                      p === meta.totalPages ||
                      (p >= page - 1 && p <= page + 1),
                  )
                  .map((p, i, arr) => {
                    const prev = arr[i - 1];
                    return (
                      <span key={p} className="flex items-center">
                        {prev && p - prev > 1 && (
                          <PaginationEllipsis />
                        )}
                        <PaginationLink
                          isActive={p === page}
                          onClick={() => setPage(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </span>
                    );
                  })}
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  className={page === meta.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </div>
            </div>
          )}
        </>
      )}

      <InviteDialog
        open={inviteProjectId !== null}
        onOpenChange={(open) => { if (!open) setInviteProjectId(null); }}
        projectId={inviteProjectId ?? ""}
      />

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete Project"
        description={`Delete "${deleteTarget?.name}"? This will permanently remove the project and all its data. This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={leaveTarget !== null}
        onOpenChange={(open) => { if (!open) setLeaveTarget(null); }}
        title="Leave Project"
        description={`Leave "${leaveTarget?.name}"? You will lose access to all its content.`}
        confirmLabel="Leave"
        variant="warning"
        onConfirm={handleLeaveConfirm}
      />

      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-xl border border-border p-5 w-80">
            <h3 className="text-sm font-semibold text-foreground mb-3">Rename Project</h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              className="w-full text-sm px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 mb-3"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRenameSubmit}
                className="px-3 py-1.5 text-xs text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors"
              >
                Rename
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
