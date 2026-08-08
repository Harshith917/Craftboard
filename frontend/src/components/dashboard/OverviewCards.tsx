"use client";

import { motion } from "motion/react";
import { FolderOpen, FileText, Users, Bell } from "lucide-react";
import type { DashboardStats } from "@/hooks/useDashboard";

const cards = [
  {
    label: "Total Projects",
    key: "totalProjects" as const,
    icon: FolderOpen,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    tint: "from-indigo-50 to-white",
  },
  {
    label: "Total Pages",
    key: "totalPages" as const,
    icon: FileText,
    color: "text-violet-600",
    bg: "bg-violet-50",
    tint: "from-violet-50 to-white",
  },
  {
    label: "Collaborators",
    key: "totalMembers" as const,
    icon: Users,
    color: "text-teal-600",
    bg: "bg-teal-50",
    tint: "from-teal-50 to-white",
  },
  {
    label: "Pending Requests",
    key: "pendingRequests" as const,
    icon: Bell,
    color: "text-amber-600",
    bg: "bg-amber-50",
    tint: "from-amber-50 to-white",
  },
];

export function OverviewCards({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-2xl surface surface-hover p-5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.tint} opacity-70`} />
            <div className="relative flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg} ring-1 ring-black/5`}>
                <Icon size={17} className={card.color} />
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <p className="relative text-[26px] font-bold text-foreground tabular-nums tracking-tight">
              {value}
            </p>
            <p className="relative text-xs font-medium text-muted-foreground mt-1">
              {card.label}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
