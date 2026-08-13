import { FolderOpen, FileText, Users, Bell } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboard";

const items = [
  { label: "Projects", key: "totalProjects" as const, icon: FolderOpen, chip: "bg-sky-500/10 text-sky-500" },
  { label: "Pages", key: "totalPages" as const, icon: FileText, chip: "bg-violet-500/10 text-violet-500" },
  { label: "Collaborators", key: "totalMembers" as const, icon: Users, chip: "bg-emerald-500/10 text-emerald-500" },
  { label: "Pending", key: "pendingRequests" as const, icon: Bell, chip: "bg-amber-500/10 text-amber-500" },
];

export function SidebarStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="rounded-xl border border-border bg-card p-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.chip}`}>
              <Icon size={15} />
            </div>
            <p className="mt-3 text-xl font-bold tabular-nums leading-none tracking-tight text-foreground">
              {stats[item.key]}
            </p>
            <p className="mt-1 text-[11px] font-medium text-muted-foreground">{item.label}</p>
          </div>
        );
      })}
    </div>
  );
}
