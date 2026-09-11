import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  IDEAS,
  OUTCOMES,
  damageDesigns,
  explainResult,
  isDamaged,
  type Piece,
} from "@/lib/rewearie";
import { DRAFT_ID, clearDraft, fetchPiece, loadDraft, savePiece } from "@/lib/pieces-store";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const [piece, setPiece] = useState<Piece | null>(null);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDraft = !id || id === DRAFT_ID;

  useEffect(() => {
    let active = true;
    setReady(false);
    setSaved(false);

    async function load() {
      if (isDraft) {
        if (!active) return;
        setPiece(loadDraft());
        setReady(true);
        return;
      }
      try {
        const found = await fetchPiece(id!);
        if (!active) return;
        setPiece(found);
        setSaved(Boolean(found));
      } catch {
        if (active) setPiece(null);
      } finally {
        if (active) setReady(true);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [id, isDraft]);

  async function handleSave() {
    if (!piece) return;
    if (!user) {
      navigate({ to: "/auth", search: { next: "/results" } });
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const newId = await savePiece(piece, user.id);
      clearDraft();
      setSaved(true);
      navigate({ to: "/results", search: { id: newId }, replace: true });
    } catch {
      setSaveError("We couldn't save this piece just now. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="mx-auto h-9 w-72 max-w-full skeleton" />
        <div className="mt-16 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="skeleton aspect-[4/5] w-full rounded-xl" />
          <div className="space-y-5">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-24 w-full" />
            <div className="skeleton h-40 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!piece) {
    return (
      <div className="rise-in mx-auto max-w-xl px-5 py-24 text-center sm:px-8 lg:py-32">
        <p className="text-eyebrow">nothing here yet</p>
        <h1 className="mt-5 text-4xl sm:text-5xl">no report to read.</h1>
        <p className="mx-auto mt-5 max-w-sm text-lede">
          Analyze a piece and its personal report will appear here.
        </p>
        <Link to="/analyze" className="btn-base btn-primary mt-9">
          analyze a piece ♡
        </Link>
      </div>
    );
  }


  const outcome = OUTCOMES[piece.outcome];
  
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
                      style={{ width: `${s.score}%` }}
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

      {/* damage → design */}
      {isDamaged(piece.condition) && (
        <section className="mt-24">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-blush/60 px-6 py-12 sm:px-12 sm:py-16">
            {/* soft editorial backdrop shapes */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-70"
              style={{ background: "radial-gradient(circle, var(--petal), transparent 70%)" }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full opacity-60"
              style={{ background: "radial-gradient(circle, var(--sage), transparent 70%)" }}
            />

            <div className="relative text-center">
              <p className="text-eyebrow">damage → design</p>
              <h2 className="mx-auto mt-4 max-w-xl text-3xl sm:text-4xl">
                what if the imperfect part became the{" "}
                <span className="italic text-rose-deep">best part?</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Instead of hiding the damage, these transformations make it the detail the whole
                piece is remembered for.
              </p>
            </div>

            <div className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {damageDesigns(piece.category, piece.condition).map((d) => (
                <article
                  key={d.title}
                  className="card-soft flex flex-col p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <p className="font-serif text-2xl text-rose-deep">{d.icon}</p>
                  <h3 className="mt-3 font-serif text-xl leading-snug">{d.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {d.description}
                  </p>
                  <dl className="mt-5 space-y-2 border-t border-border pt-4 text-[11px] tracking-wide">
                    <div className="flex items-center justify-between">
                      <dt className="uppercase text-muted-foreground">difficulty</dt>
                      <dd className="text-foreground">{d.difficulty}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="uppercase text-muted-foreground">potential</dt>
                      <dd className="text-rose-deep">
                        {"●".repeat(d.potential === "high" ? 3 : d.potential === "medium" ? 2 : 1)}
                        <span className="text-border">
                          {"●".repeat(d.potential === "high" ? 0 : d.potential === "medium" ? 1 : 2)}
                        </span>
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 border-t border-border pt-3 text-[11px] italic leading-relaxed text-muted-foreground">
                    {d.style}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="mt-20 flex flex-col items-stretch justify-center gap-3 border-t border-border/60 pt-12 sm:flex-row sm:items-center sm:gap-4">
        {saved ? (
          <Link to="/pieces" className="btn-base btn-primary">
            saved — see my pieces ♡
          </Link>
        ) : (
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="btn-base btn-primary"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "saving…" : "save my piece ♡"}
          </button>
        )}
        <button
          type="button"
          onClick={() => navigate({ to: "/analyze" })}
          className="btn-base btn-quiet"
        >
          analyze another
        </button>
        {saveError && (
          <p className="w-full text-center text-xs italic text-rose-deep">{saveError}</p>
        )}
      </div>

    </div>
  );
}
