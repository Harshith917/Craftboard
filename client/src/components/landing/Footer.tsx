import Logo from "@/components/common/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size={28} showWordmark />

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              GitHub
            </a>
            <a href="#features" className="hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-foreground transition-colors">
              Architecture
            </a>
            <a href="#demo" className="hover:text-foreground transition-colors">
              Demo
            </a>
            <a href="/sign-in" className="hover:text-foreground transition-colors">
              Sign in
            </a>
          </div>

          <p className="text-xs text-muted-foreground">
            Built with <span className="text-sky-400">&hearts;</span> using React and Express
          </p>
        </div>
      </div>
    </footer>
  );
}
