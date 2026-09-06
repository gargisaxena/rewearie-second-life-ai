import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Sparkles, Leaf } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import craftImage from "@/assets/craft.jpg";
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

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-10 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pt-24">
        <div className="rise-in">
          <p className="text-eyebrow">circular fashion, softly done</p>
          <h1 className="mt-6 text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            give your clothes
            <span className="block italic text-rose-deep">another little life.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-relaxed text-muted-foreground">
            rewearie reads the piece you're ready to let go of and gently suggests the
            kindest next step — rewear, repair, upcycle, resell, donate, or recycle.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <AnalyzeButton className="px-7 py-3.5 text-base" />
            <Link
              to="/impact"
              className="text-sm tracking-wide text-muted-foreground underline decoration-border underline-offset-8 transition-colors hover:text-foreground"
            >
              see your impact
            </Link>
          </div>
        </div>

        <div className="fade-in-soft relative">
          <div className="absolute -left-6 -top-6 hidden h-40 w-40 rounded-full bg-blush blur-2xl lg:block" />
          <img
            src={heroImage}
            alt="A folded stack of cream and blush clothing with a dried flower stem"
            width={1408}
            height={1760}
            className="relative aspect-[4/5] w-full rounded-2xl object-cover shadow-lift"
          />
          <div className="absolute -bottom-6 left-4 hidden rounded-xl border border-border bg-card px-5 py-4 shadow-soft sm:block">
            <p className="text-eyebrow">this week</p>
            <p className="mt-1 font-serif text-2xl">128 pieces rehomed</p>
          </div>
        </div>
      </section>

      {/* Six paths */}
      <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8">
        <div className="max-w-xl">
          <p className="text-eyebrow">six gentle endings</p>
          <h2 className="mt-4 text-4xl sm:text-5xl">
            Waste is rarely the only option.
          </h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OUTCOME_ORDER.map((key, i) => {
            const o = OUTCOMES[key];
            return (
              <article
                key={key}
                className="card-soft group p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="font-serif text-3xl text-petal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 text-2xl">{o.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{o.blurb}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <img
            src={craftImage}
            alt="Blush thread spools, buttons and gold scissors on cream linen"
            loading="lazy"
            width={1200}
            height={912}
            className="aspect-[4/3] w-full rounded-2xl object-cover shadow-soft"
          />
          <div>
            <p className="text-eyebrow">how it works</p>
            <h2 className="mt-4 text-4xl sm:text-5xl">Three quiet minutes.</h2>
            <ol className="mt-10 space-y-8">
              {[
                {
                  icon: Camera,
                  title: "Photograph the piece",
                  text: "Lay it flat in daylight and upload — that's all we need to start.",
                },
                {
                  icon: Sparkles,
                  title: "Tell us why it's resting",
                  text: "Condition, category, and the reason it stopped being worn.",
                },
                {
                  icon: Leaf,
                  title: "Receive its next life",
                  text: "A clear recommendation, the steps to take, and the impact you saved.",
                },
              ].map((step) => (
                <li key={step.title} className="flex gap-5">
                  <span className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blush">
                    <step.icon className="h-4 w-4 text-rose-deep" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-xl">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto mt-28 max-w-6xl px-5 sm:px-8">
        <div className="rounded-2xl border border-border bg-secondary/50 px-6 py-16 text-center sm:px-16">
          <p className="text-eyebrow">before you let it go</p>
          <h2 className="mx-auto mt-5 max-w-2xl text-4xl italic sm:text-5xl">
            Every piece deserves one more question.
          </h2>
          <AnalyzeButton className="mt-9 px-7 py-3.5 text-base" />
        </div>
      </section>
    </div>
  );
}
