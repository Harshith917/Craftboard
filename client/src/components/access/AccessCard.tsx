
import { Clock, Mail, FolderOpen, CheckCircle, Ban, XCircle, RefreshCw, Link2, Check } from "lucide-react";
import { AccessItem } from "@/hooks/useAccess";
import { useState } from "react";
import { toast } from "sonner";

function timeAgo(date: string): string {
  const ms = Date.now() - new Date(date).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).map((s) => (s as string)[0]).join("").toUpperCase().slice(0, 2);
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600 border-amber-200",
  accepted: "bg-green-50 text-green-600 border-green-200",
  approved: "bg-green-50 text-green-600 border-green-200",
  denied: "bg-red-50 text-red-600 border-red-200",
  declined: "bg-red-50 text-red-600 border-red-200",
  cancelled: "bg-accent text-muted-foreground border-border",
  expired: "bg-accent text-muted-foreground border-border",
};

interface AccessCardProps {
  item: AccessItem;
  actions?: "incoming" | "outgoing" | "history";
  onAccept?: (item: AccessItem) => void;
  onDecline?: (item: AccessItem) => void;
  onCancel?: (item: AccessItem) => void;
  onResend?: (item: AccessItem) => void;
  onApprove?: (item: AccessItem) => void;
  onReject?: (item: AccessItem) => void;
  onProjectClick?: (projectId: string) => void;
}

export default function AccessCard({
  item,
  actions = "history",
  onAccept,
  onDecline,
  onCancel,
  onResend,
  onApprove,
  onReject,
  onProjectClick,
}: AccessCardProps) {
  const isPending = item.status === "pending";
  const isInvitation = item.type === "invitation";
  const isIncoming = actions === "incoming";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    if (!item.token) return;
    try {
      await navigator.clipboard.writeText(`${baseUrl}/invitations/${item.token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const displayName = isInvitation
    ? (isIncoming ? item.senderName : item.receiverName)
    : (isIncoming ? item.senderName : null);

  const displayImage = isInvitation
    ? (isIncoming ? item.senderImage : item.receiverImage)
    : (isIncoming ? item.senderImage : null);

  return (
    <div className="flex items-start gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/20 hover:shadow-[0_6px_24px_-12px_rgba(0,0,0,0.2)] transition-all">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0 mt-0.5">
        {displayImage ? (
          <img src={displayImage} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">
            {displayName ? getInitials(displayName, "") : <Mail size={14} />}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${
            isInvitation ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-muted text-muted-foreground border-border"
          }`}>
            {isInvitation ? "Invitation" : "Request"}
          </span>

          {/* Title */}
          <span className="text-sm font-medium text-foreground truncate">
            {isIncoming && isInvitation && (
              <>{item.senderName || "Someone"} invited you to <strong>{item.projectName || "a project"}</strong></>
            )}
            {isIncoming && !isInvitation && (
              <>{item.senderName || "Someone"} requested access to <strong>{item.projectName || "a project"}</strong></>
            )}
            {!isIncoming && isInvitation && (
              <>Invited {item.receiverName || "someone"} to <strong>{item.projectName || "a project"}</strong></>
            )}
            {!isIncoming && !isInvitation && (
              <>Requested access to <strong>{item.projectName || "a project"}</strong></>
            )}
          </span>

          {/* Status badge */}
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize border ${STATUS_BADGE[item.status] || "bg-muted text-muted-foreground border-border"}`}>
            {item.status}
          </span>
        </div>

        {/* Message */}
        {item.message && (
          <p className="text-xs text-muted-foreground mt-1 italic">&ldquo;{item.message}&rdquo;</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
          <span className="flex items-center gap-1">
            <FolderOpen size={11} />
            Role: {item.role}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {timeAgo(item.createdAt)}
          </span>
          {item.expiresAt && isPending && (
            <span className="text-[10px] text-amber-500">
              Expires {new Date(item.expiresAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex items-center gap-1 shrink-0">
          {isIncoming && isInvitation && (
            <>
              <button
                onClick={() => onAccept?.(item)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                <CheckCircle size={13} />
                Accept
              </button>
              <button
                onClick={() => onDecline?.(item)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                <Ban size={13} />
                Decline
              </button>
            </>
          )}

          {isIncoming && !isInvitation && (
            <>
              <button
                onClick={() => onApprove?.(item)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
              >
                <CheckCircle size={13} />
                Approve
              </button>
              <button
                onClick={() => onReject?.(item)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
              >
                <Ban size={13} />
                Reject
              </button>
            </>
          )}

          {!isIncoming && isInvitation && (
            <>
              {item.token && (
                <button
                  onClick={copyLink}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check size={14} className="text-emerald-500" /> : <Link2 size={14} />}
                </button>
              )}
              <button
                onClick={() => onResend?.(item)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                title="Resend"
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => onCancel?.(item)}
                className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                title="Cancel"
              >
                <XCircle size={14} />
              </button>
            </>
          )}

          {!isIncoming && !isInvitation && (
            <button
              onClick={() => onCancel?.(item)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
            >
              <XCircle size={13} />
              Cancel
            </button>
          )}
        </div>
      )}

      {/* Project link */}
      {item.projectId && (
        <button
          onClick={() => onProjectClick?.(item.projectId)}
          className="shrink-0 p-1.5 text-muted-foreground/40 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
          title="View project"
        >
          <FolderOpen size={14} />
        </button>
      )}
    </div>
  );
}
