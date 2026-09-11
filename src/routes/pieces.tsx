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
    <article className="card-soft group mb-6 break-inside-avoid overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <Link to="/results" search={{ id: piece.id }} className="block overflow-hidden">
        {piece.photo ? (
          <img
            src={piece.photo}
            alt={piece.name}
            loading="lazy"
            className="w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid aspect-[4/5] w-full place-items-center bg-blush">
            <span className="px-6 text-center font-serif text-xl italic text-rose-deep">
              {piece.category}
            </span>
          </div>
        )}
      </Link>

      <div className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-[1.375rem] leading-snug">{piece.name}</h2>
            <p className="mt-1.5 text-[0.6875rem] uppercase tracking-[0.18em] text-muted-foreground">
              {piece.condition.toLowerCase()}
            </p>
          </div>
          <button
            aria-label={`Remove ${piece.name}`}
            onClick={() => onRemove(piece.id)}
            className="shrink-0 rounded-md p-2 text-muted-foreground opacity-0 transition-all duration-300 hover:bg-muted hover:text-rose-deep focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <Link
          to="/results"
          search={{ id: piece.id }}
          className="mt-6 flex items-end justify-between border-t border-border/70 pt-5"
        >
          <div className="min-w-0">
            <p className="text-eyebrow">best match</p>
            <p className="mt-1.5 truncate font-serif text-2xl italic leading-none text-rose-deep">
              {OUTCOMES[piece.outcome].label}
            </p>
          </div>
          <p className="shrink-0 text-right">
            <span className="font-serif text-[2rem] leading-none">{topScore}</span>
            <span className="ml-1 text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              / 100
            </span>
          </p>
        </Link>
      </div>
    </article>
  );
}

function CardSkeleton({ ratio }: { ratio: string }) {
  return (
    <div className="card-soft mb-6 break-inside-avoid overflow-hidden">
      <div className={`skeleton w-full rounded-none ${ratio}`} />
      <div className="space-y-3 p-6">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton mt-6 h-8 w-full" />
      </div>
    </div>
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
      <div className="rise-in mx-auto max-w-xl px-5 py-24 text-center sm:px-8 lg:py-32">
        <p className="text-eyebrow">the archive</p>
        <h1 className="mt-5 text-4xl sm:text-5xl">your pieces, kept safely ♡</h1>
        <p className="mx-auto mt-5 max-w-sm text-lede">
          Sign in to keep every piece you analyze and revisit its next life whenever you like.
        </p>
        <Link to="/auth" search={{ next: "/pieces" }} className="btn-base btn-primary mt-9">
          sign in ♡
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="rise-in flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-eyebrow">the archive</p>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl">my pieces</h1>
          <p className="mt-5 max-w-md text-lede">
            Every piece you've reimagined, kept together — a curated archive of your clothes' next
            lives.
          </p>
        </div>
        <AnalyzeButton className="shrink-0 self-start sm:self-auto" />
      </div>

      {ready && pieces.length > 0 && (
        <div className="fade-in-soft mt-12 flex flex-wrap gap-2.5 border-t border-border/60 pt-8">
          {(["all", ...OUTCOME_ORDER] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`chip ${filter === key ? "chip-on" : ""}`}
            >
              {key === "all" ? "all" : OUTCOMES[key].label.toLowerCase()}
            </button>
          ))}
        </div>
      )}

      {!ready && (
        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {["aspect-[4/5]", "aspect-[3/4]", "aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-square"].map(
            (ratio, i) => (
              <CardSkeleton key={i} ratio={ratio} />
            ),
          )}
        </div>
      )}

      {ready && pieces.length === 0 && (
        <div className="fade-in-soft mt-14 rounded-xl border border-dashed border-rose/40 bg-blush/35 px-6 py-24 text-center">
          <p className="font-serif text-3xl text-rose-deep">♡</p>
          <h2 className="mt-5 text-3xl italic sm:text-4xl">your archive is still empty.</h2>
          <p className="mx-auto mt-5 max-w-sm text-lede">
            The first piece you analyze will be kept here, along with its recommendation.
          </p>
          <AnalyzeButton className="mt-9" />
        </div>
      )}

      {ready && pieces.length > 0 && shown.length === 0 && (
        <p className="mt-20 text-center font-serif text-2xl italic text-muted-foreground">
          nothing here yet — try another filter.
        </p>
      )}

      {ready && shown.length > 0 && (
        <div className="fade-in-soft mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {shown.map((p) => (
            <PieceCard key={p.id} piece={p} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>

  );
}
