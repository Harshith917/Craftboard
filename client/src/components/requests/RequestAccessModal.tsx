
import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

type State = "idle" | "sending" | "pending" | "approved" | "denied";

interface Props {
  projectId: string;
  projectName: string;
  currentUserId: string;
  onApproved?: () => void;
}

export function RequestAccessModal({
  projectId,
  projectName,
  currentUserId: _currentUserId,
  onApproved,
}: Props) {
  const socket = useSocket();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const api = useApi();

  useEffect(() => {
    if (!socket) return;

    function onResponse(data: { projectId: string; approved: boolean }) {
      if (data.projectId !== projectId) return;
      if (data.approved) {
        toast.success("Access approved");
        onApproved?.();
      } else {
        setState("denied");
      }
    }

    socket.on("access-request-response", onResponse);
    return () => {
      socket.off("access-request-response", onResponse);
    };
  }, [socket, projectId, onApproved]);

  const sendRequest = useCallback(async () => {
    setState("sending");

    try {
      const _res = await api.post("access-requests", {
        projectId,
        message: message.trim() || undefined,
      });
      setState("pending");
      toast.success("Access request sent successfully");
    } catch (err) {
      console.error(err);
      setState("idle");
      toast.error("Failed to send access request");
    }
  }, [projectId, message]);

  return (
    <div className="w-full max-w-sm bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      <div>
        <p className="text-sm font-medium text-foreground">
          {state === "denied"
            ? "Request denied"
            : state === "pending"
              ? "Waiting for approval"
              : `Request access to ${projectName}`}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {state === "denied"
            ? "The owner declined your request."
            : state === "pending"
              ? "The owner will be notified shortly."
              : "The owner will approve or deny your request."}
        </p>
      </div>

      {state === "idle" && (
        <>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a message (optional)"
            rows={3}
            className="w-full resize-none px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={sendRequest}
            className="w-full py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:opacity-90 transition-opacity"
          >
            Send request
          </button>
        </>
      )}

      {state === "sending" && <p className="text-xs text-muted-foreground">Sending…</p>}

      {state === "pending" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="w-3 h-3 rounded-full border-2 border-border border-t-foreground animate-spin" />
          Waiting for the owner…
        </div>
      )}

      {state === "denied" && (
        <button
          onClick={() => setState("idle")}
          className="w-full py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        >
          Send another request
        </button>
      )}
    </div>
  );
}
