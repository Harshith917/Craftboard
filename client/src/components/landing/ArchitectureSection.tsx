import ArchitectureDiagram from "./ArchitectureDiagram";

export default function ArchitectureSection() {
  return (
    <section id="architecture" className="border-t border-border/60 bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Architecture</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How it all fits together
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            A layered architecture built for real-time, collaborative design.
          </p>
        </div>

        <ArchitectureDiagram />
      </div>
    </section>
  );
}
