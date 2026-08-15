

import { useEffect, useState, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

interface PendingRequest {
  requestId: string;
  projectId: string;
  userId: string;
  userName: string;
  userImage?: string;
  message?: string;
}

interface ApiRequest {
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

function toRequest(r: ApiRequest): PendingRequest {
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

export function AccessRequestBanner({ projectId }: { projectId: string }) {
  const socket = useSocket();
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const api = useApi();


  useEffect(() => {
    api
      .get(`access-requests/project/${projectId}/pending`)
      .then((data: ApiRequest[]) => setRequests(data.map(toRequest)))
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load access requests");
      });
  }, [projectId]);


  useEffect(() => {
    if (!socket) return;

    function onRequest(req: PendingRequest) {
      if (req.projectId !== projectId) return;
      setRequests((prev) => {
        if (prev.some((r) => r.requestId === req.requestId)) return prev;
        return [req, ...prev];
      });
    }

    socket.on("access-request", onRequest);
    return () => {
      socket.off("access-request", onRequest);
    };
  }, [socket, projectId]);


  const respond = useCallback(async (requestId: string, approved: boolean) => {
    const targetRequest = requests.find((r) => r.requestId === requestId);
    setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
    try {
      await api.patch(`access-requests/${requestId}/respond`, {
        approved,
      });
      toast.success(
        approved
          ? `Approved access for ${targetRequest?.userName ?? "user"}`
          : `Denied access for ${targetRequest?.userName ?? "user"}`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update access request");
      if (targetRequest) {
        setRequests((prev) => [targetRequest, ...prev]);
      }
    }
  }, [requests]);

  if (requests.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        right: 16,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: 320,
      }}
    >
      {requests.map((req) => (
        <div
          key={req.requestId}
          className="bg-card border border-border rounded-xl shadow-md px-4 py-3 flex flex-col gap-3"
        >
          <div className="flex items-center gap-3">
            {req.userImage ? (
              <img
                src={req.userImage}
                alt={req.userName}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-medium text-muted-foreground">
                {req.userName[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {req.userName}
              </p>
              <p className="text-xs text-muted-foreground">wants to join</p>
            </div>
          </div>

          {req.message && (
            <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2 italic line-clamp-2">
              "{req.message}"
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => respond(req.requestId, false)}
              className="flex-1 py-1.5 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Deny
            </button>
            <button
              onClick={() => respond(req.requestId, true)}
              className="flex-1 py-1.5 text-xs font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
