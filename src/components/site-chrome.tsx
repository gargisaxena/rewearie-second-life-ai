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
        className="text-[0.8125rem] lowercase tracking-[0.12em] text-muted-foreground transition-colors duration-300 hover:text-rose-deep"
      >
        sign in
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
      className="text-[0.8125rem] lowercase tracking-[0.12em] text-muted-foreground transition-colors duration-300 hover:text-rose-deep"
    >
      sign out
    </button>
  );
}


export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`font-serif lowercase tracking-tight text-foreground transition-opacity duration-300 hover:opacity-60 ${className}`}
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
    <Link to="/analyze" className={`btn-base btn-primary ${className}`}>
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-5 sm:px-8 md:flex md:justify-between">
        <Wordmark className="truncate text-[1.6rem]" />

        <nav className="hidden items-center gap-10 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative text-[0.8125rem] lowercase tracking-[0.12em] text-muted-foreground transition-colors duration-300 hover:text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-rose after:transition-all after:duration-300 hover:after:w-full"
              activeProps={{ className: "text-foreground after:w-full" }}
            >
              {item.label}
            </Link>
          ))}
          <AuthLink />
          <AnalyzeButton className="px-5 py-3" />
        </nav>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-md border border-border p-2.5 text-foreground transition-colors hover:border-rose/60 md:hidden"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="fade-in-soft border-t border-border/70 bg-background px-5 pb-7 pt-4 md:hidden">
          <nav className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="border-b border-border/50 px-1 py-4 font-serif text-2xl lowercase text-muted-foreground transition-colors hover:text-rose-deep"
                activeProps={{ className: "text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="px-1 py-4">
              <AuthLink onNavigate={() => setOpen(false)} />
            </div>
          </nav>
          <AnalyzeButton className="mt-2 w-full" />
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-28 border-t border-border bg-secondary/35">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 md:flex-row md:items-end md:justify-between">
        <div>
          <Wordmark className="text-xl" />
          <p className="mt-3 max-w-xs font-serif text-xl italic leading-snug text-muted-foreground">
            give your clothes another little life.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-9 gap-y-3 text-[0.8125rem] lowercase tracking-[0.1em] text-muted-foreground">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="transition-colors hover:text-rose-deep">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

