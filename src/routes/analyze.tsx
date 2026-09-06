import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import {
  CATEGORIES,
  CONDITIONS,
  REASONS,
  addPiece,
  analyse,
  impactFor,
  type Piece,
} from "@/lib/rewearie";

export const Route = createFileRoute("/analyze")({
  head: () => ({
    meta: [
      { title: "Analyze a piece — rewearie ♡" },
      {
        name: "description",
        content:
          "Upload a photo of a garment you no longer wear and let rewearie suggest its kindest next life.",
      },
      { property: "og:title", content: "Analyze a piece — rewearie ♡" },
      {
        property: "og:description",
        content: "Upload a garment and receive a considered next step in three minutes.",
      },
    ],
  }),
  component: Analyze,
});

const fieldClass =
  "w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-rose";

function Analyze() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]!);
  const [condition, setCondition] = useState(CONDITIONS[1]!);
  const [reason, setReason] = useState(REASONS[0]!);
  const [working, setWorking] = useState(false);

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setWorking(true);
    const result = analyse({ category, condition, reason });
    const impact = impactFor(category);
    const piece: Piece = {
      id: `${Date.now()}`,
      name: name.trim() || category,
      category,
      condition,
      reason,
      photo,
      outcome: result.outcome,
      confidence: result.confidence,
      scores: result.scores,
      createdAt: Date.now(),
      co2: impact.co2,
      water: impact.water,
    };
    window.setTimeout(() => {
      addPiece(piece);
      navigate({ to: "/results", search: { id: piece.id } });
    }, 1100);
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="max-w-xl">
        <p className="text-eyebrow">step one</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">Tell us about the piece.</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          A photo and three small answers. Nothing leaves your device.
        </p>
      </div>

      <form onSubmit={submit} className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-rose/60 bg-muted/50 transition-colors hover:bg-muted"
          >
            {photo ? (
              <img src={photo} alt="The piece you uploaded" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-3 px-8 text-center">
                <ImagePlus className="h-6 w-6 text-rose-deep" />
                <span className="font-serif text-xl">add a photo</span>
                <span className="text-xs leading-relaxed text-muted-foreground">
                  Flat, in daylight, on a plain surface
                </span>
              </span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {photo && (
            <button
              type="button"
              onClick={() => setPhoto(null)}
              className="mt-3 text-xs tracking-wide text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              remove photo
            </button>
          )}
        </div>

        <div className="card-soft space-y-7 p-7 sm:p-9">
          <div>
            <label htmlFor="name" className="text-eyebrow">
              what is it
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="linen shirt, second-hand"
              className={`mt-3 ${fieldClass}`}
            />
          </div>

          <div>
            <label htmlFor="category" className="text-eyebrow">
              category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`mt-3 ${fieldClass}`}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <fieldset>
            <legend className="text-eyebrow">condition</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {CONDITIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCondition(c)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-all duration-300 ${
                    condition === c
                      ? "border-rose bg-blush text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-rose/50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-eyebrow">why has it stopped being worn</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`rounded-lg border px-4 py-2 text-sm transition-all duration-300 ${
                    reason === r
                      ? "border-rose bg-blush text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-rose/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={working}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 text-sm lowercase tracking-wide text-primary-foreground shadow-soft transition-all duration-300 hover:bg-rose-deep disabled:opacity-70"
          >
            {working && <Loader2 className="h-4 w-4 animate-spin" />}
            {working ? "reading the piece…" : "find its next life ♡"}
          </button>
        </div>
      </form>
    </div>
  );
}
