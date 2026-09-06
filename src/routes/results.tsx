import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { OUTCOMES, loadPieces, type Piece } from "@/lib/rewearie";
import { AnalyzeButton } from "@/components/site-chrome";

type Search = { id?: string | undefined };

export const Route = createFileRoute("/results")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    id: typeof search['id'] === "string" ? (search['id'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Its next life — rewearie ♡" },
      {
        name: "description",
        content:
          "Your piece's recommended next life, with the steps to take and the impact you keep out of landfill.",
      },
      { property: "og:title", content: "Its next life — rewearie ♡" },
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
  const [piece, setPiece] = useState<Piece | null>(null);
  const [ready, setReady] = useState(false);

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
          Analyze a piece and its recommendation will appear here.
        </p>
        <AnalyzeButton className="mt-8" />
      </div>
    );
  }

  const outcome = OUTCOMES[piece.outcome];
  const max = piece.scores[0]!.score || 1;

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="rise-in grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
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

        <div>
          <p className="text-eyebrow">recommendation</p>
          <h1 className="mt-4 text-5xl sm:text-6xl">
            <span className="italic text-rose-deep">{outcome.label}</span> this piece.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
            {outcome.blurb}
          </p>

          <div className="mt-8 flex flex-wrap gap-2 text-xs tracking-wide text-muted-foreground">
            {[piece.name, piece.category, piece.condition, piece.reason].map((chip) => (
              <span key={chip} className="rounded-lg bg-secondary px-3 py-1.5">
                {chip}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Stat label="confidence" value={`${piece.confidence}%`} />
            <Stat label="co₂ kept back" value={`${piece.co2} kg`} sage />
            <Stat label="water saved" value={`${piece.water.toLocaleString()} l`} sage />
          </div>

          <div className="card-soft mt-10 p-7">
            <p className="text-eyebrow">how to {outcome.verb}</p>
            <ol className="mt-5 space-y-4">
              {outcome.steps.map((step, i) => (
                <li key={step} className="flex gap-4 text-sm leading-relaxed">
                  <span className="font-serif text-lg text-petal">0{i + 1}</span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-10">
            <p className="text-eyebrow">other paths considered</p>
            <div className="mt-5 space-y-3">
              {piece.scores.slice(1, 4).map((s) => (
                <div key={s.outcome} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 text-sm text-muted-foreground">
                    {OUTCOMES[s.outcome].label}
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full bg-petal transition-all duration-700"
                      style={{ width: `${Math.round((s.score / max) * 100)}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <AnalyzeButton label="analyze another ♡" />
            <Link
              to="/pieces"
              className="text-sm tracking-wide text-muted-foreground underline decoration-border underline-offset-8 transition-colors hover:text-foreground"
            >
              see my pieces
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sage }: { label: string; value: string; sage?: boolean }) {
  return (
    <div
      className={`rounded-xl border border-border px-5 py-4 ${sage ? "bg-sage/25" : "bg-blush/60"}`}
    >
      <p className="text-eyebrow">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}
