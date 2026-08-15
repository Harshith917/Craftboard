import { Link } from "react-router-dom";
import {
  ArrowRight,
  MousePointer2,
  Square,
  Circle,
  Type,
  Layers,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { value: "10ms", label: "sync latency" },
  { value: "99.9%", label: "uptime" },
  { value: "3", label: "access roles" },
];

const COLLABORATORS = [
  { name: "Aria", color: "#6366f1", initials: "AR" },
  { name: "Noah", color: "#7c3aed", initials: "NO" },
  { name: "Ivy", color: "#0ea5e9", initials: "IV" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-app pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22),transparent_70%)]" />
        <div className="absolute top-48 -left-40 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.18),transparent_70%)]" />
        <div className="absolute top-24 -right-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.14),transparent_70%)]" />
      </div>

      {/* Centered copy */}
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-500/5 px-3.5 py-1.5 text-xs font-medium text-indigo-600 dark:border-indigo-400/30 dark:text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Real-time wireframing for teams
        </div>

        <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
          Design together,
          <br />
          <span className="text-gradient">ship faster.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Craftboard is the browser-based wireframing tool where your team sketches,
          collaborates, and keeps every canvas in sync — no downloads, no setup.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-sm text-white bg-[linear-gradient(110deg,#4f46e5,#7c3aed)] dark:bg-[linear-gradient(110deg,#6366f1,#8b5cf6)] hover:opacity-90 shadow-[0_8px_24px_-8px_rgba(79,70,229,0.5)] hover:shadow-[0_10px_30px_-8px_rgba(124,58,237,0.5)] transition-all"
          >
            <Link to="/sign-up">
              Launch App
              <ArrowRight size={15} className="ml-1.5" />
            </Link>
          </Button>
          <a href="#features">
            <Button size="lg" variant="outline" className="h-12 px-8 text-sm">
              Explore features
            </Button>
          </a>
        </div>

        <div className="mt-12 flex items-center justify-center gap-10 sm:gap-14">
          {STATS.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
              <span className="mt-1 text-xs text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Full-width editor mockup */}
      <div className="relative mx-auto mt-16 sm:mt-20 max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="absolute -inset-8 bg-[conic-gradient(from_140deg_at_50%_50%,rgba(99,102,241,0.25),rgba(124,58,237,0.22),rgba(56,189,248,0.20),rgba(79,70,229,0.22),rgba(99,102,241,0.25))] dark:bg-[conic-gradient(from_140deg_at_50%_50%,rgba(99,102,241,0.30),rgba(139,92,246,0.26),rgba(56,189,248,0.22),rgba(99,102,241,0.28),rgba(99,102,241,0.30))] rounded-[2rem] blur-3xl opacity-60"
          aria-hidden="true"
        />

        <div className="relative rounded-2xl border border-border bg-white dark:bg-neutral-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="ml-3 flex items-center gap-1.5 rounded-md bg-background border border-border px-2.5 py-1 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              craftboard.app/editor/mobile-wireframe
            </div>
            <div className="ml-auto flex items-center gap-2 text-muted-foreground">
              <Layers size={12} />
              <Square size={12} />
              <Type size={12} />
              <Download size={12} />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/30 px-4 py-2">
            {["select", "rect", "circle", "text"].map((t, i) => (
              <span
                key={t}
                className={`flex h-6 w-6 items-center justify-center rounded ${
                  i === 0 ? "bg-indigo-500/10 text-indigo-600" : "text-muted-foreground"
                }`}
              >
                {i === 0 ? <MousePointer2 size={12} /> : i === 1 ? <Square size={12} /> : i === 2 ? <Circle size={12} /> : <Type size={12} />}
              </span>
            ))}
            <div className="ml-auto flex -space-x-1.5">
              {COLLABORATORS.map((c) => (
                <span
                  key={c.name}
                  title={c.name}
                  className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-bold text-white"
                  style={{ backgroundColor: c.color }}
                >
                  {c.initials}
                </span>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="relative h-80 sm:h-96 overflow-hidden">
            <video
              className="h-full w-full object-cover"
              src="/hero.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </div>
    </section>
  );
}
