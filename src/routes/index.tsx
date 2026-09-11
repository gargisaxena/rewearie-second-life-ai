import { createFileRoute, Link } from "@tanstack/react-router";

import { AnalyzeButton } from "@/components/site-chrome";
import { OUTCOME_ORDER, OUTCOMES } from "@/lib/rewearie";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "rewearie ♡ — give your clothes another little life" },
      {
        name: "description",
        content:
          "Upload a piece you no longer wear and rewearie suggests whether to rewear, repair, upcycle, resell, donate or recycle it.",
      },
      { property: "og:title", content: "rewearie ♡ — circular fashion, softly done" },
      {
        property: "og:description",
        content: "give your clothes another little life.",
      },
    ],
  }),
  component: Home,
});

const OUTCOME_ICON: Record<string, string> = {
  rewear: "♡",
  repair: "✦",
  upcycle: "✿",
  resell: "↗",
  donate: "♡",
  recycle: "♻",
};

const STEPS = [
  { number: "01", title: "upload your piece", description: "Lay it flat in daylight and upload a photo." },
  { number: "02", title: "tell us its story", description: "Share its condition, category, and why it stopped being worn." },
  { number: "03", title: "discover its next life", description: "Get a clear recommendation and the steps to take." },
  { number: "04", title: "keep track of your impact", description: "See the water and carbon you save with every piece." },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-md">
      {/* Soft ambient field */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-petal/30 via-blush/20 to-sage/10" />

      {/* Large fabric card */}
      <div
        className="absolute left-[6%] top-[10%] h-[66%] w-[72%] rotate-[-5deg] rounded-3xl border border-border/60 shadow-lift"
        style={{
          background: "linear-gradient(145deg, var(--beige), var(--background))",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
          style={{
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(255,255,255,0.35) 14px, rgba(255,255,255,0.35) 15px)",
          }}
        />
      </div>

      {/* Smaller blush card */}
      <div
        className="absolute right-[4%] bottom-[12%] h-[48%] w-[58%] rotate-[7deg] rounded-3xl border border-border/60 shadow-soft"
        style={{
          background: "linear-gradient(145deg, var(--blush), var(--petal))",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
          style={{
            background:
              "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.3) 12px, rgba(255,255,255,0.3) 13px)",
          }}
        />
      </div>

      {/* Sage circle accent */}
      <div
        className="absolute right-[16%] top-[6%] h-24 w-24 rounded-full shadow-soft blur-[2px]"
        style={{ background: "linear-gradient(145deg, var(--sage), transparent)" }}
      />

      {/* Rose ribbon */}
      <div
        className="absolute left-[14%] bottom-[16%] h-9 w-[48%] rotate-[-2deg] rounded-full blur-[1px]"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--rose) 20%, transparent), color-mix(in oklab, var(--petal) 40%, transparent), color-mix(in oklab, var(--rose) 20%, transparent))",
        }}
      />

      {/* Dot details */}
      <div className="absolute right-[10%] top-[34%] h-2.5 w-2.5 rounded-full bg-rose-deep/30" />
      <div className="absolute left-[22%] top-[7%] h-2 w-2 rounded-full bg-sage/50" />
    </div>
  );
}

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-10 pt-14 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:gap-16 lg:pt-24">
        <div className="rise-in order-2 lg:order-1">
          <p className="text-eyebrow">A LITTLE MORE LIFE FOR YOUR WARDROBE</p>
          <h1 className="mt-7 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            before you throw it away,
            <span className="block italic text-rose-deep">let's imagine again.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
            Upload a piece you no longer wear and discover its next possible life.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <AnalyzeButton />
            <a
              href="#how-it-works"
              className="text-[0.8125rem] lowercase tracking-[0.1em] text-muted-foreground underline decoration-border underline-offset-8 transition-colors hover:text-rose-deep"
            >
              how it works
            </a>
          </div>

        </div>

        <div className="fade-in-soft order-1 lg:order-2">
          <HeroVisual />
        </div>
      </section>

      {/* Six paths */}
      <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8">
        <div className="max-w-xl">
          <p className="text-eyebrow">one piece. so many possibilities.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOME_ORDER.map((key) => {
            const o = OUTCOMES[key];
            return (
              <article
                key={key}
                className="card-soft group p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="font-serif text-3xl text-rose-deep">{OUTCOME_ICON[key]}</span>
                <h3 className="mt-5 text-2xl">{o.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{o.blurb}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <div className="max-w-xl">
          <p className="text-eyebrow">how rewearie works</p>
        </div>
        <ol className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.number} className="card-soft p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
              <span className="font-serif text-4xl text-rose-deep">{step.number}</span>
              <h3 className="mt-5 text-xl">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="mx-auto mt-28 max-w-6xl px-5 pb-10 sm:px-8">
        <div className="rounded-xl border border-border bg-secondary/45 px-6 py-20 text-center sm:px-16">
          <p className="text-eyebrow">before you let it go</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl italic sm:text-5xl">
            your wardrobe has another story to tell.
          </h2>
          <AnalyzeButton className="mt-9" label="give it another life ♡" />

        </div>
      </section>
    </div>
  );
}
