import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import { OUTCOMES, OUTCOME_ORDER, type Piece } from "@/lib/rewearie";
import { deletePiece, fetchPieces } from "@/lib/pieces-store";
import { useAuth } from "@/hooks/useAuth";
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
        content:
          "A quiet archive of the clothes you've given another little life.",
      },
    ],
  }),
  component: MyPieces,
});

/** Score label like "UPCYCLE" + "92 / 100" rendered elegantly on each card. */
function PieceCard({
  piece,
  onRemove,
}: {
  piece: Piece;
  onRemove: (id: string) => void;
}) {
  const top = piece.scores[0];
  const topScore = top?.score ?? piece.confidence;

  return (
    <article className="card-soft group mb-6 break-inside-avoid overflow-hidden">
      <Link to="/results" search={{ id: piece.id }} className="block">
        {piece.photo ? (
          <img
            src={piece.photo}
            alt={piece.name}
            loading="lazy"
            className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center bg-blush">
            <span className="font-serif text-xl italic text-rose-deep">
              {piece.category}
            </span>
          </div>
        )}
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl">{piece.name}</h2>
            <p className="mt-1 text-xs tracking-wide text-muted-foreground lowercase">
              {piece.condition.toLowerCase()}
            </p>
          </div>
          <button
            aria-label={`Remove ${piece.name}`}
            onClick={() => onRemove(piece.id)}
            className="shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-rose-deep"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <Link
          to="/results"
          search={{ id: piece.id }}
          className="mt-5 flex items-end justify-between border-t border-border/70 pt-4"
        >
          <div className="min-w-0">
            <p className="text-eyebrow">best match</p>
            <p className="mt-1 truncate font-serif text-2xl italic leading-none text-rose-deep">
              {OUTCOMES[piece.outcome].label}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="font-serif text-3xl leading-none">{topScore}</span>
            <span className="ml-1 text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              / 100
            </span>
          </p>
        </Link>
      </div>
    </article>
  );
}

function MyPieces() {
  const { user, ready: authReady } = useAuth();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<"all" | (typeof OUTCOME_ORDER)[number]>(
    "all",
  );

  useEffect(() => {
    let active = true;
    if (!authReady) return;
    if (!user) {
      setPieces([]);
      setReady(true);
      return;
    }
    void fetchPieces()
      .then((rows) => {
        if (active) setPieces(rows);
      })
      .catch(() => {
        if (active) setPieces([]);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [authReady, user]);

  const shown =
    filter === "all" ? pieces : pieces.filter((p) => p.outcome === filter);

  const handleRemove = (id: string) => {
    setPieces((prev) => prev.filter((p) => p.id !== id));
    void deletePiece(id).catch(() => undefined);
  };

  if (authReady && !user) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <p className="text-eyebrow">the archive</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">your pieces, kept safely ♡</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Sign in to keep every piece you analyze and revisit its next life whenever you like.
        </p>
        <Link
          to="/auth"
          search={{ next: "/pieces" }}
          className="mt-8 inline-block rounded-lg bg-primary px-7 py-3.5 text-sm lowercase tracking-wide text-primary-foreground shadow-soft transition-colors hover:bg-rose-deep"
        >
          sign in ♡
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <p className="text-eyebrow">the archive</p>
          <h1 className="mt-4 text-4xl sm:text-5xl">My pieces</h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Every piece you've reimagined, kept together — a curated archive of
            your clothes' next lives.
          </p>
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
            The first piece you analyze will be kept here, along with its
            recommendation.
          </p>
          <AnalyzeButton className="mt-8" />
        </div>
      )}

      {ready && pieces.length > 0 && shown.length === 0 && (
        <p className="mt-14 text-center text-sm italic text-muted-foreground">
          no pieces with this recommendation yet.
        </p>
      )}

      <div className="mt-10 columns-1 gap-6 sm:columns-2 lg:columns-3">
        {shown.map((p) => (
          <PieceCard key={p.id} piece={p} onRemove={handleRemove} />
        ))}
      </div>
    </div>
  );
}
