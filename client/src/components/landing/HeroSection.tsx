
import { SignUpButton } from "@clerk/clerk-react";
import { ArrowRight, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

const WORDS = [
  "wireframes",
  "mockups",
  "dashboards",
  "posters",
  "UI layouts",
  "sitemaps",
];

export default function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const modalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setInterval(
      () => setWordIdx((i) => (i + 1) % WORDS.length),
      2200,
    );
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (videoOpen && modalVideoRef.current) {
      modalVideoRef.current.currentTime = 0;
      modalVideoRef.current.play();
    }
    if (!videoOpen && modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  }, [videoOpen]);

  return (
    <section className="relative overflow-hidden bg-white pt-24 pb-16 sm:pt-32 sm:pb-24">
      {/* Decorative mesh blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(109,91,245,0.15),transparent_70%)]" />
        <div className="absolute -top-20 right-0 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_70%)]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.10),transparent_70%)]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: Text */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Real-time collaboration
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-[1.08]">
              Design together,
              <br />
              <span className="text-gradient">in real time.</span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed max-w-md">
              CanvasFlow is a collaborative design platform built for teams.
              Create{" "}
              <span className="text-foreground font-medium border-b border-dashed border-primary/40 transition-all duration-700">
                {WORDS[wordIdx]}
              </span>{" "}
              together in your browser. No setup required.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <SignUpButton mode="modal" fallbackRedirectUrl="/sync">
                <Button
                  size="lg"
                  className="h-11 px-6 text-sm text-white bg-[linear-gradient(110deg,#6d5bf5,#a855f7)] hover:opacity-90 shadow-[0_8px_24px_-8px_rgba(109,91,245,0.6)] hover:shadow-[0_10px_30px_-8px_rgba(109,91,245,0.75)] transition-all"
                >
                  Launch App
                  <ArrowRight size={15} className="ml-1.5" />
                </Button>
              </SignUpButton>
            </div>
            <div className="mt-8 flex items-center gap-5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] text-emerald-700 font-semibold">
                  10
                </span>
                ms sync
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-semibold">
                  99
                </span>
                % uptime
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-fuchsia-100 flex items-center justify-center text-[10px] text-fuchsia-700 font-semibold">
                  2k
                </span>
                + teams
              </span>
            </div>
          </div>

          {/* Right: Demo video */}
          <div className="relative">
            <div className="absolute -inset-4 bg-[conic-gradient(from_140deg_at_50%_50%,rgba(109,91,245,0.25),rgba(168,85,247,0.2),rgba(236,72,153,0.18),rgba(14,165,233,0.2),rgba(109,91,245,0.25))] rounded-3xl blur-2xl opacity-40" aria-hidden="true" />
            <button
              onClick={() => setVideoOpen(true)}
              className="group relative rounded-2xl border border-border bg-white shadow-xl overflow-hidden cursor-pointer w-full"
            >
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full aspect-video object-cover"
              >
                <source src="/canvazz-flow-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent flex items-center justify-center group-hover:from-indigo-950/50 transition-colors">
                <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                  <Play size={22} className="text-indigo-600 ml-0.5" fill="currentColor" />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {videoOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-8"
          onClick={() => setVideoOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-sm cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="rounded-xl overflow-hidden bg-black shadow-2xl">
              <video
                ref={modalVideoRef}
                controls
                playsInline
                className="w-full aspect-video object-contain"
              >
                <source src="/canvazz-flow-video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
