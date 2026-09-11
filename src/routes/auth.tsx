import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

type Search = { next?: string | undefined };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const next = search["next"];
    return {
      next: typeof next === "string" && next.startsWith("/") ? next : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Sign in — rewearie ♡" },
      {
        name: "description",
        content:
          "Sign in to rewearie to keep your analyzed pieces and revisit their recommendations any time.",
      },
      { property: "og:title", content: "Sign in — rewearie ♡" },
      {
        property: "og:description",
        content: "Your wardrobe archive, kept safely between visits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const { user, ready } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ready && user) navigate({ to: next ?? "/pieces", replace: true });
  }, [ready, user, next, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (err) return setError(err.message);
      if (!data.session) {
        return setMessage("Check your inbox to confirm your email, then sign in.");
      }
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError(err.message);
  }

  async function google() {
    setError(null);
    if (next) window.sessionStorage.setItem("rewearie.next", next);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("We couldn't reach Google just now. Try again in a moment.");
      return;
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-20 sm:px-8 lg:py-28">
      <div className="rise-in text-center">
        <p className="text-eyebrow">your archive</p>
        <h1 className="mt-5 text-4xl sm:text-5xl">
          {mode === "signin" ? "welcome back ♡" : "keep your pieces ♡"}
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-lede">
          Sign in so every piece you analyze is kept, and you can revisit its next life whenever you
          like.
        </p>
      </div>

      <div className="card-soft rise-in-slow mt-12 p-7 sm:p-9">
        <button type="button" onClick={google} className="btn-base btn-quiet w-full">
          continue with google
        </button>

        <div className="my-7 flex items-center gap-4 text-[0.625rem] uppercase tracking-[0.28em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="email" className="text-eyebrow">
              email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-3 w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors duration-300 placeholder:text-muted-foreground focus:border-rose"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-eyebrow">
              password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-3 w-full rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors duration-300 focus:border-rose"
            />
          </div>

          {error && <p className="text-xs italic text-rose-deep">{error}</p>}
          {message && <p className="text-xs italic text-muted-foreground">{message}</p>}

          <button type="submit" disabled={busy} className="btn-base btn-primary w-full">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "sign in ♡" : "create my archive ♡"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setMessage(null);
          }}
          className="mt-7 w-full text-center text-xs lowercase tracking-[0.08em] text-muted-foreground transition-colors hover:text-rose-deep"
        >
          {mode === "signin"
            ? "new here? create an account"
            : "already have an account? sign in"}
        </button>
      </div>
    </div>

  );
}
