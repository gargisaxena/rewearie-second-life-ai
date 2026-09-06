import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { OUTCOMES, OUTCOME_ORDER, loadPieces, type Piece } from "@/lib/rewearie";
import { AnalyzeButton } from "@/components/site-chrome";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — rewearie ♡" },
      {
        name: "description",
        content:
          "See the carbon, water and landfill weight you keep out of the system each time a piece gets another life.",
      },
      { property: "og:title", content: "Impact — rewearie ♡" },
      {
        property: "og:description",
        content: "The quiet arithmetic of keeping clothes in circulation.",
      },
    ],
  }),
  component: Impact,
});

function Impact() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    setPieces(loadPieces());
  }, []);

  const co2 = pieces.reduce((s, p) => s + p.co2, 0);
  const water = pieces.reduce((s, p) => s + p.water, 0);
  const saved = pieces.filter((p) => p.outcome !== "recycle").length;
  const counts = OUTCOME_ORDER.map((o) => ({
    outcome: o,
    count: pieces.filter((p) => p.outcome === o).length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="max-w-2xl">
        <p className="text-eyebrow">your quiet arithmetic</p>
        <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
          Small choices, <span className="italic text-rose-deep">measured softly.</span>
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Estimates based on average production footprints per garment category. Every piece kept
          in circulation is a piece that never had to be made again.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="pieces analyzed" value={String(pieces.length)} />
        <Metric label="kept in circulation" value={String(saved)} />
        <Metric label="co₂ avoided" value={`${co2.toFixed(1)} kg`} sage />
        <Metric label="water saved" value={`${Math.round(water).toLocaleString()} l`} sage />
      </div>

      <section className="mt-20 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="text-eyebrow">where your pieces went</p>
          <div className="mt-8 space-y-5">
            {counts.map((c) => (
              <div key={c.outcome} className="flex items-center gap-5">
                <span className="w-24 shrink-0 text-sm text-muted-foreground">
                  {OUTCOMES[c.outcome].label}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full rounded-full bg-petal transition-all duration-700"
                    style={{ width: `${(c.count / max) * 100}%` }}
                  />
                </span>
                <span className="w-6 shrink-0 text-right font-serif text-lg">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-sage/25 p-8">
          <p className="text-eyebrow">why it matters</p>
          <ul className="mt-6 space-y-6">
            {[
              ["92 million tonnes", "of textiles are discarded globally every year."],
              ["9 months", "of extra wear cuts a garment's footprint by around 20–30%."],
              ["1%", "of clothing is currently recycled into new clothing."],
            ].map(([figure, text]) => (
              <li key={figure}>
                <p className="font-serif text-3xl">{figure}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-20 rounded-2xl border border-border bg-secondary/50 px-6 py-14 text-center sm:px-16">
        <h2 className="mx-auto max-w-xl text-3xl italic sm:text-4xl">
          One more piece, one more little life.
        </h2>
        <AnalyzeButton className="mt-8 px-7 py-3.5 text-base" />
      </div>
    </div>
  );
}

function Metric({ label, value, sage }: { label: string; value: string; sage?: boolean }) {
  return (
    <div className={`rounded-xl border border-border p-7 ${sage ? "bg-sage/25" : "bg-blush/60"}`}>
      <p className="text-eyebrow">{label}</p>
      <p className="mt-3 font-serif text-4xl">{value}</p>
    </div>
  );
}
