
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Move,
  MousePointer,
  RotateCcw,
  Save,
  ArrowLeft,
  Loader2,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Columns3,
  Rows3,
  Users,
  ChevronDown,
  X,
  LogOut,
} from "lucide-react";
import CollaboratorAvatars from "./CollaboratorAvatars";
import NotificationBell from "./NotificationBell";
import { ThemeToggle } from "./common/ThemeToggle";
import { useSocket } from "@/hooks/useSocket";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

type Role = "owner" | "editor" | "viewer";

const ROLE_STYLES: Record<Role, string> = {
  owner: "bg-amber-50  text-amber-700  border-amber-200",
  editor: "bg-indigo-50  text-indigo-700  border-indigo-200",
  viewer: "bg-muted  text-muted-foreground  border-border",
};

interface AlignmentHandlers {
  alignLeft: (ids: string[]) => void;
  alignCenterX: (ids: string[]) => void;
  alignRight: (ids: string[]) => void;
  alignTop: (ids: string[]) => void;
  alignCenterY: (ids: string[]) => void;
  alignBottom: (ids: string[]) => void;
  distributeHorizontally: (ids: string[]) => void;
  distributeVertically: (ids: string[]) => void;
}

interface MemberUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  role: string;
}

interface PendingRequest {
  requestId: string;
  projectId: string;
  userId: string;
  userName: string;
  userImage?: string;
  message?: string;
}

interface ApiAccessRequest {
  id: string;
  projectId: string;
  userId: string;
  message?: string;
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    imageUrl?: string;
  };
}

function toRequest(r: ApiAccessRequest): PendingRequest {
  return {
    requestId: r.id,
    projectId: r.projectId,
    userId: r.userId,
    userName:
      [r.user.firstName, r.user.lastName].filter(Boolean).join(" ") ||
      r.user.email,
    userImage: r.user.imageUrl,
    message: r.message,
  };
}

interface TopToolbarProps {
  tool: "select" | "pan";
  setTool: (tool: "select" | "pan") => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saveIndicator: "Live" | "Reconnecting" | "Connecting...";
  role: Role;
  onSave: () => void;
  onBack: () => void;
  selectedIds: string[];
  canEdit: boolean;
  alignment: AlignmentHandlers;
  projectId?: string;
  projectName?: string;
  others?: Array<{
    connectionId: number;
    presence: {
      userName: string;
      userAvatar: string;
      userColor: string;
      page: string;
      lastActive: number;
      isIdle: boolean;
      selectedId: string | null;
      selectedName: string | null;
    };
  }>;
  currentUser?: {
    name: string;
    avatar: string;
    color: string;
  };
  members?: MemberUser[];
  onRoleChange?: (userId: string, role: string) => void;
  onRemoveMember?: (userId: string) => void;
  currentUserId?: string;
  onLeaveProject?: () => void;
}

export default function TopToolbar({
  tool,
  setTool,
  undo,
  redo,
  canUndo,
  canRedo,
  saveIndicator,
  role,
  onSave,
  onBack,
  selectedIds,
  canEdit,
  alignment,
  projectId,
  projectName,
  others,
  currentUser,
  members,
  onRoleChange,
  onRemoveMember,
  currentUserId: _currentUserId,
  onLeaveProject,
}: TopToolbarProps) {
  const isLive = saveIndicator === "Live";

  const saveLabel =
    saveIndicator === "Live"
      ? "All changes saved"
      : saveIndicator === "Reconnecting"
        ? "Reconnecting..."
        : "Connecting...";

  const [membersOpen, setMembersOpen] = useState(false);
  const membersRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const api = useApi();
  const [accessRequests, setAccessRequests] = useState<PendingRequest[]>([]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (membersRef.current && !membersRef.current.contains(e.target as Node)) {
        setMembersOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (role !== "owner" || !projectId) return;
    api
      .get(`access-requests/project/${projectId}/pending`)
      .then((data: ApiAccessRequest[]) => setAccessRequests(data.map(toRequest)))
      .catch(() => {});
  }, [projectId, role]);

  useEffect(() => {
    if (!socket || role !== "owner") return;
    function onRequest(req: PendingRequest) {
      if (req.projectId !== projectId) return;
      setAccessRequests((prev) => {
        if (prev.some((r) => r.requestId === req.requestId)) return prev;
        return [req, ...prev];
      });
    }
    socket.on("access-request", onRequest);
    return () => {
      socket.off("access-request", onRequest);
    };
  }, [socket, projectId, role]);

  const respondToRequest = useCallback(async (requestId: string, approved: boolean) => {
    const target = accessRequests.find((r) => r.requestId === requestId);
    setAccessRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    try {
      await api.patch(`access-requests/${requestId}/respond`, { approved });
      toast.success(
        approved
          ? `Approved access for ${target?.userName ?? "user"}`
          : `Denied access for ${target?.userName ?? "user"}`
      );
    } catch {
      toast.error("Failed to update access request");
      if (target) setAccessRequests((prev) => [target, ...prev]);
    }
  }, [accessRequests]);

  return (
    <div className="absolute top-0 left-0 right-0 bg-card/85 dark:bg-card/85 backdrop-blur-xl border-b border-border shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] px-3 z-20 flex items-center justify-between h-14">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Back"
        >
          <ArrowLeft size={16} />
        </button>

        <h1 className="text-sm font-semibold text-foreground max-w-[200px] truncate">{projectName || "Untitled"}</h1>

        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-md border capitalize ${ROLE_STYLES[role]}`}
        >
          {role}
        </span>

        <div className="w-px h-5 bg-border mx-1" />

        <div className="flex items-center gap-1 p-1 bg-muted rounded-xl">
          <button
            onClick={() => setTool("select")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              tool === "select"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <MousePointer size={15} />
            <span className="text-sm font-medium">Select</span>
          </button>
          <button
            onClick={() => setTool("pan")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              tool === "pan"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Move size={15} />
            <span className="text-sm font-medium">Pan</span>
          </button>
        </div>

        {selectedIds.length > 0 && canEdit && (
          <>
            <div className="w-px h-5 bg-border mx-1" />
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => alignment.alignLeft(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Align left"
              >
                <AlignStartVertical size={14} />
              </button>
              <button
                onClick={() => alignment.alignCenterX(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Align center horizontally"
              >
                <AlignCenterVertical size={14} />
              </button>
              <button
                onClick={() => alignment.alignRight(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Align right"
              >
                <AlignEndVertical size={14} />
              </button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <button
                onClick={() => alignment.alignTop(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Align top"
              >
                <AlignStartHorizontal size={14} />
              </button>
              <button
                onClick={() => alignment.alignCenterY(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Align center vertically"
              >
                <AlignCenterHorizontal size={14} />
              </button>
              <button
                onClick={() => alignment.alignBottom(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Align bottom"
              >
                <AlignEndHorizontal size={14} />
              </button>
              <div className="w-px h-4 bg-border mx-0.5" />
              <button
                onClick={() => alignment.distributeHorizontally(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Distribute horizontally"
              >
                <Columns3 size={14} />
              </button>
              <button
                onClick={() => alignment.distributeVertically(selectedIds)}
                className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                title="Distribute vertically"
              >
                <Rows3 size={14} />
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <RotateCcw size={15} className="scale-x-[-1]" />
          </button>
        </div>

        {/* Members dropdown */}
        {members && members.length > 0 && (
          <>
            <div className="w-px h-5 bg-border" />
            <div className="relative" ref={membersRef}>
              <button
                onClick={() => setMembersOpen(!membersOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors relative ${
                  membersOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Users size={14} />
                Members
                {role === "owner" && accessRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {accessRequests.length}
                  </span>
                )}
                <ChevronDown size={12} />
              </button>
              {membersOpen && (
                <div className="absolute top-full mt-1 right-0 w-80 bg-popover border border-border rounded-2xl shadow-xl overflow-hidden z-30">
                  <div className="max-h-96 overflow-y-auto py-1">
                    {/* Pending access requests (owner only) */}
                    {role === "owner" && accessRequests.length > 0 && (
                      <>
                        <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pending requests</div>
                        {accessRequests.map((req) => (
                          <div key={req.requestId} className="flex items-start gap-3 px-3 py-2.5">
                            <div className="w-7 h-7 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 mt-0.5">
                              {req.userImage ? (
                                <img src={req.userImage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[9px] font-semibold text-muted-foreground">{req.userName[0]?.toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium text-foreground truncate">{req.userName}</div>
                              <div className="text-[10px] text-muted-foreground">{req.message ? `"${req.message}"` : "wants to join"}</div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => respondToRequest(req.requestId, false)}
                                className="px-2 py-1 text-[10px] text-muted-foreground border border-border rounded-md hover:bg-muted transition-colors"
                              >
                                Deny
                              </button>
                              <button
                                onClick={() => respondToRequest(req.requestId, true)}
                                className="px-2 py-1 text-[10px] font-medium text-white bg-primary rounded-md hover:opacity-90 transition-opacity"
                              >
                                Approve
                              </button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-border my-1" />
                      </>
                    )}

                    {/* Members list */}
                    {role === "owner" && accessRequests.length > 0 && (
                      <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Members</div>
                    )}
                    {members.map((m, idx) => {
                      const initials = [m.firstName, m.lastName].filter(Boolean).map((s) => (s as string)[0]).join("").toUpperCase().slice(0, 2);
                      const name = [m.firstName, m.lastName].filter(Boolean).join(" ") || m.email;
                      const isOwner = m.role === "owner";
                      return (
                        <div key={`${m.id}-${idx}`} className="flex items-center gap-3 px-3 py-2.5">
                          <div className="w-7 h-7 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                            {m.imageUrl ? (
                              <img src={m.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[9px] font-semibold text-muted-foreground">{initials}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-foreground truncate">{name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{m.email}</div>
                          </div>
                          {isOwner ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-50 text-amber-700 capitalize shrink-0">Owner</span>
                          ) : role === "owner" ? (
                            <>
                              <select
                                value={m.role}
                                onChange={(e) => onRoleChange?.(m.id, e.target.value)}
                                className="text-[10px] px-1.5 py-0.5 rounded border border-border bg-background text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 capitalize shrink-0"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                              </select>
                              <button
                                onClick={() => onRemoveMember?.(m.id)}
                                className="p-1 rounded text-muted-foreground/40 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                                title="Remove member"
                              >
                                <X size={12} />
                              </button>
                            </>
                          ) : null}
                        </div>
                      );
                    })}

                    {/* Leave project (non-owner) */}
                    {role !== "owner" && onLeaveProject && (
                      <>
                        <div className="border-t border-border my-1" />
                        <button
                          onClick={onLeaveProject}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <LogOut size={13} />
                          Leave project
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="w-px h-5 bg-border" />

        <ThemeToggle />

        <div className="w-px h-5 bg-border" />

        <NotificationBell projectId={projectId} />

        <div className="w-px h-5 bg-border" />

        <CollaboratorAvatars others={others ?? []} currentUser={currentUser} />

        <div className="w-px h-5 bg-border" />

        <button
          onClick={onSave}
          disabled={!isLive}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            isLive
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-muted text-muted-foreground"
          }`}
          title={saveLabel}
        >
          {isLive ? (
            <Save size={15} />
          ) : (
            <Loader2 size={15} className="animate-spin" />
          )}
          <span className="text-sm font-medium">{saveLabel}</span>
        </button>
      </div>
    </div>
  );
}


