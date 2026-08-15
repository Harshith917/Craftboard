import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/lib/api";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Pencil, Trash2, Check, X, Settings,
  Users, Loader2, Send, LogIn, Clock, Plus, Sparkles,
} from "lucide-react";
import {
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { InviteDialog } from "@/components/invitations/InviteDialog";
import { SkeletonGrid } from "@/components/custom/SkeletonGrid";
import { EmptyState } from "@/components/custom/EmptyState";
import PagesAIAssistant from "@/components/ai/PagesAIAssistant";

interface IPage {
  id: string;
  name: string;
  order: number;
  createdAt: string;
  projectId: string;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PublicProject {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  visibility: "public" | "private";
  owner: { id: string; firstName: string | null; lastName: string | null; imageUrl: string | null };
  memberCount: number;
  pagesCount: number;
  isMember: boolean;
  myRole: string | null;
  hasPendingRequest: boolean;
  pendingRequestId: string | null;
  hasPendingInvitation: boolean;
}

const LIMIT = 8;

export default function PagesPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiRef = useRef(useApi());

  const [pages, setPages] = useState<IPage[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessCheck, setAccessCheck] = useState<"loading" | "member" | "nonmember">("loading");
  const [publicProject, setPublicProject] = useState<PublicProject | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Check access first
  useEffect(() => {
    let cancelled = false;
    apiRef.current.get(`project/public/${projectId}`).then((data: any) => {
      if (cancelled) return;
      setPublicProject(data);
      setAccessCheck(data.isMember ? "member" : "nonmember");
    }).catch(() => {
      if (!cancelled) {
        toast.error("Failed to load project");
        setAccessCheck("nonmember");
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [projectId]);

  const fetchPages = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await apiRef.current.get(
          `project/${projectId}/pages?page=${page}&limit=${LIMIT}&search=${debouncedSearch}`,
        );
        setPages(res.data);
        setMeta(res.meta);
      } catch {
        toast.error("Failed to load pages");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [projectId, page, debouncedSearch],
  );

  useEffect(() => {
    if (accessCheck === "member") fetchPages();
  }, [fetchPages, accessCheck]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await apiRef.current.post(`project/${projectId}/pages`);
      toast.success("Page created successfully");
      fetchPages(true);
    } catch {
      toast.error("Failed to create page");
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (pageId: string) => {
    if (!editingName.trim()) return;
    try {
      const updated = await apiRef.current.patch(`project/${projectId}/pages/${pageId}`, { name: editingName });
      setPages((prev) => prev.map((p) => (p.id === pageId ? { ...p, name: updated.name } : p)));
      setEditingId(null);
      toast.success("Page renamed successfully");
    } catch {
      toast.error("Failed to rename page");
    }
  };

  const handleDelete = async (pageId: string) => {
    try {
      await apiRef.current.delete(`project/${projectId}/pages/${pageId}`);
      toast.success("Page deleted successfully");
      fetchPages(true);
    } catch {
      toast.error("Failed to delete page");
    }
  };

  const handleRequestAccess = async () => {
    setRequesting(true);
    try {
      await apiRef.current.post("access-requests", { projectId });
      toast.success("Access request sent");
      setPublicProject((prev) => prev ? { ...prev, hasPendingRequest: true } : prev);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to request access");
    } finally {
      setRequesting(false);
    }
  };

  // Non-member view
  if (accessCheck === "nonmember" && publicProject) {
    const p = publicProject;
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-card border border-border rounded-2xl max-w-md w-full overflow-hidden shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)]">
          <div className="h-32 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-800 flex items-end p-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-indigo-500/20 blur-2xl" />
            <h1 className="text-xl font-bold text-white relative">{p.name}</h1>
          </div>
          <div className="p-6">
            {p.description && (
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.description}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <Users size={12} />
                {p.memberCount} member{p.memberCount !== 1 ? "s" : ""}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                {p.visibility === "public" ? "Public project" : "Private project"}
              </span>
            </div>

            {p.hasPendingRequest ? (
              <div className="px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2">
                <Clock size={14} className="text-amber-600" />
                <p className="text-xs text-amber-700">Access request pending — waiting for the owner to respond.</p>
              </div>
            ) : p.hasPendingInvitation ? (
              <div className="px-4 py-3 bg-primary/5 border border-primary/15 rounded-xl flex items-center gap-2">
                <Send size={14} className="text-primary" />
                <p className="text-xs text-primary">You have a pending invitation. Check your invitations.</p>
              </div>
            ) : (
              <button
                onClick={handleRequestAccess}
                disabled={requesting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)] transition-all"
              >
                {requesting ? <Loader2 size={14} className="animate-spin" /> : <LogIn size={14} />}
                {requesting ? "Sending request..." : "Request access to this project"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Member view
  return (
    <div>
      <PageHeader
        eyebrow="Project"
        title="Pages"
        subtitle={meta ? `${meta.total} page${meta.total !== 1 ? "s" : ""}` : "Pages are your design canvases"}
        actionLabel={creating ? "Adding..." : "Add page"}
        actionIcon={<Plus className="w-4 h-4" />}
        onAction={handleCreate}
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Search pages..."
        refreshing={refreshing}
        onRefresh={() => fetchPages(true)}
      />

      <div className="flex items-center justify-end gap-2 mb-5">
        <button
          onClick={() => setAiOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          AI Assistant
        </button>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Users className="w-3.5 h-3.5" />
          Invite
        </button>
        <button
          onClick={() => navigate(`/project/${projectId}/settings`)}
          className="flex items-center gap-2 px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          Project Settings
        </button>
      </div>

      {loading ? (
        <SkeletonGrid count={LIMIT} columns="grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" />
      ) : pages.length === 0 ? (
        <EmptyState
          illustration="pages"
          title={debouncedSearch ? `No results for "${debouncedSearch}"` : "No pages yet"}
          description={debouncedSearch ? "Try a different search term." : "Add your first page to start designing."}
          action={debouncedSearch ? undefined : { label: "Add Page", onClick: handleCreate }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pages.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/editor/${projectId}/page/${p.id}`)}
              className="group bg-card border border-border rounded-2xl p-4 hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)] transition-all cursor-pointer"
            >
              <div className="w-full aspect-video bg-gradient-to-br from-muted via-muted/50 to-primary/5 rounded-xl mb-3 flex items-center justify-center text-muted-foreground text-sm border border-border">
                {p.order + 1}
              </div>

              {editingId === p.id ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(p.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="h-7 text-xs px-2 flex-1"
                    autoFocus
                  />
                  <button onClick={() => handleRename(p.id)} className="text-emerald-600 hover:text-emerald-700 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground truncate">{p.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingId(p.id); setEditingName(p.name); }}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="text-muted-foreground hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 px-4 py-3 border border-border rounded-xl bg-card">
          <p className="text-xs text-muted-foreground">
            Page {page} of {meta.totalPages} · {meta.total} page{meta.total !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-1">
            <PaginationPrevious
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === meta.totalPages || (p >= page - 1 && p <= page + 1))
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                return (
                  <span key={p} className="flex items-center">
                    {prev && p - prev > 1 && <PaginationEllipsis />}
                    <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
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

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} projectId={projectId ?? ""} />

      <PagesAIAssistant
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        projectId={projectId ?? ""}
        projectName={publicProject?.name ?? "this project"}
        pages={pages}
      />
    </div>
  );
}
