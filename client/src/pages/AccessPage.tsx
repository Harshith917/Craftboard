import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, RefreshCw, Inbox } from "lucide-react";
import { useAccess, AccessItem } from "@/hooks/useAccess";
import { useDebounce } from "@/hooks/useDebounce";
import AccessCard from "@/components/access/AccessCard";
import { toast } from "sonner";

const TABS = [
  { value: "incoming", label: "Incoming" },
  { value: "outgoing", label: "Outgoing" },
  { value: "history", label: "History" },
];

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
  { value: "expired", label: "Expired" },
];

interface AccessViewProps {
  title: string;
  subtitle: string;
  typeFilter?: "access_request" | "invitation";
}

export default function AccessPage({ title, subtitle, typeFilter }: AccessViewProps) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"incoming" | "outgoing" | "history">("incoming");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const initialLoadRef = useRef(false);

  const activeTab = typeFilter ? undefined : tab;

  const {
    incoming,
    outgoing,
    history,
    badgeCount,
    loading,
    refresh,
    acceptInvitation,
    declineInvitation,
    cancelInvitation,
    resendInvitation,
    approveRequest,
    rejectRequest,
  } = useAccess(activeTab);

  useEffect(() => {
    if (!typeFilter || initialLoadRef.current) return;
    initialLoadRef.current = true;
    refresh();
  }, [typeFilter, refresh]);

  const handleAccept = async (item: AccessItem) => {
    if (item.token) {
      try {
        await acceptInvitation(item.token);
        toast.success("Invitation accepted!");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to accept");
      }
    }
  };

  const handleDecline = async (item: AccessItem) => {
    if (item.token) {
      try {
        await declineInvitation(item.token);
        toast.success("Invitation declined");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to decline");
      }
    }
  };

  const handleCancel = async (item: AccessItem) => {
    try {
      await cancelInvitation(item.id);
      toast.success(item.type === "invitation" ? "Invitation cancelled" : "Request cancelled");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to cancel");
    }
  };

  const handleResend = async (item: AccessItem) => {
    try {
      await resendInvitation(item.id);
      toast.success("Invitation resent");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to resend");
    }
  };

  const handleApprove = async (item: AccessItem) => {
    try {
      await approveRequest(item.id);
      toast.success("Access approved");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (item: AccessItem) => {
    try {
      await rejectRequest(item.id);
      toast.success("Access denied");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to deny");
    }
  };

  const getItems = () => {
    type TabSource = "incoming" | "outgoing" | "history";
    let sources: { item: AccessItem; source: TabSource }[] = [];

    const lists: { list: AccessItem[]; source: TabSource }[] = typeFilter
      ? [
          { list: incoming, source: "incoming" },
          { list: outgoing, source: "outgoing" },
          { list: history, source: "history" },
        ]
      : [
          {
            list:
              tab === "incoming"
                ? incoming
                : tab === "outgoing"
                  ? outgoing
                  : history,
            source: tab,
          },
        ];

    for (const { list, source } of lists) {
      for (const item of list) sources.push({ item, source });
    }

    if (typeFilter) {
      sources = sources.filter(({ item }) => item.type === typeFilter);
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      sources = sources.filter(
        ({ item }) =>
          item.projectName?.toLowerCase().includes(q) ||
          item.senderName?.toLowerCase().includes(q) ||
          item.receiverName?.toLowerCase().includes(q) ||
          item.role?.toLowerCase().includes(q),
      );
    }

    if (statusFilter) {
      sources = sources.filter(({ item }) => item.status === statusFilter);
    }

    return sources;
  };

  const displayed = getItems();
  const onlyType = (list: AccessItem[]) =>
    typeFilter ? list.filter((i) => i.type === typeFilter) : list;
  const counts = {
    incoming: onlyType(incoming).filter((i) => i.status === "pending").length,
    outgoing: onlyType(outgoing).filter((i) => i.status === "pending").length,
    history: onlyType(history).length,
  };

  const emptyTitle =
    (typeFilter === "access_request" && "No requests found") ||
    (typeFilter === "invitation" && "No invitations found") ||
    (tab === "incoming" && "Nothing to review") ||
    (tab === "outgoing" && "Nothing sent") ||
    "No history yet";

  const emptyMessage =
    (typeFilter === "access_request" && "Access requests from your team will appear here.") ||
    (typeFilter === "invitation" && "Invitations to your projects will appear here.") ||
    (tab === "incoming" && "Invitations and access requests will appear here.") ||
    (tab === "outgoing" && "Invite someone to a project or request access to see it here.") ||
    "Completed invitations and requests will appear here.";

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary mb-1.5">Collaboration</p>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted hover:text-primary transition-colors"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Pending incoming", count: counts.incoming },
          { label: "Pending outgoing", count: counts.outgoing },
          { label: "History entries", count: counts.history },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-full bg-card">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                s.count > 0 && s.label !== "History entries" ? "bg-primary" : "bg-border"
              }`}
            />
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-xs font-semibold text-foreground">{s.count}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      {!typeFilter && (
        <div className="flex items-center gap-5 mb-6 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value as "incoming" | "outgoing" | "history")}
              className={`py-2.5 text-sm transition-colors border-b-2 flex items-center gap-1.5 ${
                tab === t.value
                  ? "text-foreground font-semibold border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {t.label}
              {t.value === "incoming" && badgeCount > 0 && (
                <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">
                  {badgeCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={typeFilter || tab === "history" ? "Search by project, user, or role..." : "Filter by project or user..."}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 bg-card"
          />
        </div>
        {(typeFilter || tab === "history") && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-card"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl animate-pulse">
              <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-muted rounded w-1/3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
            <Inbox size={28} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayed.map(({ item, source }) => (
            <AccessCard
              key={`${item.type}-${item.id}`}
              item={item}
              actions={source}
              onAccept={handleAccept}
              onDecline={handleDecline}
              onCancel={handleCancel}
              onResend={handleResend}
              onApprove={handleApprove}
              onReject={handleReject}
              onProjectClick={(pid) => navigate(`/project/${pid}/pages`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
