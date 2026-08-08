"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Architecture", href: "#architecture" },
  { label: "Demo", href: "#demo" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#6d5bf5,#a855f7,#ec4899)] text-[10px] font-bold text-white tracking-tight shadow-[0_4px_12px_-4px_rgba(168,85,247,0.6)]">
            CF
          </div>
          <span className="text-base font-semibold text-foreground">
            Canvazz Flow
          </span>
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
          <SignInButton mode="modal">
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Button>
          </SignInButton>
          <SignUpButton mode="modal" fallbackRedirectUrl="/sync">
            <Button
              size="sm"
              className="text-sm text-white bg-[linear-gradient(110deg,#6d5bf5,#a855f7)] hover:opacity-90 shadow-[0_4px_16px_-6px_rgba(109,91,245,0.6)]"
            >
              Get Started Free
            </Button>
          </SignUpButton>
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
        <div className="md:hidden border-t border-border/60 bg-white px-4 py-4 space-y-3">
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
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="w-full">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal" fallbackRedirectUrl="/sync">
              <Button
                size="sm"
                className="w-full text-white bg-[linear-gradient(110deg,#6d5bf5,#a855f7)] hover:opacity-90"
              >
                Get Started Free
              </Button>
            </SignUpButton>
          </div>
        </div>
      )}
    </header>
  );
}
