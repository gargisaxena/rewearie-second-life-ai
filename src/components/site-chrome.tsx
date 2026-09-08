import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { to: "/analyze", label: "Analyze" },
  { to: "/pieces", label: "My Pieces" },
  { to: "/impact", label: "Impact" },
] as const;

function AuthLink({ onNavigate }: { onNavigate?: () => void }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  if (!ready) return null;

  if (!user) {
    return (
      <Link
        to="/auth"
        onClick={onNavigate}
        className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        Sign in
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        onNavigate?.();
        await supabase.auth.signOut();
        navigate({ to: "/", replace: true });
      }}
      className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
    >
      Sign out
    </button>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`font-serif lowercase tracking-tight text-foreground transition-opacity hover:opacity-70 ${className}`}
    >
      rewearie <span className="text-rose">♡</span>
    </Link>
  );
}

export function AnalyzeButton({
  className = "",
  label = "analyze a piece ♡",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <Link
      to="/analyze"
      className={`inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm lowercase tracking-wide text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-deep ${className}`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-4 sm:px-8 md:flex md:justify-between">
        <Wordmark className="truncate text-2xl" />

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
          <AuthLink />
          <AnalyzeButton className="px-5 py-2.5" />
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-lg border border-border p-2 text-foreground md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-5 pb-6 pt-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <AnalyzeButton className="mt-3 w-full" />
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-12 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Wordmark className="text-xl" />
          <p className="mt-2 max-w-xs font-serif text-lg italic text-muted-foreground">
            give your clothes another little life.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
