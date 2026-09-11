import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

import {
  OPEN_TO_OPTIONS,
  UI_CONDITIONS,
  UI_REASONS,
  analyse,
  impactFor,
  type Outcome,
  type Piece,
} from "@/lib/rewearie";
import { DRAFT_ID, saveDraft } from "@/lib/pieces-store";

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

const DEFAULT_CATEGORY = "Top / blouse";

function ProgressIndicator() {
  const steps = [
    { number: "01", label: "upload" },
    { number: "02", label: "tell us" },
    { number: "03", label: "reimagine" },
  ];
  return (
    <div className="flex items-center justify-center gap-3 text-xs tracking-widest uppercase sm:gap-6">
      {steps.map((step, i) => (
        <div key={step.number} className="flex items-center gap-3 sm:gap-6">
          <span className={`flex items-center gap-2 ${i === 1 ? "text-rose-deep" : "text-muted-foreground"}`}>
            <span className="font-serif text-lg">{step.number}</span>
            <span>{step.label}</span>
          </span>
          {i < steps.length - 1 && <span className="text-border">→</span>}
        </div>
      ))}
    </div>
  );
}

function ToggleButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={`chip ${selected ? "chip-on" : ""}`}>
      {children}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-eyebrow">{children}</h2>;
}


function Analyze() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [conditionLabel, setConditionLabel] = useState<string>(UI_CONDITIONS[0]!.label);
  const [reasonLabel, setReasonLabel] = useState<string>(UI_REASONS[0]!.label);
  const [openTo, setOpenTo] = useState<Outcome[]>([]);
  const [working, setWorking] = useState(false);

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  }

  function toggleOpenTo(outcome: Outcome) {
    setOpenTo((prev) => (prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) {
      fileRef.current?.click();
      return;
    }

    setWorking(true);
    const condition = UI_CONDITIONS.find((c) => c.label === conditionLabel)!.mapsTo;
    const reason = UI_REASONS.find((r) => r.label === reasonLabel)!.mapsTo;
    const result = analyse({ category: DEFAULT_CATEGORY, condition, reason, openTo });
    const impact = impactFor(DEFAULT_CATEGORY);
    const piece: Piece = {
      id: DRAFT_ID,
      name: DEFAULT_CATEGORY,
      category: DEFAULT_CATEGORY,
      condition,
      reason,
      photo,
      outcome: result.outcome,
      confidence: result.confidence,
      scores: result.scores,
      createdAt: Date.now(),
      co2: impact.co2,
      water: impact.water,
      openTo,
    };
    window.setTimeout(() => {
      saveDraft(piece);
      navigate({ to: "/results", search: { id: DRAFT_ID } });
    }, 1100);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl">what are we working with?</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          show us a piece that deserves another little chance.
        </p>
        <div className="mt-8">
          <ProgressIndicator />
        </div>
      </div>

      <form onSubmit={submit} className="mt-14 space-y-10">
        {/* Upload */}
        <section>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="group relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-rose/60 bg-muted/50 transition-colors hover:bg-muted"
          >
            {photo ? (
              <img src={photo} alt="The piece you uploaded" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-4 px-8 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-background shadow-soft">
                  <ImagePlus className="h-6 w-6 text-rose-deep" />
                </span>
                <span className="font-serif text-2xl">add a photo</span>
                <span className="max-w-xs text-xs leading-relaxed text-muted-foreground">
                  One clear image of a clothing item, laid flat in daylight on a plain surface.
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
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">photo uploaded</span>
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="text-xs tracking-wide text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                remove photo
              </button>
            </div>
          )}
        </section>

        {/* Condition */}
        <section>
          <SectionTitle>WHAT CONDITION IS IT IN?</SectionTitle>
          <div className="mt-5 flex flex-wrap gap-3">
            {UI_CONDITIONS.map((c) => (
              <ToggleButton
                key={c.label}
                selected={conditionLabel === c.label}
                onClick={() => setConditionLabel(c.label)}
              >
                <span className="mr-1.5 text-rose-deep">♡</span>
                {c.label}
              </ToggleButton>
            ))}
          </div>
        </section>

        {/* Reason */}
        <section>
          <SectionTitle>WHY DON&apos;T YOU WEAR IT ANYMORE?</SectionTitle>
          <div className="mt-5 flex flex-wrap gap-3">
            {UI_REASONS.map((r) => (
              <ToggleButton
                key={r.label}
                selected={reasonLabel === r.label}
                onClick={() => setReasonLabel(r.label)}
              >
                {r.label}
              </ToggleButton>
            ))}
          </div>
        </section>

        {/* Open to */}
        <section>
          <SectionTitle>WHAT ARE YOU OPEN TO?</SectionTitle>
          <div className="mt-5 flex flex-wrap gap-3">
            {OPEN_TO_OPTIONS.map((o) => (
              <ToggleButton
                key={o.label}
                selected={openTo.includes(o.outcome)}
                onClick={() => toggleOpenTo(o.outcome)}
              >
                {o.label}
              </ToggleButton>
            ))}
          </div>
        </section>

        <button
          type="submit"
          disabled={working}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base lowercase tracking-wide text-primary-foreground shadow-soft transition-all duration-300 hover:bg-rose-deep disabled:opacity-70"
        >
          {working && <Loader2 className="h-4 w-4 animate-spin" />}
          {working ? "reading the piece…" : "find its next life ♡"}
        </button>
      </form>
    </div>
  );
}
