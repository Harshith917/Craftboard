import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { useApi } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { ArrowLeft, Globe, Lock, Check, X, Trash2, Shield, Archive, ChevronDown, UserPlus, LogOut, Users, Settings2, AlertTriangle } from "lucide-react";
import { EmptyState } from "@/components/custom/EmptyState";
import { InviteDialog } from "@/components/invitations/InviteDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", desc: "Anyone can find and request access" },
  { value: "private", label: "Private", desc: "Only invited members can access" },
] as const;

const ROLE_OPTIONS = [
  { value: "viewer", label: "Viewer", desc: "Can only view and comment" },
  { value: "editor", label: "Editor", desc: "Can edit the canvas" },
  { value: "owner", label: "Owner", desc: "Full access and settings" },
] as const;

type SectionId = "general" | "members" | "permissions" | "danger";

const NAV_ITEMS: { id: SectionId; label: string; icon: typeof Settings2 }[] = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "members", label: "Members", icon: Users },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

export default function SettingsPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const apiRef = useRef(useApi());
  const socket = useSocket(projectId);

  const [project, setProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [myRole, setMyRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const [activeSection, setActiveSection] = useState<SectionId>("general");

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const { user } = useUser();

  const fetchSettings = useCallback(async () => {
    try {
      const [proj, settings] = await Promise.all([
        apiRef.current.get(`project/${projectId}`),
        apiRef.current.get(`project/${projectId}/settings`),
      ]);
      setProject(proj);
      setMembers(settings.members);
      setMyRole(settings.myRole);
      setName(proj.name);
      setDescription(proj.description ?? "");
      setVisibility(proj.visibility ?? "public");
    } catch {
      toast.error("Failed to load project settings");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchSettings();
    socket.on("project-updated", handler);
    return () => { socket.off("project-updated", handler); };
  }, [socket, fetchSettings]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const updated = await apiRef.current.patch(`project/${projectId}`, { name, description, visibility });
      setProject((prev: any) => ({ ...prev, ...updated }));
      socket?.emit("project-updated", { projectId });
      toast.success("Project updated");
    } catch {
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  const handleChangeRole = async (userId: string, role: string) => {
    try {
      await apiRef.current.patch(`projects/${projectId}/members/${userId}/role`, { role });
      setMembers((prev: any[]) =>
        prev.map((m) => (m.id === userId ? { ...m, role } : m)),
      );
      socket?.emit("project-updated", { projectId });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await apiRef.current.delete(`projects/${projectId}/members/${userId}`);
      setMembers((prev: any[]) => prev.filter((m) => m.id !== userId));
      socket?.emit("project-updated", { projectId });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleTransferOwnership = async () => {
    if (!transferTarget || !window.confirm("Transfer project ownership? This cannot be undone.")) return;
    try {
      await apiRef.current.post(`project/${projectId}/transfer-ownership`, { userId: transferTarget });
      toast.success("Ownership transferred");
      setTransferOpen(false);
      setTransferTarget("");
      fetchSettings();
      socket?.emit("project-updated", { projectId });
    } catch {
      toast.error("Failed to transfer ownership");
    }
  };

  const handleToggleArchive = async () => {
    try {
      const res = await apiRef.current.post(`project/${projectId}/toggle-archive`);
      toast.success(res.isArchived ? "Project archived" : "Project unarchived");
      fetchSettings();
      socket?.emit("project-updated", { projectId });
    } catch {
      toast.error("Failed to archive project");
    }
  };

  const handleDeleteProject = async () => {
    try {
      await apiRef.current.delete(`project/${projectId}`);
      toast.success("Project deleted");
      navigate("/project");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleLeaveProject = async () => {
    if (!user?.id) return;
    try {
      await apiRef.current.delete(`projects/${projectId}/members/${user.id}`);
      toast.success("Left project");
      navigate("/project");
    } catch {
      toast.error("Failed to leave project");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted/60 rounded-2xl" />
        <div className="h-64 bg-muted/60 rounded-2xl" />
        <div className="h-48 bg-muted/60 rounded-2xl" />
      </div>
    );
  }

  const isOwner = myRole === "owner";
  const nonOwnerMembers = members.filter((m) => m.role !== "owner");

  return (
    <div className="space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to project
        </button>

        <div className="mt-6 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">Project</p>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground truncate">{name}</p>
          </div>
          <span className="shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border border-border bg-card text-muted-foreground capitalize">
            {visibility === "public" ? (
              <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Public</span>
            ) : (
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
            )}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sub-nav rail */}
        <aside className="w-full lg:w-56 shrink-0 lg:sticky lg:top-0">
          <nav className="flex lg:flex-col gap-1 border border-border rounded-xl bg-card p-2 overflow-x-auto lg:overflow-x-visible">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === item.id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Section content */}
        <div className="flex-1 min-w-0 w-full">
          {activeSection === "general" && (
            <section className="surface rounded-2xl p-6">
              <div className="pb-5 mb-6 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">General</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Basic information about this project.</p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Project Icon</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl nav-active text-white flex items-center justify-center text-base font-bold shadow-[0_8px_24px_-8px_rgba(14,165,233,0.5)]">
                      {name.slice(0, 2).toUpperCase()}
                    </div>
                    <p className="text-xs text-muted-foreground">Auto-generated from project name</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isOwner}
                    className="w-full max-w-md px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted disabled:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isOwner}
                    rows={3}
                    className="w-full max-w-lg px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-muted disabled:text-muted-foreground resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1.5">Visibility</label>
                  <div className="flex flex-wrap gap-3">
                    {VISIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => isOwner && setVisibility(opt.value)}
                        disabled={!isOwner}
                        className={`flex items-start gap-3 p-3 border rounded-lg text-left transition-colors ${
                          visibility === opt.value
                            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-muted-foreground/40"
                        } ${!isOwner ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        {opt.value === "public" ? <Globe className="w-4 h-4 mt-0.5 text-primary" /> : <Lock className="w-4 h-4 mt-0.5 text-primary" />}
                        <div>
                          <div className="text-sm font-medium text-foreground">{opt.label}</div>
                          <div className="text-xs text-muted-foreground">{opt.desc}</div>
                        </div>
                        {visibility === opt.value && <Check className="w-4 h-4 text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                {isOwner && (
                  <div className="pt-2">
                    <button
                      onClick={handleSaveGeneral}
                      disabled={saving}
                      className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 shadow-[0_4px_16px_-6px_rgba(14,165,233,0.55)] transition-all"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeSection === "members" && (
            <section className="surface rounded-2xl p-6">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-border">
                <div>
                  <h2 className="text-base font-semibold text-foreground">Members</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">Manage who can access this project.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInviteOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-primary rounded-lg hover:bg-primary/90 shadow-[0_4px_16px_-6px_rgba(14,165,233,0.55)] transition-all"
                  >
                    <UserPlus size={13} />
                    Invite
                  </button>
                  <span className="text-xs text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</span>
                </div>
              </div>
              <div className="space-y-2">
                {members.length === 0 ? (
                  <EmptyState
                    illustration="members"
                    title="No members yet"
                    description="Invite team members to collaborate on this project."
                  />
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground overflow-hidden shrink-0">
                          {member.imageUrl ? (
                            <img src={member.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            [member.firstName, member.lastName].filter(Boolean).map((s: string) => s[0]).join("").toUpperCase().slice(0, 2) || "?"
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {[member.firstName, member.lastName].filter(Boolean).join(" ") || "Unknown"}
                            {member.id === user?.id && <span className="text-xs text-muted-foreground ml-1">(you)</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{member.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isOwner && member.role !== "owner" ? (
                          <div className="relative group">
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeRole(member.id, e.target.value)}
                              className="appearance-none text-xs px-2.5 py-1.5 pr-6 border border-border rounded-lg bg-card text-muted-foreground cursor-pointer hover:border-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                            >
                              {ROLE_OPTIONS.filter((r) => r.value !== "owner").map((r) => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                          </div>
                        ) : (
                          <span className={`text-xs font-medium px-2 py-1 rounded-lg capitalize ${
                            member.role === "owner" ? "bg-amber-50 text-amber-700" :
                            member.role === "editor" ? "bg-sky-50 text-sky-700" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {member.role}
                          </span>
                        )}

                        {isOwner && member.role !== "owner" && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors"
                            title="Remove member"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {activeSection === "permissions" && (
            <section className="surface rounded-2xl p-6">
              <div className="pb-5 mb-6 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">Permissions</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">Control who can find and access this project.</p>
              </div>
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                <Shield className="w-5 h-5 text-primary shrink-0" />
                <p className="text-sm text-muted-foreground">
                  {visibility === "public"
                    ? "This project is public. Anyone can find it and request access."
                    : "This project is private. Only invited members can access it."}
                </p>
              </div>
            </section>
          )}

          {activeSection === "danger" && (
            <section className="surface rounded-2xl p-6 border-rose-200">
              <div className="pb-5 mb-6 border-b border-rose-100">
                <h2 className="text-base font-semibold text-rose-600">Danger Zone</h2>
                <p className="mt-0.5 text-xs text-rose-400">Irreversible actions for this project.</p>
              </div>
              <div className="space-y-4">
                {isOwner && (
                  <>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-foreground">Archive Project</div>
                        <div className="text-xs text-muted-foreground">Hide from active project list</div>
                      </div>
                      <button
                        onClick={handleToggleArchive}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                        {project?.isArchived ? "Unarchive" : "Archive"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-foreground">Transfer Ownership</div>
                        <div className="text-xs text-muted-foreground">Give ownership to another member</div>
                      </div>
                      <div className="relative">
                        {transferOpen ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={transferTarget}
                              onChange={(e) => setTransferTarget(e.target.value)}
                              className="text-xs px-2.5 py-1.5 pr-6 border border-border rounded-lg bg-card text-muted-foreground focus:outline-none focus:ring-1 focus:ring-rose-500"
                            >
                              <option value="">Select member...</option>
                              {nonOwnerMembers.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {[m.firstName, m.lastName].filter(Boolean).join(" ") || "Unknown"}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={handleTransferOwnership}
                              disabled={!transferTarget}
                              className="px-3 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50 transition-colors"
                            >
                              Transfer
                            </button>
                            <button
                              onClick={() => { setTransferOpen(false); setTransferTarget(""); }}
                              className="p-1.5 text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setTransferOpen(true)}
                            className="px-3 py-1.5 text-sm border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          >
                            Transfer
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-rose-200 rounded-lg">
                      <div>
                        <div className="text-sm font-medium text-rose-600">Delete Project</div>
                        <div className="text-xs text-rose-400">Permanently delete this project and all its data</div>
                      </div>
                      <button
                        onClick={() => setDeleteConfirmOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </>
                )}

                {!isOwner && (
                  <div className="flex items-center justify-between p-4 border border-rose-200 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-rose-600">Leave Project</div>
                      <div className="text-xs text-rose-400">Remove yourself from this project</div>
                    </div>
                    <button
                      onClick={() => setLeaveConfirmOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Project"
        description="Delete this project permanently? All data will be lost. This cannot be undone."
        confirmLabel="Delete Project"
        variant="danger"
        onConfirm={handleDeleteProject}
      />

      <ConfirmDialog
        open={leaveConfirmOpen}
        onOpenChange={setLeaveConfirmOpen}
        title="Leave Project"
        description="Leave this project? You will lose access to all its content."
        confirmLabel="Leave Project"
        variant="warning"
        onConfirm={handleLeaveProject}
      />

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} projectId={projectId ?? ""} />
    </div>
  );
}
