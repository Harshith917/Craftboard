
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "@/components/notifications/notification-context";
import { timeAgo } from "@/lib/notificationUtils";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount, recentNotifications, markAsRead, markAllAsRead } =
    useNotificationContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        title="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-semibold text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              recentNotifications.slice(0, 10).map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-0 ${
                    !n.read ? "bg-indigo-50/30" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        !n.read ? "bg-indigo-500" : "bg-transparent"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {n.title}
                    </p>
                    {n.message && (
                      <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <button
            onClick={() => {
              setOpen(false);
              navigate("/notifications");
            }}
            className="w-full px-4 py-2.5 text-center text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-accent border-t border-border transition-colors"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
