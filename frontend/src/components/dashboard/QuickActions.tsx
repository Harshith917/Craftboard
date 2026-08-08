"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, FolderOpen, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

const actions = [
  {
    label: "New Project",
    icon: Plus,
    desc: "Create a new design project",
    href: null,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    hoverBg: "hover:bg-indigo-50",
  },
  {
    label: "All Projects",
    icon: FolderOpen,
    desc: "Browse and manage projects",
    href: "/project",
    color: "text-violet-600",
    bg: "bg-violet-50",
    hoverBg: "hover:bg-violet-50",
  },
  {
    label: "Invite Team",
    icon: Users,
    desc: "Add collaborators to projects",
    href: null,
    color: "text-teal-600",
    bg: "bg-teal-50",
    hoverBg: "hover:bg-teal-50",
  },
  {
    label: "Access Center",
    icon: ArrowRight,
    desc: "Manage invitations and access requests",
    href: "/access",
    color: "text-amber-600",
    bg: "bg-amber-50",
    hoverBg: "hover:bg-amber-50",
  },
];

export function QuickActions() {
  const router = useRouter();
  const api = useApi();
  const [creating, setCreating] = useState(false);

  const handleAction = async (action: (typeof actions)[0]) => {
    if (action.href) {
      router.push(action.href);
      return;
    }

    if (action.label === "New Project") {
      setCreating(true);
      try {
        const project = await api.post("project", {
          name: "Untitled Project",
        });
        toast.success("Project created");
        router.push(`/project/${project.id}/pages`);
      } catch {
        toast.error("Failed to create project");
      } finally {
        setCreating(false);
      }
    }

    if (action.label === "Invite Team") {
      router.push("/project");
    }
  };

  return (
    <div className="rounded-2xl surface p-5">
      <h2 className="text-sm font-semibold text-foreground mb-1">
        Quick Actions
      </h2>
      <p className="text-xs text-muted-foreground mb-3">Jump straight in</p>
      <div className="space-y-1.5">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              onClick={() => handleAction(action)}
              disabled={creating}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-muted transition-colors disabled:opacity-50 group"
            >
              <div className={`p-1.5 rounded-lg ${action.bg} ${action.color}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-[11px] text-muted-foreground">{action.desc}</p>
              </div>
              <ArrowRight size={13} className="text-muted-foreground/50 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
