export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6d5bf5,#a855f7,#ec4899)] text-[8px] font-bold text-white">
              CF
            </div>
            <span className="text-sm font-semibold text-foreground">CanvasFlow</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Portfolio
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              LinkedIn
            </a>
            <span className="text-border">/</span>
            <span className="text-muted-foreground">Tech Stack</span>
          </div>

          <p className="text-xs text-muted-foreground">
            Built with <span className="text-rose-400">&hearts;</span> using Next.js and NestJS
          </p>
        </div>
      </div>
    </footer>
  );
}
