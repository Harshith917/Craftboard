
import { useState } from "react";
import { motion } from "motion/react";
import { Plus, FolderOpen, Users, ArrowRight, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/lib/api";
import { toast } from "sonner";

const actions = [
  {
    label: "New Project",
    icon: Plus,
    desc: "Create a design project",
    href: null,
  },
  {
    label: "All Projects",
    icon: FolderOpen,
    desc: "Browse and manage",
    href: "/project",
  },
  {
    label: "Invite Team",
    icon: Users,
    desc: "Add collaborators",
    href: null,
  },
  {
    label: "Access Center",
    icon: ArrowRight,
    desc: "Manage invitations",
    href: "/access",
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const api = useApi();
  const [creating, setCreating] = useState(false);

  const handleAction = async (action: (typeof actions)[0]) => {
    if (action.href) {
      navigate(action.href);
      return;
    }

    if (action.label === "New Project") {
      setCreating(true);
      try {
        const project = await api.post("project", {
          name: "Untitled Project",
        });
        toast.success("Project created");
        navigate(`/project/${project.id}/pages`);
      } catch {
        toast.error("Failed to create project");
      } finally {
        setCreating(false);
      }
    }

    if (action.label === "Invite Team") {
      navigate("/project");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
          <Zap size={15} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground leading-none">Quick Actions</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Jump straight in</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => handleAction(action)}
              disabled={creating}
              className="group flex flex-col items-start gap-2 rounded-xl border border-border bg-app p-3 text-left hover:border-sky-300 dark:hover:border-sky-500/40 hover:shadow-[0_6px_20px_-10px_rgba(14,165,233,0.35)] transition-all disabled:opacity-50"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300 transition-colors group-hover:bg-[linear-gradient(135deg,#0ea5e9,#38bdf8)] group-hover:text-white">
                <Icon size={14} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {action.label}
                </p>
                <p className="text-[10px] text-muted-foreground">{action.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
