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
  { value: "10ms", label: "sync" },
  { value: "99%", label: "uptime" },
  { value: "2k+", label: "teams" },
];

const COLLABORATORS = [
  { name: "Aria", color: "#0ea5e9", initials: "AR" },
  { name: "Noah", color: "#111827", initials: "NO" },
  { name: "Ivy", color: "#38bdf8", initials: "IV" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-app pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 left-1/2 h-[28rem] w-[36rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.18),transparent_70%)]" />
        <div className="absolute top-48 -left-40 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12),transparent_70%)]" />
        <div className="absolute top-24 -right-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.14),transparent_70%)]" />
      </div>

      {/* Centered copy */}
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-500/5 px-3.5 py-1.5 text-xs font-medium text-sky-600 dark:border-sky-400/30 dark:text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
          Real-time collaboration
        </div>

        <h1 className="mt-6 text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05]">
          Design together,
          <br />
          <span className="text-gradient">in real time.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          Craftboard is a collaborative design platform built for teams.
          Create wireframes together in your browser. No setup required.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-12 px-8 text-sm text-white bg-[linear-gradient(110deg,#0ea5e9,#38bdf8)] hover:opacity-90 shadow-[0_8px_24px_-8px_rgba(14,165,233,0.6)] hover:shadow-[0_10px_30px_-8px_rgba(14,165,233,0.75)] transition-all"
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
          className="absolute -inset-8 bg-[conic-gradient(from_140deg_at_50%_50%,rgba(14,165,233,0.28),rgba(56,189,248,0.22),rgba(125,211,252,0.18),rgba(2,132,199,0.22),rgba(14,165,233,0.28))] rounded-[2rem] blur-3xl opacity-50"
          aria-hidden="true"
        />

        <div className="relative rounded-2xl border border-border bg-white shadow-[0_30px_80px_-30px_rgba(14,165,233,0.45)] overflow-hidden">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
            <div className="ml-3 flex items-center gap-1.5 rounded-md bg-background border border-border px-2.5 py-1 text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
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
                  i === 0 ? "bg-sky-500/10 text-sky-600" : "text-muted-foreground"
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
          <div className="relative h-80 sm:h-96 bg-[linear-gradient(to_right,rgba(14,165,233,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(14,165,233,0.07)_1px,transparent_1px)] bg-[size:26px_26px] overflow-hidden">
            {/* mobile frame */}
            <div className="absolute left-[12%] top-[16%] h-44 w-28 rounded-xl border-2 border-sky-400 bg-white shadow-xl">
              <div className="mx-auto mt-2.5 h-1.5 w-9 rounded-full bg-sky-300/60" />
              <div className="m-2.5 h-14 rounded bg-sky-100" />
              <div className="m-2.5 flex gap-2">
                <div className="h-8 flex-1 rounded bg-neutral-200" />
                <div className="h-8 flex-1 rounded bg-sky-100" />
              </div>
              <span className="absolute -top-1.5 -left-1.5 h-3 w-3 rounded-full border-2 border-white bg-sky-500 shadow" />
              <span className="absolute -bottom-1.5 -right-1.5 h-3 w-3 rounded-full border-2 border-white bg-sky-500 shadow" />
            </div>

            {/* circle */}
            <div className="absolute right-[18%] top-[20%] h-20 w-20 rounded-full bg-[radial-gradient(circle_at_35%_35%,#38bdf8,#0ea5e9)] shadow-xl" />

            {/* text block */}
            <div className="absolute right-[28%] top-[62%] space-y-2">
              <div className="h-2 w-36 rounded-full bg-neutral-300" />
              <div className="h-2 w-24 rounded-full bg-neutral-300" />
              <div className="h-2 w-32 rounded-full bg-sky-400/50" />
            </div>

            {/* sticky note */}
            <div className="absolute left-[44%] bottom-[14%] h-16 w-20 rounded-md border border-sky-200 bg-sky-50 p-2 rotate-2">
              <div className="h-1.5 w-8 rounded-full bg-sky-300/70" />
              <div className="mt-1.5 h-1.5 w-12 rounded-full bg-neutral-300" />
            </div>

            {/* cursors */}
            <div className="absolute left-[48%] top-[30%] animate-pulse">
              <MousePointer2 size={16} className="text-[#0ea5e9] fill-[#0ea5e9]" />
              <span className="ml-0.5 rounded bg-[#0ea5e9] px-1.5 py-0.5 text-[9px] font-semibold text-white">Aria</span>
            </div>
            <div className="absolute left-[24%] top-[64%] animate-pulse" style={{ animationDelay: "0.6s" }}>
              <MousePointer2 size={16} className="text-[#111827] fill-[#111827]" />
              <span className="ml-0.5 rounded bg-[#111827] px-1.5 py-0.5 text-[9px] font-semibold text-white">Noah</span>
            </div>

            {/* status bar */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-border/70 bg-muted/40 px-4 py-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                Live
              </span>
              <span>3 editing · saved to cloud</span>
              <span className="hidden sm:inline">100%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
