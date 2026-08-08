
import { useUser, useClerk } from "@clerk/clerk-react";
import {
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Bell,
  LayoutDashboard,
  Search,
  Command,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { UniversalSearch } from "@/components/search/UniversalSearch";
import { useNotificationContext } from "@/components/notifications/notification-context";
import { useAccess } from "@/hooks/useAccess";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/project", icon: FolderOpen },
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Access Center", href: "/access", icon: Users },
];

const BOTTOM_ITEMS = [
  { label: "Settings", href: "/settings", icon: Settings },
];

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).map((s) => (s as string)[0]).join("").toUpperCase().slice(0, 2);
}

function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const { unreadCount } = useNotificationContext();
  const { badgeCount } = useAccess();
  const { user } = useUser();
  const { signOut } = useClerk();

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const initials = getInitials(user?.firstName, user?.lastName);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <aside
        className={`relative flex flex-col h-screen bg-[linear-gradient(180deg,#191332_0%,#141028_55%,#100c20_100%)] border-r border-white/10 transition-all duration-300 shrink-0 ${
          collapsed ? "w-15" : "w-60"
        }`}
      >
        {/* Brand */}
        <Link
          to="/dashboard"
          className={`flex items-center h-16 px-4 border-b border-white/10 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-[linear-gradient(135deg,#6d5bf5,#a855f7,#ec4899)] flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(139,92,246,0.7)] shrink-0">
            <LayoutDashboard size={16} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[15px] font-semibold text-white leading-tight">
                Canvazz<span className="text-violet-300">Flow</span>
              </p>
              <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
                Design Studio
              </p>
            </div>
          )}
        </Link>

        <nav className="flex-1 py-4 px-2.5 flex flex-col gap-1 overflow-y-auto">
          <button
            onClick={() => setSearchOpen(true)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-white/45 hover:bg-white/10 hover:text-white ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Search (Ctrl+K)" : undefined}
          >
            <Search size={18} className="shrink-0" />
            {!collapsed && (
              <span className="flex-1 text-left">Search</span>
            )}
            {!collapsed && (
              <kbd className="text-[10px] text-white/35 bg-white/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Command size={10} />
                K
              </kbd>
            )}
          </button>

          <div className="h-px bg-white/10 my-2" />

          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || (href !== "/" && pathname.startsWith(href));
            const badge = href === "/notifications" ? unreadCount : href === "/access" ? badgeCount : 0;
            return (
              <Link
                key={href}
                to={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "nav-active text-white font-medium shadow-lg"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="flex-1">{label}</span>}
                {badge > 0 && (
                  <span className="text-[10px] font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom nav items */}
        <div className="py-3 px-2.5 flex flex-col gap-1 border-t border-white/10">
          {BOTTOM_ITEMS.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                to={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "nav-active text-white font-medium shadow-lg"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            );
          })}

          {/* User profile */}
          <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-2">
            <Link
              to="/profile"
              className={`flex items-center ${
                collapsed ? "justify-center" : "gap-2.5"
              }`}
              title={collapsed ? name : undefined}
            >
              <div className="w-8 h-8 rounded-full ring-2 ring-violet-400/50 overflow-hidden flex items-center justify-center shrink-0 bg-white/10">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-semibold text-violet-200">{initials}</span>
                )}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-white truncate">{name}</p>
                  <p className="text-[10px] text-white/40 truncate">View profile</p>
                </div>
              )}
            </Link>
          </div>

          <button
            onClick={() => signOut()}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-white/55 hover:bg-rose-500/15 hover:text-rose-300 ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-violet-200 rounded-full flex items-center justify-center shadow-md hover:bg-violet-50 transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight size={12} className="text-violet-500" />
          ) : (
            <ChevronLeft size={12} className="text-violet-500" />
          )}
        </button>
      </aside>

      <UniversalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Sidebar;
