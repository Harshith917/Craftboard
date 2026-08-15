import {
  Users,
  KeyRound,
  ShieldCheck,
  FolderKanban,
  Files,
  Shapes,
  Component,
  LayoutDashboard,
  Lock,
  Network,
  Braces,
  Moon,
} from "lucide-react";

const BADGES = [
  { icon: Users, label: "Real-time Collaboration" },
  { icon: KeyRound, label: "Authentication" },
  { icon: ShieldCheck, label: "Role-based Permissions" },
  { icon: FolderKanban, label: "Projects" },
  { icon: Files, label: "Pages" },
  { icon: Shapes, label: "Canvas Editor" },
  { icon: Component, label: "Reusable Components" },
  { icon: LayoutDashboard, label: "Responsive Dashboard" },
  { icon: Lock, label: "Protected APIs" },
  { icon: Network, label: "Modern Architecture" },
  { icon: Braces, label: "Type Safety" },
  { icon: Moon, label: "Dark Mode Support" },
];

export default function EngineeringSection() {
  return (
    <section className="border-t border-border/60 bg-app py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Engineering</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Built with modern engineering
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            Every feature follows industry best practices for performance, security, and maintainability.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {BADGES.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-2.5 rounded-full border border-border bg-background px-4 py-2.5 surface-hover"
            >
              <b.icon size={14} className="text-indigo-500" />
              <span className="text-xs font-medium text-foreground">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
