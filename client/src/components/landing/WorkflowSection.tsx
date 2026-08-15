import { FolderPlus, UserPlus, Users, ShieldCheck, PenTool, Share2 } from "lucide-react";

const STEPS = [
  {
    icon: FolderPlus,
    title: "Create Project",
    desc: "Start a new design project with a name and description.",
  },
  {
    icon: UserPlus,
    title: "Invite Team",
    desc: "Send invitations by email. Teammates join instantly.",
  },
  {
    icon: Users,
    title: "Collaborate Live",
    desc: "Edit the same canvas together. See changes in real time.",
  },
  {
    icon: ShieldCheck,
    title: "Manage Access",
    desc: "Assign roles — owner, editor, or viewer — per member.",
  },
  {
    icon: PenTool,
    title: "Design Together",
    desc: "Use the full shape library, inspector, and alignment tools.",
  },
  {
    icon: Share2,
    title: "Export & Share",
    desc: "Share canvases with view-only links and embeddable views.",
  },
];

export default function WorkflowSection() {
  return (
    <section className="border-t border-border/60 bg-app py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div className="max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-500">Workflow</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              From idea to shared canvas in minutes
            </h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm md:text-right">
            Create a project, invite teammates, and start designing together — no setup required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STEPS.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-border bg-background p-5 surface-hover">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300">
                  <step.icon size={16} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <div className="text-sm font-semibold text-foreground">{step.title}</div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
