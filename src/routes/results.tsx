import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  IDEAS,
  OUTCOMES,
  explainResult,
  loadPieces,
  type Piece,
} from "@/lib/rewearie";

type Search = { id?: string | undefined };

export const Route = createFileRoute("/results")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search["id"] === "string" ? (search["id"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Your rewearie report — rewearie ♡" },
      {
        name: "description",
        content:
          "Your piece's recommended next life — its best match, full score report, and elegant ideas for what it could become.",
      },
      { property: "og:title", content: "Your rewearie report — rewearie ♡" },
      {
        property: "og:description",
        content: "A considered recommendation for the piece you just analyzed.",
      },
    ],
  }),
  component: Results,
});

function Results() {
  const { id } = Route.useSearch();
  const navigate = useNavigate();
  const [piece, setPiece] = useState<Piece | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const all = loadPieces();
    setPiece(all.find((p) => p.id === id) ?? all[0] ?? null);
    setReady(true);
  }, [id]);

  if (!ready) {
    return <div className="mx-auto max-w-5xl px-5 py-24 sm:px-8" />;
  }

  if (!piece) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <h1 className="text-4xl">Nothing to show yet.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Analyze a piece and its personal report will appear here.
        </p>
        <Link
          to="/analyze"
          className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm lowercase tracking-wide text-primary-foreground transition-colors hover:bg-rose-deep"
        >
          analyze a piece ♡
        </Link>
      </div>
    );
  }

  const outcome = OUTCOMES[piece.outcome];
  const max = piece.scores[0]!.score || 1;
  const ideas = IDEAS[piece.outcome];
  const explanation = explainResult(piece.outcome, piece.condition);

  // Circular score ring
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const ringOffset = CIRC * (1 - piece.confidence / 100);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
      <header className="rise-in text-center">
        <h1 className="text-4xl sm:text-5xl">your piece has potential ♡</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Here is its personal rewearie report — read it like a love letter to its next life.
        </p>
      </header>

      <div className="rise-in mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* LEFT — the piece */}
        <div>
          {piece.photo ? (
            <img
              src={piece.photo}
              alt={piece.name}
              className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lift"
            />
          ) : (
            <div className="grid aspect-[4/5] w-full place-items-center rounded-2xl bg-blush">
              <span className="font-serif text-2xl italic text-rose-deep">{piece.category}</span>
            </div>
          )}
        </div>

        {/* RIGHT — the report */}
        <div>
          <p className="text-eyebrow">your rewearie report</p>

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <dt className="text-eyebrow">item</dt>
              <dd className="mt-2 font-serif text-xl">{piece.name}</dd>
            </div>
            <div className="rounded-xl border border-border bg-card px-5 py-4">
              <dt className="text-eyebrow">condition</dt>
              <dd className="mt-2 font-serif text-xl">{piece.condition}</dd>
            </div>
          </dl>

          {/* Best match + circular score */}
          <div className="card-soft mt-6 flex items-center gap-8 p-7">
            <div className="relative h-32 w-32 shrink-0">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="var(--secondary)"
                  strokeWidth="5"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={R}
                  fill="none"
                  stroke="var(--rose-deep)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="font-serif text-3xl leading-none">{piece.confidence}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    / 100
                  </p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-eyebrow">best match</p>
              <p className="mt-2 font-serif text-4xl sm:text-5xl">
                <span className="italic text-rose-deep">{outcome.label}</span>
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                {explanation}
              </p>
            </div>
          </div>

          {/* Six thin score bars */}
          <div className="mt-10">
            <p className="text-eyebrow">the full picture</p>
            <div className="mt-5 space-y-3">
              {piece.scores.map((s) => (
                <div key={s.outcome} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 text-sm text-muted-foreground">
                    {OUTCOMES[s.outcome].label}
                  </span>
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span
                      className={`block h-full rounded-full transition-all duration-700 ${
                        s.outcome === piece.outcome ? "bg-rose-deep" : "bg-petal"
                      }`}
                      style={{ width: `${Math.round((s.score / max) * 100)}%` }}
                    />
                  </span>
                  <span className="w-8 text-right text-xs text-muted-foreground">{s.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Ideas */}
      <section className="mt-20">
        <h2 className="text-center text-3xl sm:text-4xl">what could it become?</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ideas.map((idea) => (
            <article key={idea.title} className="card-soft flex flex-col p-6">
              <p className="text-eyebrow">{idea.difficulty}</p>
              <h3 className="mt-3 font-serif text-2xl">{idea.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {idea.description}
              </p>
              <p className="mt-5 border-t border-border pt-4 text-xs tracking-wide text-muted-foreground">
                reuse potential{" "}
                <span className="ml-1 text-rose-deep">
                  {"●".repeat(idea.potential === "high" ? 3 : idea.potential === "medium" ? 2 : 1)}
                  <span className="text-border">
                    {"●".repeat(idea.potential === "high" ? 0 : idea.potential === "medium" ? 1 : 2)}
                  </span>
                </span>
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
        {saved ? (
          <Link
            to="/pieces"
            className="rounded-lg bg-primary px-7 py-3.5 text-sm lowercase tracking-wide text-primary-foreground shadow-soft transition-colors hover:bg-rose-deep"
          >
            saved — see my pieces ♡
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setSaved(true)}
            className="rounded-lg bg-primary px-7 py-3.5 text-sm lowercase tracking-wide text-primary-foreground shadow-soft transition-colors hover:bg-rose-deep"
          >
            save my piece ♡
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate({ to: "/analyze" })}
          className="rounded-lg border border-border bg-card px-7 py-3.5 text-sm lowercase tracking-wide text-foreground transition-colors hover:border-rose/60"
        >
          analyze another
        </button>
      </div>
    </div>
  );
}
