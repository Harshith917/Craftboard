"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Edit3, FolderOpen, Clock, Users, FileText, Activity, ExternalLink, Shield, UserPlus, Check, Globe } from "lucide-react";
import { useProfile, Profile, ProjectCard, Activity as ActivityType } from "@/hooks/useProfile";
import { RequestAccessModal } from "@/components/requests/RequestAccessModal";
import { useAuth } from "@clerk/nextjs";

function getInitials(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).map((s) => (s as string)[0]).join("").toUpperCase().slice(0, 2);
}

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

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-primary/25 hover:shadow-[0_6px_24px_-10px_rgba(109,91,245,0.25)] transition-all">
      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
        <Icon size={18} className="text-primary" />
      </div>
      <div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function ProjectCardView({ project }: { project: ProjectCard }) {
  return (
    <Link
      href={`/project/${project.id}/pages`}
      className="bg-white border border-border rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-[0_8px_30px_-12px_rgba(109,91,245,0.25)] transition-all group cursor-pointer"
    >
      <div className="h-24 bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 flex items-center justify-center relative">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
        ) : (
          <FolderOpen size={28} className="text-indigo-300" />
        )}
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize cursor-default ${
            project.visibility === "public" ? "bg-emerald-50 text-emerald-600" : "bg-white/80 text-muted-foreground"
          }`}>
            {project.visibility}
          </span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1.5">
          <span className="flex items-center gap-1">
            <Shield size={10} />
            {project.role}
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Users size={10} />
            {project.memberCount}
          </span>
          <span>·</span>
          <span>{timeAgo(project.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}

function PublicProjectCard({
  project,
  currentUserId,
  onRequestAccess,
}: {
  project: ProjectCard & { role: string | null };
  currentUserId?: string;
  onRequestAccess: (project: ProjectCard & { role: string | null }) => void;
}) {
  const isMember = project.role !== null;
  const isOwn = project.owner?.id === currentUserId;

  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-[0_8px_30px_-12px_rgba(109,91,245,0.25)] transition-all group">
      <Link
        href={isMember ? `/project/${project.id}/pages` : "#"}
        className="block cursor-pointer"
        onClick={(e) => { if (!isMember) e.preventDefault(); }}
      >
        <div className="h-24 bg-gradient-to-br from-indigo-100 via-violet-50 to-purple-100 flex items-center justify-center relative">
          {project.thumbnail ? (
            <img src={project.thumbnail} alt="" className="w-full h-full object-cover" />
          ) : (
            <FolderOpen size={28} className="text-indigo-300" />
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {project.visibility && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 cursor-default">
                {project.visibility}
              </span>
            )}
          </div>
        </div>
        <div className="p-3">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{project.description}</p>
          )}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1.5">
            <span className="flex items-center gap-1">
              <Users size={10} />
              {project.memberCount}
            </span>
            <span>·</span>
            <span>{timeAgo(project.updatedAt)}</span>
          </div>
        </div>
      </Link>

      {!isOwn && !isMember && (
        <div className="px-3 pb-3">
          <button
            onClick={() => onRequestAccess(project)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-[linear-gradient(110deg,#6d5bf5,#a855f7)] hover:opacity-90 rounded-xl transition-opacity cursor-pointer"
          >
            <UserPlus size={12} />
            Request Access
          </button>
        </div>
      )}

      {isMember && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 rounded-xl">
            <Check size={12} />
            Member
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileHeader({ profile, isOwnProfile }: { profile: Profile; isOwnProfile: boolean }) {
  const name = profile.displayName || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "User";
  const initials = getInitials(profile.firstName, profile.lastName);
  const joinedDate = new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)]">
      <div className="flex items-start gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border border-border">
            {profile.imageUrl ? (
              <img src={profile.imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xl font-bold text-muted-foreground">{initials}</span>
              </div>
            )}
          </div>
          {profile.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground tracking-tight truncate">{name}</h1>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  Joined {joinedDate}
                </span>
                {profile.isOnline && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </span>
                  </>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <Link
                href="/settings"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-white border border-border rounded-xl hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
              >
                <Edit3 size={12} />
                Edit profile
              </Link>
            )}
          </div>

          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-lg">{profile.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsSection({ profile }: { profile: Profile }) {
  const { stats } = profile;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard icon={FolderOpen} label="Projects Owned" value={stats.projectsOwned} />
      <StatCard icon={Users} label="Projects Joined" value={stats.projectsJoined} />
      <StatCard icon={FileText} label="Pages Created" value={stats.pagesCreated} />
      <StatCard icon={Activity} label="Collaborations" value={stats.totalCollaborations} />
    </div>
  );
}

function ProjectsSection({
  owned,
  shared,
  loading,
}: {
  owned: ProjectCard[];
  shared: ProjectCard[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Owned Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-border rounded-2xl overflow-hidden animate-pulse">
                <div className="h-24 bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {owned.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <FolderOpen size={14} className="text-primary" />
            Owned Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {owned.map((p) => (
              <ProjectCardView key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {shared.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Users size={14} className="text-primary" />
            Shared Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {shared.map((p) => (
              <ProjectCardView key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}

      {owned.length === 0 && shared.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
            <FolderOpen size={26} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1">Projects you own or collaborate on will appear here.</p>
        </div>
      )}
    </div>
  );
}

function ActivitySection({ activity }: { activity: ActivityType | null }) {
  if (!activity) return null;
  const hasActivity = activity.recentlyJoined.length > 0 || activity.recentlyEdited.length > 0;

  if (!hasActivity) return null;

  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Activity size={14} className="text-primary" />
        Activity
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {activity.recentlyJoined.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Recently Joined</h3>
            <div className="space-y-2">
              {activity.recentlyJoined.map((j) => (
                <Link
                  key={j.projectId}
                  href={`/project/${j.projectId}/pages`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                    <FolderOpen size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {j.projectName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{timeAgo(j.joinedAt)}</p>
                  </div>
                  <ExternalLink size={12} className="text-muted-foreground/40 group-hover:text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {activity.recentlyEdited.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Recently Edited</h3>
            <div className="space-y-2">
              {activity.recentlyEdited.map((v) => (
                <Link
                  key={v.pageId}
                  href={`/editor/${v.projectId}/page/${v.pageId}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors group cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                    <FileText size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {v.pageName}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{v.projectName} · {timeAgo(v.visitedAt)}</p>
                  </div>
                  <ExternalLink size={12} className="text-muted-foreground/40 group-hover:text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white border border-border rounded-2xl p-6 flex items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-muted rounded w-1/3" />
          <div className="h-3.5 bg-muted rounded w-1/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-border rounded-2xl p-4 space-y-2">
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProfileViewProps {
  userId?: string;
}

export function ProfileView({ userId }: ProfileViewProps) {
  const { userId: currentUserId } = useAuth();
  const {
    profile,
    ownedProjects,
    sharedProjects,
    publicProjects,
    activity,
    loading,
    isOwnProfile,
    touchActive,
  } = useProfile(userId);

  const [requestProject, setRequestProject] = useState<(ProjectCard & { role: string | null }) | null>(null);

  useEffect(() => {
    if (isOwnProfile) touchActive();
  }, [isOwnProfile, touchActive]);

  if (loading) return <LoadingSkeleton />;

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-4">
          <Users size={28} className="text-muted-foreground/40" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">User not found</h2>
        <p className="text-sm text-muted-foreground mt-1">This profile doesn&apos;t exist or is private.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      <StatsSection profile={profile} />

      {isOwnProfile && activity && <ActivitySection activity={activity} />}

      {isOwnProfile && (
        <ProjectsSection owned={ownedProjects} shared={sharedProjects} loading={loading} />
      )}

      {!isOwnProfile && publicProjects.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Globe size={14} className="text-primary" />
            Public Projects
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {publicProjects.map((p) => (
              <PublicProjectCard
                key={p.id}
                project={p}
                currentUserId={currentUserId ?? undefined}
                onRequestAccess={setRequestProject}
              />
            ))}
          </div>
        </div>
      )}

      {!isOwnProfile && publicProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-border rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
            <Globe size={26} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No public projects</p>
          <p className="text-xs text-muted-foreground mt-1">This user hasn&apos;t made any projects public.</p>
        </div>
      )}

      {requestProject && currentUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative">
            <RequestAccessModal
              projectId={requestProject.id}
              projectName={requestProject.name}
              currentUserId={currentUserId}
              onApproved={() => setRequestProject(null)}
            />
            <button
              onClick={() => setRequestProject(null)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center text-xs text-muted-foreground hover:text-foreground shadow-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
