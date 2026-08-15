import {
  Users,
  Maximize2,
  FolderKanban,
  ShieldCheck,
  UserPlus,
  MousePointer2,
  Shapes,
  Files,
  Search,
  Bell,
  StickyNote,
  SlidersHorizontal,
} from "lucide-react";

const FEATURES = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    desc: "Multiple users edit the same canvas simultaneously with instant sync via Liveblocks.",
  },
  {
    icon: Maximize2,
    title: "Infinite Canvas",
    desc: "Zoom, pan, and create without boundaries. The canvas extends as far as you need.",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    desc: "Organize designs into projects and pages. Keep everything structured.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based Access",
    desc: "Granular permissions — owner, editor, and viewer roles for every project.",
  },
  {
    icon: UserPlus,
    title: "Team Invitations",
    desc: "Invite teammates by email. Manage pending and active members.",
  },
  {
    icon: MousePointer2,
    title: "Live Presence",
    desc: "See who is viewing the canvas, what they select, and where their cursor is.",
  },
  {
    icon: Shapes,
    title: "Canvas Editor",
    desc: "Rectangles, circles, text, frames, stars, arrows — a full shape library.",
  },
  {
    icon: Files,
    title: "Page Management",
    desc: "Create and switch between multiple pages within a project.",
  },
  {
    icon: Search,
    title: "Universal Search",
    desc: "Search across projects, pages, and members from a single command palette.",
  },
  {
    icon: Bell,
    title: "Notifications",
    desc: "Access requests, role changes, and invites — stay informed.",
  },
  {
    icon: StickyNote,
    title: "Asset Support",
    desc: "Drag and drop images, sticky notes, code blocks, and dividers onto the canvas.",
  },
  {
    icon: SlidersHorizontal,
    title: "Inspector Panel",
    desc: "Fine-tune every property — position, size, color, typography, and effects.",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border/60 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Features</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Everything you need to design
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            A complete set of tools for creating wireframes, mockups, and layouts with your team.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="group rounded-2xl border border-border bg-app p-5 surface-hover">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 mb-3 transition-colors group-hover:bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] group-hover:text-white">
                <f.icon size={16} />
              </div>
              <div className="text-sm font-semibold text-foreground">{f.title}</div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
