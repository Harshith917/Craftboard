import { Check } from "lucide-react";

const HIGHLIGHTS = [
  "Real-time Collaboration", "Authentication", "Role-based Permissions",
  "Projects", "Pages", "Canvas Editor",
  "Reusable Components", "Responsive Dashboard", "Protected APIs",
  "Modern Architecture", "Type Safety", "Dark Mode Support",
];

export default function HighlightsSection() {
  return (
    <section className="border-t border-border/60 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Engineering</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Built with modern engineering
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Every feature follows industry best practices for performance, security, and maintainability.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-5xl mx-auto">
          {HIGHLIGHTS.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 hover:border-primary/25 hover:bg-white hover:shadow-sm transition-all"
            >
              <Check size={13} className="shrink-0 text-emerald-500" />
              <span className="text-xs font-medium text-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
