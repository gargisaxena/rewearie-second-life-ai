import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { OUTCOMES, OUTCOME_ORDER, loadPieces, removePiece, type Piece } from "@/lib/rewearie";
import { AnalyzeButton } from "@/components/site-chrome";

export const Route = createFileRoute("/pieces")({
  head: () => ({
    meta: [
      { title: "My Pieces — rewearie ♡" },
      {
        name: "description",
        content:
          "Your wardrobe archive: every piece you've analyzed and the next life rewearie suggested for it.",
      },
      { property: "og:title", content: "My Pieces — rewearie ♡" },
      {
        property: "og:description",
        content: "A quiet archive of the clothes you've given another little life.",
      },
    ],
  }),
  component: MyPieces;
});

function MyPieces() {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<"all" | (typeof OUTCOME_ORDER)[number]>("all");

  useEffect(() => {
    setPieces(loadPieces());
    setReady(true);
  }, []);

  const shown = filter === "all" ? pieces : pieces.filter((p) => p.outcome === filter);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <p className="text-eyebrow">the archive</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">My pieces</h1>
        </div>
        <AnalyzeButton className="shrink-0" />
      </div>

      {ready && pieces.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {(["all", ...OUTCOME_ORDER] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-lg border px-4 py-2 text-sm lowercase transition-all duration-300 ${
                filter === key
                  ? "border-rose bg-blush text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-rose/50"
              }`}
            >
              {key === "all" ? "all" : OUTCOMES[key].label.toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {ready && pieces.length === 0 && (
        <div className="mt-14 rounded-2xl border border-dashed border-rose/50 bg-muted/40 px-6 py-20 text-center">
          <h2 className="text-3xl italic">Your archive is still empty.</h2>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The first piece you analyze will be kept here, along with its recommendation.
          </p>
          <AnalyzeButton className="mt-8" />
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <article key={p.id} className="card-soft group overflow-hidden">
            <Link to="/results" search={{ id: p.id }} className="block">
              {p.photo ? (
                <img
                  src={p.photo}
                  alt={p.name}
                  loading="lazy"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="grid aspect-[4/5] w-full place-items-center bg-blush">
                  <span className="font-serif text-xl italic text-rose-deep">{p.category}</span>
                </div>
              )}
            </Link>
            <div className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <h2 className="truncate text-xl">{p.name}</h2>
                <p className="mt-1 text-xs tracking-wide text-muted-foreground">
                  {OUTCOMES[p.outcome].label} · {p.confidence}% · {p.condition.toLowerCase()}
                </p>
              </div>
              <button
                aria-label={`Remove ${p.name}`}
                onClick={() => {
                  removePiece(p.id);
                  setPieces(loadPieces());
                }}
                className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-rose-deep"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
