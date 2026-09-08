import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { OUTCOMES, OUTCOME_ORDER, loadPieces, type Outcome, type Piece } from "@/lib/rewearie";
import { AnalyzeButton } from "@/components/site-chrome";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — rewearie ♡" },
      {
        name: "description",
        content:
          "See how your wardrobe choices add up: pieces analyzed, reworn, repaired, upcycled, donated and recycled.",
      },
      { property: "og:title", content: "Impact — rewearie ♡" },
      {
        property: "og:description",
        content: "Little choices. Longer lives. Your personal circularity score.",
      },
    ],
  }),
  component: Impact,
});

const CIRCULARITY_WEIGHT: Record<Outcome, number> = {
  rewear: 1,
  repair: 0.95,
  upcycle: 0.85,
  resell: 0.75,
  donate: 0.6,
  recycle: 0.4,
};

function Impact() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(loadPieces());
  }, []);

  const total = pieces.length;

  const counts = useMemo(
    () =>
      OUTCOME_ORDER.map((outcome) => ({
        outcome,
        count: pieces.filter((p) => p.outcome === outcome).length,
      })),
    [pieces]
  );

  const reworn = counts.find((c) => c.outcome === "rewear")?.count ?? 0;
  const repaired = counts.find((c) => c.outcome === "repair")?.count ?? 0;
  const upcycled = counts.find((c) => c.outcome === "upcycle")?.count ?? 0;
  const donated = counts.find((c) => c.outcome === "donate")?.count ?? 0;
  const recycled = counts.find((c) => c.outcome === "recycle")?.count ?? 0;

  const circularityScore = useMemo(() => {
    if (total === 0) return 0;
    const sum = pieces.reduce(
      (acc, piece) => acc + CIRCULARITY_WEIGHT[piece.outcome] * (piece.confidence / 100),
      0
    );
    return Math.round((sum / total) * 100);
  }, [pieces, total]);

  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-eyebrow">your impact</p>
        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
          little choices. <span className="italic text-rose-deep">longer lives.</span>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Every piece you give another life is one less piece forgotten. Here is what you have
          actually chosen to do.
        </p>
      </div>

      {total === 0 ? (
        <div className="mt-16 rounded-2xl border border-border bg-secondary/50 px-6 py-14 text-center sm:px-16">
          <h2 className="mx-auto max-w-xl text-2xl italic sm:text-3xl">
            No pieces analyzed yet.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
            Analyze your first piece and watch this space fill up with the choices that keep your
            clothes in use.
          </p>
          <AnalyzeButton className="mt-8 px-7 py-3.5 text-base" />
        </div>
      ) : (
        <>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Metric label="pieces analyzed" value={String(total)} />
            <Metric label="pieces reworn" value={String(reworn)} />
            <Metric label="pieces repaired" value={String(repaired)} />
            <Metric label="pieces upcycled" value={String(upcycled)} />
            <Metric label="pieces donated" value={String(donated)} />
            <Metric label="pieces recycled" value={String(recycled)} sage />
          </div>

          <section className="mt-20 grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-16">
            <div className="rounded-2xl border border-border bg-secondary/40 p-8 sm:p-10">
              <p className="text-eyebrow">your circularity score</p>
              <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:gap-12">
                <ScoreRing score={circularityScore} />
                <div className="text-center sm:text-left">
                  <p className="font-serif text-5xl">{circularityScore}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    out of 100 — based on the choices you have made and how confidently each piece
                    matched its best next life.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-sage/20 p-8 sm:p-10">
              <p className="text-eyebrow">why these choices matter</p>
              <ul className="mt-6 space-y-5 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Wear it again</span> — the simplest
                  way to lower demand for new clothes.
                </li>
                <li>
                  <span className="font-medium text-foreground">Repair it</span> — a small fix can
                  double the life of a garment you already own.
                </li>
                <li>
                  <span className="font-medium text-foreground">Transform it</span> — upcycling
                  keeps fibres useful when the original shape no longer works.
                </li>
                <li>
                  <span className="font-medium text-foreground">Pass it on</span> — donating or
                  reselling extends the life someone else will give it.
                </li>
              </ul>
            </div>
          </section>

          <section className="mt-20">
            <p className="text-eyebrow">how your decisions are distributed</p>
            <div className="mt-8 space-y-5">
              {counts.map((c) => (
                <div key={c.outcome} className="flex items-center gap-5">
                  <span className="w-24 shrink-0 text-sm text-muted-foreground">
                    {OUTCOMES[c.outcome].label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`block h-full rounded-full transition-all duration-700 ${
                        c.outcome === "recycle" ? "bg-sage" : "bg-petal"
                      }`}
                      style={{ width: `${(c.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right font-serif text-lg">{c.count}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-20 rounded-2xl border border-border bg-blush/60 px-6 py-14 text-center sm:px-16">
            <h2 className="mx-auto max-w-xl text-3xl italic sm:text-4xl">
              One more piece, one more little life.
            </h2>
            <AnalyzeButton className="mt-8 px-7 py-3.5 text-base" />
          </div>
        </>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  sage,
}: {
  label: string;
  value: string;
  sage?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-border p-7 ${
        sage ? "bg-sage/25" : "bg-blush/60"
      }`}
    >
      <p className="text-eyebrow">{label}</p>
      <p className="mt-3 font-serif text-4xl">{value}</p>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="var(--sage)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif text-3xl">{score}</span>
      </div>
    </div>
  );
}
