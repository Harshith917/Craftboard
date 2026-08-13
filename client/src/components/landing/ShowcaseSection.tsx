import { ArrowUpRight } from "lucide-react";

const SHOWCASE = [
  {
    letter: "E",
    title: "Editor",
    desc: "Full-featured canvas with shape tools, layers panel, properties inspector, and real-time collaboration.",
  },
  {
    letter: "D",
    title: "Dashboard",
    desc: "Project overview with search, recent activity, and quick access to all your canvases.",
  },
  {
    letter: "M",
    title: "Members & Roles",
    desc: "Manage team members, assign roles, and review access requests — all from one panel.",
  },
  {
    letter: "A",
    title: "Access Requests",
    desc: "Review and approve or decline access requests. Full audit trail for every request.",
  },
];

export default function ShowcaseSection() {
  return (
    <section id="demo" className="border-t border-border/60 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-sky-500">Demo</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              See it in action
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            A closer look at the interfaces that power Craftboard.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SHOWCASE.map((s) => (
            <div
              key={s.title}
              className="group relative rounded-2xl border border-border bg-app p-5 surface-hover overflow-hidden"
            >
              <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.16),transparent_70%)]" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#0ea5e9,#38bdf8)] text-sm font-bold text-white">
                    {s.letter}
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-muted-foreground transition-colors group-hover:text-sky-500"
                  />
                </div>
                <div className="text-sm font-semibold text-foreground">{s.title}</div>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
