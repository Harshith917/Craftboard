
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/common/Logo";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Demo", href: "#demo" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User";
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((s) => (s as string)[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/landing" aria-label="Craftboard home">
          <Logo size={32} showWordmark />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isLoaded && isSignedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/10 text-[10px] font-semibold text-sky-600">
                {initials}
              </span>
              <span className="ml-1.5">{name} · Sign out</span>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                <Link to="/sign-in">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="text-sm text-white bg-[linear-gradient(110deg,#0ea5e9,#38bdf8)] hover:opacity-90 shadow-[0_4px_16px_-6px_rgba(14,165,233,0.6)]"
              >
                <Link to="/sign-up">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground py-1"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {isLoaded && isSignedIn ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
              >
                <LogOut size={15} className="mr-1.5" />
                Sign out ({name})
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm" className="w-full" onClick={() => setOpen(false)}>
                  <Link to="/sign-in">Sign in</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="w-full text-white bg-[linear-gradient(110deg,#0ea5e9,#38bdf8)] hover:opacity-90"
                  onClick={() => setOpen(false)}
                >
                  <Link to="/sign-up">Get Started Free</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
