const SHOWCASE_ITEMS = [
  {
    label: "Editor",
    desc: "Full-featured canvas with shape tools, layers panel, properties inspector, and real-time collaboration.",
    gradient: "from-indigo-100/60 via-violet-50/40 to-purple-100/60",
    border: "border-primary/15",
  },
  {
    label: "Dashboard",
    desc: "Project overview with search, recent activity, and quick-access to all your canvases.",
    gradient: "from-slate-100/60 via-slate-50 to-indigo-50/40",
    border: "border-border",
  },
  {
    label: "Members & Roles",
    desc: "Manage team members, assign roles, and review access requests â€” all from one panel.",
    gradient: "from-purple-100/60 via-fuchsia-50/40 to-pink-100/60",
    border: "border-fuchsia-200/60",
  },
  {
    label: "Access Requests",
    desc: "Review and approve or decline access requests. Full audit trail for every request.",
    gradient: "from-amber-100/60 via-orange-50/40 to-rose-100/60",
    border: "border-amber-200/60",
  },
];

export default function ShowcaseSection() {
  return (
    <section className="border-t border-border/60 bg-app py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Showcase</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            See it in action
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            A closer look at the interfaces that power CanvasFlow.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {SHOWCASE_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`group relative overflow-hidden rounded-2xl border ${item.border} bg-gradient-to-br ${item.gradient} p-6 hover:shadow-[0_12px_40px_-12px_rgba(109,91,245,0.3)] transition-all duration-200 cursor-default`}
            >
              <div className="relative">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-[10px] font-bold text-primary border border-border">
                    {item.label[0]}
                  </div>
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md">{item.desc}</p>
                <div className="mt-4 flex gap-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full bg-white/70" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
