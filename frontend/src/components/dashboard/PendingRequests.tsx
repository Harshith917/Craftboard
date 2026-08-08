"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Check, X, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import type { DashboardPendingRequest } from "@/hooks/useDashboard";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function userName(u: { firstName: string | null; lastName: string | null; email: string }) {
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
}

interface PendingRequestsProps {
  requests: DashboardPendingRequest[];
  onRespond?: () => void;
}

export function PendingRequests({ requests, onRespond }: PendingRequestsProps) {
  const apiRef = useRef(useApi());
  const [local, setLocal] = useState(requests);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLocal(requests);
  }, [requests]);

  const handleApprove = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      await apiRef.current.patch(`access-requests/${id}/respond`, { approved: true });
      setLocal((prev) => prev.filter((r) => r.id !== id));
      toast.success("Request approved");
      onRespond?.();
    } catch {
      toast.error("Failed to approve");
    } finally {
      setActionLoading(null);
    }
  }, [onRespond]);

  const handleDeny = useCallback(async (id: string) => {
    setActionLoading(id);
    try {
      await apiRef.current.patch(`access-requests/${id}/respond`, { approved: false });
      setLocal((prev) => prev.filter((r) => r.id !== id));
      toast.success("Request denied");
      onRespond?.();
    } catch {
      toast.error("Failed to deny");
    } finally {
      setActionLoading(null);
    }
  }, [onRespond]);

  if (local.length === 0) {
    return (
      <div className="rounded-2xl surface p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Users size={13} className="" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Pending Requests</h2>
        </div>
        <div className="py-6 text-center">
          <p className="text-xs text-muted-foreground">No pending requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Users size={13} className="" />
          </div>
          <h2 className="text-sm font-semibold text-foreground">Pending Requests</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          {local.length}
        </span>
      </div>

      <div className="space-y-2">
        {local.map((req, i) => {
          const loading = actionLoading === req.id;
          return (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {userName(req.user)}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {req.project.name} · {timeAgo(req.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={loading}
                  className="p-1.5 rounded-md bg-[linear-gradient(135deg,#6d5bf5,#a855f7)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_6px_14px_-6px_rgba(139,92,246,0.6)]"
                >
                  {loading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                </button>
                <button
                  onClick={() => handleDeny(req.id)}
                  disabled={loading}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <X size={12} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
