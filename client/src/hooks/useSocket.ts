
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:4001";

export function useSocket(projectId?: string) {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function connect() {
      const token = await getToken();
      if (cancelled || !token) return;

      const s = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      s.on("connect", () => {
        if (projectId) {
          s.emit("join-project", projectId);
        }
      });

      s.on("connect_error", () => {});

      setSocket(s);
    }

    connect();

    return () => {
      cancelled = true;
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
    };
  }, [getToken, projectId]);

  return socket;
}
