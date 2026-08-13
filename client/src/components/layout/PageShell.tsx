interface PageShellProps {
  children: React.ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="min-h-screen bg-app">
      <div className="w-full max-w-7xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
