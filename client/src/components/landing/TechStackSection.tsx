import {
  Atom,
  Braces,
  Server,
  Shapes,
  Zap,
  Radio,
  Database,
  KeyRound,
  Wind,
  Network,
  Component,
  Rocket,
} from "lucide-react";

const STACK = [
  { icon: Atom, name: "React 19 + Vite", role: "UI runtime & build" },
  { icon: Braces, name: "TypeScript", role: "End-to-end type safety" },
  { icon: Server, name: "Express 5", role: "REST API" },
  { icon: Shapes, name: "Konva", role: "Canvas rendering" },
  { icon: Zap, name: "Liveblocks", role: "CRDT real-time sync" },
  { icon: Radio, name: "Socket.IO", role: "Live notifications & events" },
  { icon: Database, name: "Prisma + PostgreSQL", role: "ORM & database" },
  { icon: KeyRound, name: "Clerk", role: "Authentication" },
  { icon: Wind, name: "Tailwind CSS v4", role: "Styling" },
  { icon: Network, name: "SWR + Axios", role: "Data fetching" },
  { icon: Component, name: "Radix UI", role: "Accessible primitives" },
  { icon: Rocket, name: "Vite", role: "Dev tooling" },
];

export default function TechStackSection() {
  return (
    <section id="stack" className="border-t border-border/60 bg-app py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Split header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Tech stack</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Modern tools, one canvas
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            A deliberately small, fast, and type-safe stack that makes real-time editing feel instant.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {STACK.map((s) => (
            <div key={s.name} className="group rounded-2xl border border-border bg-background p-5 surface-hover">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/5 group-hover:bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] group-hover:text-white transition-all duration-200 mb-3">
                <s.icon size={16} className="text-indigo-500 group-hover:text-white transition-colors" />
              </div>
              <div className="text-sm font-semibold text-foreground">{s.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{s.role}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
