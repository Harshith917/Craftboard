
import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  FolderOpen,
  User,
  Clock,
  Loader2,
  X,
  Trash2,
  Globe,
  Lock,
  Users,
  Hash,
} from "lucide-react";
import { EmptyState } from "@/components/custom/EmptyState";
import {
  useUniversalSearch,
  highlightParts,
  type SearchProject,
  type SearchUser,
  type SearchResults,
} from "@/hooks/useUniversalSearch";

function Highlighted({ text, query }: { text: string; query: string }) {
  const parts = highlightParts(text, query);
  if (!parts) return <>{text}</>;
  return (
    <>
      {parts.before}
      <mark className="bg-yellow-200/70 text-foreground rounded-sm px-0.5">{parts.match}</mark>
      {parts.after}
    </>
  );
}

function useKeyboard(
  listLength: number,
  onSelect: (idx: number) => void,
  onClose: () => void,
) {
  const [cursor, setCursor] = useState(-1);
  const reset = useCallback(() => setCursor(-1), []);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((prev) => (prev < listLength - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((prev) => (prev > 0 ? prev - 1 : listLength - 1));
      } else if (e.key === "Enter" && cursor >= 0) {
        e.preventDefault();
        onSelect(cursor);
      } else if (e.key === "Escape") {
        onClose();
      }
    },
    [listLength, cursor, onSelect, onClose],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return { cursor, reset };
}

function flattenResults(results: SearchResults) {
  const items: Array<{
    type: "project" | "user";
    label: string;
    sublabel: string;
    href: string;
    data: SearchProject | SearchUser;
  }> = [];

  if (results.projects.length > 0) {
    for (const p of results.projects) {
      items.push({
        type: "project",
        label: p.name,
        sublabel: p.description || "",
        href: `/project/${p.id}/pages`,
        data: p,
      });
    }
  }

  if (results.users.length > 0) {
    for (const u of results.users) {
      const name = [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email;
      items.push({
        type: "user",
        label: name,
        sublabel: u.email,
        href: `/profile/${u.id}`,
        data: u,
      });
    }
  }

  return items;
}

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName]
    .filter(Boolean)
    .map((s) => (s as string)[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getGradient(name: string): string {
  const colors = [
    "from-indigo-400 to-indigo-500",
    "from-violet-400 to-purple-500",
    "from-cyan-400 to-cyan-500",
    "from-emerald-400 to-teal-500",
    "from-indigo-500 to-violet-500",
    "from-rose-400 to-orange-500",
    "from-blue-400 to-indigo-500",
    "from-slate-500 to-slate-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const CATEGORY_LABELS: Record<string, string> = {
  project: "Projects",
  user: "Users",
};

const CATEGORY_ICONS: Record<string, ReactNode> = {
  project: <FolderOpen size={14} />,
  user: <User size={14} />,
};

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

function ProjectResult({
  project,
  query,
  active,
  onSelect,
  idx,
}: {
  project: SearchProject;
  query: string;
  active: boolean;
  onSelect: (idx: number) => void;
  idx: number;
}) {
  const ownerName = [project.owner.firstName, project.owner.lastName].filter(Boolean).join(" ") || "Unknown";
  return (
    <button
      onClick={() => onSelect(idx)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        active ? "bg-accent" : "hover:bg-muted"
      }`}
    >
      {/* Project thumbnail */}
      <div
        className={`w-9 h-9 rounded-lg shrink-0 bg-gradient-to-br ${getGradient(project.name)} flex items-center justify-center text-white text-xs font-bold`}
      >
        {project.name[0].toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate">
          <Highlighted text={project.name} query={query} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded-full bg-accent inline-flex items-center justify-center overflow-hidden shrink-0">
              {project.owner.imageUrl ? (
                <img src={project.owner.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[8px] font-medium text-muted-foreground">{getInitials(project.owner.firstName, project.owner.lastName)}</span>
              )}
            </span>
            {ownerName}
          </span>
          <span className="text-[11px] text-muted-foreground/70">·</span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Users size={10} />
            {project.memberCount}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="flex items-center gap-1.5">
          {project.myRole && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize bg-indigo-50 text-indigo-600">
              {project.myRole}
            </span>
          )}
          {project.visibility === "public" ? (
            <Globe size={11} className="text-muted-foreground/70" />
          ) : (
            <Lock size={11} className="text-muted-foreground/70" />
          )}
        </div>
        <span className="text-[10px] text-muted-foreground/70">{timeAgo(project.updatedAt)}</span>
      </div>
    </button>
  );
}

function UserResult({
  user,
  query,
  active,
  onSelect,
  idx,
}: {
  user: SearchUser;
  query: string;
  active: boolean;
  onSelect: (idx: number) => void;
  idx: number;
}) {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  const initials = getInitials(user.firstName, user.lastName);
  return (
    <button
      onClick={() => onSelect(idx)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        active ? "bg-accent" : "hover:bg-muted"
      }`}
    >
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full shrink-0 bg-accent overflow-hidden flex items-center justify-center">
        {user.imageUrl ? (
          <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground truncate">
          <Highlighted text={name} query={query} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-muted-foreground">
            <Highlighted text={user.email} query={query} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {user.mutualProjectsCount > 0 && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Hash size={10} />
            {user.mutualProjectsCount} mutual
          </span>
        )}
        {user.isCollaborator && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600">
            Collaborator
          </span>
        )}
      </div>
    </button>
  );
}

interface UniversalSearchProps {
  open: boolean;
  onClose: () => void;
  onSelectUser?: (user: SearchUser) => void;
}

export function UniversalSearch({ open, onClose, onSelectUser }: UniversalSearchProps) {
  const navigate = useNavigate();
  const { query, setQuery, results, loading, searched, recent, submitSearch, clearRecent } =
    useUniversalSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasProjects = results.projects.length > 0;
  const hasUsers = results.users.length > 0;
  const hasResults = hasProjects || hasUsers;

  const projectHeaderIdx = hasProjects ? 0 : -1;
  const userHeaderIdx = hasProjects ? results.projects.length : 0;

  const flatItems = flattenResults(results);
  const selectableIndices = flatItems.map((item, idx) => idx);

  const handleSelect = useCallback(
    (idx: number) => {
      const item = flatItems[idx];
      if (!item) return;
      submitSearch(query);
      onClose();
      if (item.href) {
        navigate(item.href);
      } else {
        onSelectUser?.(item.data as SearchUser);
      }
    },
    [flatItems, query, submitSearch, onClose, navigate, onSelectUser],
  );

  const { cursor, reset } = useKeyboard(flatItems.length, handleSelect, onClose);

  useEffect(() => {
    if (open) {
      reset();
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, reset, setQuery]);

  useEffect(() => {
    reset();
  }, [results, reset]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects and users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground"
          />
          {loading && <Loader2 size={14} className="animate-spin text-muted-foreground shrink-0" />}
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5 text-muted-foreground/70 hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex text-xs text-muted-foreground bg-accent px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Recent searches */}
        {!query.trim() && recent.length > 0 && (
          <div className="max-h-80 overflow-y-auto p-2">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                <Clock size={12} />
                Recent searches
              </span>
              <button
                onClick={clearRecent}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <Trash2 size={11} />
                Clear
              </button>
            </div>
            {recent.map((r, i) => (
              <button
                key={`${r}-${i}`}
                onClick={() => setQuery(r)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Clock size={13} className="text-muted-foreground/70 shrink-0" />
                <span className="truncate">{r}</span>
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {query.trim() && !loading && searched && !hasResults && (
          <div className="py-8">
            <EmptyState
              illustration="search"
              title={`No results for "${query.trim()}"`}
              description="Try a different search term. Search across projects and users."
            />
          </div>
        )}

        {/* Results */}
        {query.trim() && !loading && hasResults && (
          <div className="max-h-96 overflow-y-auto p-2 space-y-1">
            {/* Projects section */}
            {hasProjects && (
              <div>
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-muted-foreground/70">
                    {CATEGORY_ICONS.project}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {CATEGORY_LABELS.project}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 font-medium">
                    {results.projects.length}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {results.projects.map((project, i) => (
                    <ProjectResult
                      key={project.id}
                      project={project}
                      query={query}
                      active={cursor === projectHeaderIdx + i}
                      onSelect={handleSelect}
                      idx={projectHeaderIdx + i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Users section */}
            {hasUsers && (
              <div className={hasProjects ? "mt-2" : ""}>
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <span className="text-muted-foreground/70">
                    {CATEGORY_ICONS.user}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {CATEGORY_LABELS.user}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 font-medium">
                    {results.users.length}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {results.users.map((user, i) => (
                    <UserResult
                      key={user.id}
                      user={user}
                      query={query}
                      active={cursor === userHeaderIdx + i}
                      onSelect={handleSelect}
                      idx={userHeaderIdx + i}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Loading skeleton */}
        {query.trim() && loading && (
          <div className="p-3 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 animate-pulse">
                <div className="w-9 h-9 rounded-lg bg-accent shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-accent rounded w-2/3" />
                  <div className="h-3 bg-accent rounded w-1/3" />
                </div>
                <div className="h-3 bg-accent rounded w-16" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
