import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CheckCheck, Trash2, Inbox, ArrowLeft } from "lucide-react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { useDebounce } from "@/hooks/useDebounce";
import { timeAgo } from "@/lib/notificationUtils";
import { toast } from "sonner";

const TABS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "read", label: "Read" },
];

const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  project_invitation: "Invitation",
  invitation_accepted: "Invitation Accepted",
  invitation_declined: "Invitation Declined",
  access_request: "Access Request",
  access_request_approved: "Access Approved",
  access_request_denied: "Access Denied",
  role_changed: "Role Updated",
  member_removed: "Removed",
  project_renamed: "Project Renamed",
  project_updated: "Project Updated",
  project_deleted: "Project Deleted",
  ownership_transferred: "Ownership Transferred",
  ownership_received: "Ownership Received",
  ownership_changed: "Ownership Changed",
};

const TYPE_FILTERS = Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const { notifications, loading, total, pages, markAsRead, markAllAsRead, deleteNotification, refresh } =
    useNotifications({ filter: tab, search: debouncedSearch, type: typeFilter, page, limit: 20 });

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedSearch, typeFilter]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success("All notifications marked as read");
    refresh();
  };

  const handleDelete = async (n: Notification) => {
    await deleteNotification(n.id);
    toast.success("Notification deleted");
    refresh();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mb-2 transition-colors"
          >
            <ArrowLeft size={13} />
            Back
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">Activity</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1.5">{total} total</p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <CheckCheck size={13} />
          Mark all read
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-5 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`py-2.5 text-sm transition-colors border-b-2 ${
              tab === t.value
                ? "text-foreground font-semibold border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search + Type filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-card"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-card"
        >
          <option value="">All types</option>
          {TYPE_FILTERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
            <Inbox size={28} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">
            {search || typeFilter ? "No matching notifications" : "No notifications yet"}
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl divide-y divide-border overflow-hidden bg-card">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`group flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer ${
                !n.read ? "bg-primary/[0.04]" : ""
              }`}
              onClick={() => {
                if (!n.read) {
                  markAsRead(n.id);
                  refresh();
                }
              }}
            >
              <div className="shrink-0 mt-1.5">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    !n.read ? "bg-primary" : "bg-border"
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  {n.type && (
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                      {NOTIFICATION_TYPE_LABELS[n.type] || n.type}
                    </span>
                  )}
                </div>
                {n.message && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!n.read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="Mark as read"
                  >
                    <CheckCheck size={13} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(n); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-30 hover:bg-muted transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-muted-foreground px-3">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
            className="px-3 py-1.5 text-xs border border-border rounded-lg disabled:opacity-30 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
