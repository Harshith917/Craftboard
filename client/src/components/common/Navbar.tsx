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
  Inbox,
  MailPlus,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/components/common/Logo";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useState, useEffect } from "react";
import { UniversalSearch } from "@/components/search/UniversalSearch";
import { useNotificationContext } from "@/components/notifications/notification-context";
import { useAccess } from "@/hooks/useAccess";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Projects", href: "/project", icon: FolderOpen },
    ],
  },
  {
    label: "Team",
    items: [
      { label: "Access Center", href: "/access", icon: Users },
      { label: "Requests", href: "/requests", icon: Inbox },
      { label: "Invitations", href: "/invitations", icon: MailPlus },
    ],
  },
  {
    label: "General",
    items: [
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).map((s) => (s as string)[0]).join("").toUpperCase().slice(0, 2);
}

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
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
        className={cn(
          "relative flex flex-col h-screen bg-card border-r border-border/80 transition-all duration-300 shrink-0",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center gap-2.5 h-16 px-4", collapsed && "justify-center px-2")}>
          <Link to="/dashboard" className={cn("flex items-center gap-2.5 min-w-0", collapsed && "justify-center")} aria-label="Craftboard home">
            <span className="shrink-0">
              <Logo size={34} />
            </span>
            {!collapsed && (
              <span className="min-w-0 leading-tight">
                <span className="block text-[15px] font-semibold text-foreground truncate">
                  Craft<span className="text-indigo-500">board</span>
                </span>
                <span className="block text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                  Design Studio
                </span>
              </span>
            )}
          </Link>
          {!collapsed && (
            <>
              <button
                onClick={onToggle}
                className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Collapse sidebar"
              >
                <ChevronLeft size={16} />
              </button>
              <ThemeToggle />
            </>
          )}
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              "flex items-center gap-2.5 w-full px-3 h-9 rounded-lg border border-border bg-muted/40 text-sm text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? "Search (Ctrl+K)" : undefined}
          >
            <Search size={16} className="shrink-0" />
            {!collapsed && <span className="flex-1 text-left">Search</span>}
            {!collapsed && (
              <kbd className="text-[10px] text-muted-foreground/70 bg-background border border-border px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Command size={10} />
                K
              </kbd>
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              {!collapsed && (
                <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map(({ label, href, icon: Icon }) => {
                  const isActive =
                    pathname === href || (href !== "/" && pathname.startsWith(href));
                  const badge =
                    href === "/notifications" ? unreadCount : href === "/access" ? badgeCount : 0;
                  return (
                    <Link
                      key={href}
                      to={href}
                      title={collapsed ? label : undefined}
                      className={cn(
                        "relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all",
                        isActive
                          ? "bg-indigo-500/10 text-indigo-600 font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        collapsed && "justify-center px-0",
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-full bg-indigo-500" />
                      )}
                      <Icon size={17} className="shrink-0" />
                      {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
                      {badge > 0 && (
                        <span className="text-[10px] font-semibold bg-indigo-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-border/80 pt-3">
          {collapsed && (
            <div className="flex justify-center mb-1.5">
              <ThemeToggle />
            </div>
          )}
          <Link
            to="/profile"
            className={cn(
              "flex items-center gap-2.5 rounded-xl bg-muted/50 border border-border p-2 transition-colors hover:bg-muted",
              collapsed && "justify-center px-1",
            )}
            title={collapsed ? name : undefined}
          >
            <div className="w-8 h-8 rounded-full ring-2 ring-indigo-400/40 overflow-hidden flex items-center justify-center shrink-0 bg-indigo-500/10">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-indigo-600">{initials}</span>
              )}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate">{name}</p>
                <p className="text-[10px] text-muted-foreground truncate">View profile</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => signOut()}
            className={cn(
              "flex items-center gap-2.5 w-full mt-1.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "justify-center px-0",
            )}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        {/* Collapse toggle when collapsed */}
        {collapsed && (
          <button
            onClick={onToggle}
            className="absolute -right-3 top-16 w-6 h-6 bg-card border border-indigo-200 rounded-full flex items-center justify-center shadow-md hover:bg-indigo-50 transition-colors z-10"
            title="Expand sidebar"
          >
            <ChevronRight size={12} className="text-indigo-500" />
          </button>
        )}
      </aside>

      <UniversalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

export default Sidebar;
