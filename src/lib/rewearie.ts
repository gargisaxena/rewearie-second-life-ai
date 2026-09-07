export type Outcome =
  | "rewear"
  | "repair"
  | "upcycle"
  | "resell"
  | "donate"
  | "recycle";

export const OUTCOMES: Record<
  Outcome,
  { label: string; verb: string; blurb: string; steps: string[] }
> = {
  rewear: {
    label: "Rewear",
    verb: "wear it again",
    blurb:
      "This piece still has plenty of life. It just needs a fresh way of being styled.",
    steps: [
      "Hang it at the front of your wardrobe for two weeks",
      "Pair it with one piece you never wear it with",
      "Steam instead of washing to keep the fibres strong",
    ],
  },
  repair: {
    label: "Repair",
    verb: "mend it",
    blurb:
      "A small fix returns this piece to rotation — most repairs take under an hour.",
    steps: [
      "Photograph the damage in daylight before you begin",
      "Match thread to the darkest tone in the fabric",
      "Visible mending is welcome — a neat stitch reads as intention",
    ],
  },
  upcycle: {
    label: "Upcycle",
    verb: "remake it",
    blurb:
      "The fabric is beautiful even if the shape has stopped working for you.",
    steps: [
      "Crop, dye, or re-cut into a shape you reach for",
      "Save the buttons and trims for future repairs",
      "Try one low-risk change before committing to the full remake",
    ],
  },
  resell: {
    label: "Resell",
    verb: "pass it on",
    blurb:
      "In good condition and still in demand — someone is looking for exactly this.",
    steps: [
      "Shoot on a plain wall in soft daylight",
      "List measurements, fabric, and any flaws honestly",
      "Price around 40–60% of the original retail",
    ],
  },
  donate: {
    label: "Donate",
    verb: "gift it",
    blurb:
      "Wearable and useful, simply not worth the resale effort. Let it find a new home.",
    steps: [
      "Launder and fold before dropping off",
      "Choose a local shelter or charity that accepts your category",
      "Keep it out of unsorted bins so it stays wearable",
    ],
  },
  recycle: {
    label: "Recycle",
    verb: "return the fibres",
    blurb:
      "Beyond wearing — but the fibres still matter. Recycle it properly instead of binning it.",
    steps: [
      "Cut off zips and hardware if the programme asks",
      "Use a textile take-back point, never household waste",
      "Keep soft cottons as cleaning cloths first",
    ],
  },
};

export const OUTCOME_ORDER: Outcome[] = [
  "rewear",
  "repair",
  "upcycle",
  "resell",
  "donate",
  "recycle",
];

export type Piece = {
  id: string;
  name: string;
  category: string;
  condition: string;
  reason: string;
  photo: string | null;
  outcome: Outcome;
  confidence: number;
  scores: { outcome: Outcome; score: number }[];
  createdAt: number;
  co2: number;
  water: number;
  openTo?: Outcome[];
};

export const CATEGORIES = [
  "Top / blouse",
  "Dress",
  "Knitwear",
  "Denim",
  "Outerwear",
  "Trousers / skirt",
  "Shoes / accessory",
];

export const CONDITIONS = [
  "Like new",
  "Gently worn",
  "Small damage",
  "Visibly worn",
  "Beyond wearing",
];

export const REASONS = [
  "Doesn't fit anymore",
  "Bored of the styling",
  "Needs a small repair",
  "Fabric is tired",
  "Fell out of love with it",
];

export const UI_CONDITIONS = [
  { label: "almost new", mapsTo: "Like new" },
  { label: "good", mapsTo: "Gently worn" },
  { label: "slightly worn", mapsTo: "Visibly worn" },
  { label: "damaged", mapsTo: "Small damage" },
  { label: "heavily damaged", mapsTo: "Beyond wearing" },
] as const;

export const UI_REASONS = [
  { label: "doesn't fit", mapsTo: "Doesn't fit anymore" },
  { label: "damaged", mapsTo: "Needs a small repair" },
  { label: "not my style anymore", mapsTo: "Fell out of love with it" },
  { label: "rarely wear it", mapsTo: "Bored of the styling" },
  { label: "feels outdated", mapsTo: "Bored of the styling" },
  { label: "other", mapsTo: "Fell out of love with it" },
] as const;

export const OPEN_TO_OPTIONS: { label: string; outcome: Outcome }[] = [
  { label: "rewearing", outcome: "rewear" },
  { label: "repairing", outcome: "repair" },
  { label: "changing the design", outcome: "upcycle" },
  { label: "reselling", outcome: "resell" },
  { label: "donating", outcome: "donate" },
  { label: "recycling", outcome: "recycle" },
];

/**
 * Reusable recommendation algorithm.
 *
 * Deterministic weighted scoring: every outcome starts from a base weight
 * derived from the garment's condition (see CONDITION_BASE below), then the
 * user's reason and openness preferences adjust the totals. All scores are
 * clamped to 0–100 and sorted; the highest becomes the BEST MATCH.
 */

export type AnalyseInput = {
  category: string;
  condition: string;
  reason: string;
  openTo?: Outcome[];
};

export type AnalyseResult = {
  outcome: Outcome;
  confidence: number;
  scores: { outcome: Outcome; score: number }[];
};

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

// Base weights per condition — the core of the algorithm.
const CONDITION_BASE: Record<string, Record<Outcome, number>> = {
  // ALMOST NEW: high rewear, high resell, high donate, very low recycle
  "Like new": {
    rewear: 85,
    repair: 10,
    upcycle: 20,
    resell: 88,
    donate: 78,
    recycle: 5,
  },
  // GOOD: high rewear, high donate, medium-high resell, medium upcycle
  "Gently worn": {
    rewear: 85,
    repair: 20,
    upcycle: 50,
    resell: 68,
    donate: 80,
    recycle: 8,
  },
  // SLIGHTLY WORN: high repair, high upcycle, medium rewear, medium donate, low resell
  "Visibly worn": {
    rewear: 55,
    repair: 80,
    upcycle: 82,
    resell: 25,
    donate: 52,
    recycle: 30,
  },
  // DAMAGED: high repair, very high upcycle, medium recycle, low resell
  "Small damage": {
    rewear: 30,
    repair: 85,
    upcycle: 92,
    resell: 15,
    donate: 25,
    recycle: 50,
  },
  // HEAVILY DAMAGED: high recycle, high upcycle when material reusable, very low resell/donate
  "Beyond wearing": {
    rewear: 8,
    repair: 25,
    upcycle: 70,
    resell: 4,
    donate: 5,
    recycle: 90,
  },
};

// Categories whose material typically survives heavy damage — keeps upcycle
// viable even when the garment is beyond wearing.
const REUSABLE_MATERIAL_CATEGORIES = new Set([
  "Denim",
  "Outerwear",
  "Knitwear",
  "Trousers / skirt",
]);

// Reason adjustments — applied on top of the condition base.
const REASON_DELTA: Record<string, Partial<Record<Outcome, number>>> = {
  "Doesn't fit anymore": { resell: +12, donate: +10, upcycle: +6, rewear: -18 },
  "Bored of the styling": { rewear: +12, upcycle: +8 },
  "Needs a small repair": { repair: +15 },
  "Fabric is tired": { recycle: +10, upcycle: +8, resell: -12 },
  "Fell out of love with it": { resell: +8, donate: +10 },
};

// Weight applied to each action the user says they are open to.
const OPEN_TO_BOOST = 15;

export function analyse(input: AnalyseInput): AnalyseResult {
  const base =
    CONDITION_BASE[input.condition] ?? CONDITION_BASE["Gently worn"]!;

  const s: Record<Outcome, number> = { ...base };

  // Heavily damaged pieces in reusable-material categories favour upcycling.
  if (
    input.condition === "Beyond wearing" &&
    REUSABLE_MATERIAL_CATEGORIES.has(input.category)
  ) {
    s.upcycle += 12;
    s.recycle -= 8;
  }

  const deltas = REASON_DELTA[input.reason];
  if (deltas) {
    for (const [outcome, delta] of Object.entries(deltas) as [Outcome, number][]) {
      s[outcome] += delta;
    }
  }

  if (input.openTo) {
    for (const o of input.openTo) {
      s[o] += OPEN_TO_BOOST;
    }
  }

  const scores = OUTCOME_ORDER.map((outcome) => ({
    outcome,
    score: clamp(s[outcome]),
  })).sort((a, b) => b.score - a.score);

  const top = scores[0]!;
  const second = scores[1]!;
  // Confidence reflects how clearly the best match leads the runner-up.
  const lead = top.score - second.score;
  const confidence = clamp(46 + lead * 1.4 + top.score * 0.35);

  return { outcome: top.outcome, confidence, scores };
}

export function impactFor(category: string) {
  const table: Record<string, { co2: number; water: number }> = {
    "Top / blouse": { co2: 6.4, water: 2700 },
    Dress: { co2: 9.1, water: 3100 },
    Knitwear: { co2: 11.2, water: 2400 },
    Denim: { co2: 16.2, water: 7500 },
    Outerwear: { co2: 18.5, water: 4200 },
    "Trousers / skirt": { co2: 10.4, water: 3300 },
    "Shoes / accessory": { co2: 13.6, water: 1800 },
  };
  return table[category] ?? { co2: 8, water: 2500 };
}

// ---------------------------------------------------------------------------
// Results report: explanation + transformation ideas (deterministic)
// ---------------------------------------------------------------------------

/**
 * A short editorial explanation of the best match, derived only from the
 * outcome and the garment's condition — no randomness, no AI calls.
 */
export function explainResult(outcome: Outcome, condition: string): string {
  const worn =
    condition === "Visibly worn" || condition === "Small damage";
  const beyond = condition === "Beyond wearing";

  switch (outcome) {
    case "rewear":
      return "This piece is in beautiful shape — it simply needs a fresh styling idea to return to your everyday rotation.";
    case "repair":
      return worn
        ? "A small, honest mend is all that stands between this piece and many more years of wear."
        : "Its construction is still sound; one careful repair restores it completely.";
    case "upcycle":
      return beyond
        ? "Although this piece is beyond wearing, its material still has strong potential for transformation."
        : "Although this piece is worn, its material still has strong potential for transformation.";
    case "resell":
      return "In this condition it holds real value — someone is searching for exactly this piece right now.";
    case "donate":
      return "Wearable, useful, and ready to be loved again — it deserves a new home more than a listing fee.";
    case "recycle":
      return "Its wearing days are over, but the fibres themselves can still begin another life as new material.";
  }
}

export type Idea = {
  title: string;
  difficulty: "easy" | "moderate" | "a weekend";
  description: string;
  potential: "low" | "medium" | "high";
};

// ── damage → design ─────────────────────────────────────────────────────────

export type DamageDesign = {
  icon: string;
  title: string;
  difficulty: "easy" | "moderate" | "a weekend";
  description: string;
  potential: "low" | "medium" | "high";
  /** Editorial style direction, tailored to the garment category. */
  style: string;
};

/** True when the damage → design feature applies to a piece. */
export function isDamaged(condition: string): boolean {
  return condition === "Small damage" || condition === "Beyond wearing";
}

const DAMAGE_DIRECTIONS: Record<string, string> = {
  "Top / blouse": "quiet parisian — fine sashiko stitches in tonal thread, cuffs worn loose",
  Dress: "prairie-romantic — scattered floral embroidery drifting up from the hem",
  Knitwear: "wabi-sabi — contrasting darning wool worn as a deliberate, visible detail",
  Denim: "workwear-poetic — raw-edged indigo patches and visible white running stitch",
  Outerwear: "utility-elegant — oversized contrast pocket patching in waxed cotton",
  "Trousers / skirt": "studio-tailored — asymmetric panels and a clean cropped line",
  "Shoes / accessory": "atelier-detail — brass hardware and hand-finished edges",
};

/**
 * damage → design: creative transformations that turn the imperfect part of a
 * damaged garment into its best feature. Deterministic — shaped only by the
 * garment's category and damage level ("Small damage" | "Beyond wearing").
 */
export function damageDesigns(category: string, condition: string): DamageDesign[] {
  const beyond = condition === "Beyond wearing";
  const style =
    DAMAGE_DIRECTIONS[category] ??
    "quiet parisian — tonal visible mending worn with confidence";

  const designs: DamageDesign[] = [
    {
      icon: "✦",
      title: "visible mending",
      difficulty: "easy",
      description:
        "Darn the worn spot with a contrasting thread so the repair itself becomes the detail everyone asks about.",
      potential: "high",
      style,
    },
    {
      icon: "✿",
      title: "decorative embroidery",
      difficulty: "moderate",
      description:
        "Trace the damage with a fine line of stitching — a small constellation of thread that turns the flaw into a motif.",
      potential: "medium",
      style,
    },
    {
      icon: "◩",
      title: "contrast patchwork",
      difficulty: "moderate",
      description:
        "Layer a considered scrap of fabric over the worn area — raw edges visible, seams intentional.",
      potential: "high",
      style,
    },
    {
      icon: "✂",
      title: "crop and reshape",
      difficulty: "a weekend",
      description: beyond
        ? "Cut away what can no longer be saved and re-hem the rest into a shorter, sharper silhouette."
        : "Remove the damaged section entirely and re-hem the piece into a cropped, modern proportion.",
      potential: "medium",
      style,
    },
    {
      icon: "♡",
      title: "transform into an accessory",
      difficulty: "a weekend",
      description: beyond
        ? "The fabric is still beautiful — let it begin again as a tote, a pouch, or a set of scrunchies."
        : "Save the strongest panels and give them a second life as a small, everyday accessory.",
      potential: beyond ? "high" : "low",
      style,
    },
  ];

  // Heavily damaged pieces lead with transformation; lightly damaged lead with repair.
  return beyond
    ? [designs[4]!, designs[3]!, designs[2]!, designs[0]!, designs[1]!]
    : designs;
}

/** Elegant transformation ideas per best-match outcome. */
export const IDEAS: Record<Outcome, Idea[]> = {
  rewear: [
    {
      title: "the front-row reset",
      difficulty: "easy",
      description: "Hang it at the very front of your wardrobe for two weeks and style it first, not last.",
      potential: "high",
    },
    {
      title: "one unlikely pairing",
      difficulty: "easy",
      description: "Wear it with the single piece in your closet you have never combined it with.",
      potential: "medium",
    },
    {
      title: "layer it differently",
      difficulty: "moderate",
      description: "Under a knit, over a dress, or belted — a new silhouette makes it feel newly bought.",
      potential: "medium",
    },
  ],
  repair: [
    {
      title: "a visible mend",
      difficulty: "moderate",
      description: "A contrasting sashiko-style stitch turns the repair into the most interesting detail.",
      potential: "high",
    },
    {
      title: "replace the closure",
      difficulty: "easy",
      description: "New buttons or a fresh zip make the whole piece feel considered again.",
      potential: "medium",
    },
    {
      title: "a tailor's hour",
      difficulty: "easy",
      description: "A professional fix for seams and hems usually costs less than replacing the piece.",
      potential: "high",
    },
  ],
  upcycle: [
    {
      title: "denim tote",
      difficulty: "moderate",
      description: "The strongest panels become a structured everyday bag — seams become features.",
      potential: "high",
    },
    {
      title: "cropped shorts",
      difficulty: "easy",
      description: "A clean cut above the knee and a frayed hem give tired denim a summer silhouette.",
      potential: "high",
    },
    {
      title: "patchwork detail",
      difficulty: "moderate",
      description: "Offcuts become visible patches or a contrast pocket on another piece you love.",
      potential: "medium",
    },
    {
      title: "small accessory",
      difficulty: "a weekend",
      description: "Scraps turn into a headband, scrunchie, or key fob — nothing goes to waste.",
      potential: "medium",
    },
  ],
  resell: [
    {
      title: "the daylight listing",
      difficulty: "easy",
      description: "Shoot on a plain wall in soft morning light — honest photos double your enquiries.",
      potential: "high",
    },
    {
      title: "the full story",
      difficulty: "easy",
      description: "List measurements, fabric, and flaws plainly; detailed listings sell faster and higher.",
      potential: "high",
    },
    {
      title: "bundle & price",
      difficulty: "moderate",
      description: "Pair it with one similar piece at 40–60% of retail to move both at once.",
      potential: "medium",
    },
  ],
  donate: [
    {
      title: "the ready-to-wear drop",
      difficulty: "easy",
      description: "Laundered, folded, and delivered to a local shelter — wearable the same day.",
      potential: "high",
    },
    {
      title: "the right charity",
      difficulty: "easy",
      description: "Match the category to a specialist charity so it is used, not resold in bulk.",
      potential: "medium",
    },
    {
      title: "a seasonal gift",
      difficulty: "moderate",
      description: "Hold warm pieces for autumn drives where they are needed most.",
      potential: "medium",
    },
  ],
  recycle: [
    {
      title: "take-back point",
      difficulty: "easy",
      description: "Most high-street retailers accept any textiles — the fibres become insulation or new yarn.",
      potential: "high",
    },
    {
      title: "household cloths",
      difficulty: "easy",
      description: "Soft cottons live one more life as cleaning and polishing cloths before recycling.",
      potential: "medium",
    },
    {
      title: "strip the hardware",
      difficulty: "moderate",
      description: "Remove zips and buttons first — clean fibre streams are recycled far more effectively.",
      potential: "high",
    },
  ],
};

const KEY = "rewearie.pieces.v1";

export function loadPieces(): Piece[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Piece[]) : [];
  } catch {
    return [];
  }
}

export function savePieces(pieces: Piece[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(pieces));
  } catch {
    /* storage full — photos are large; ignore */
  }
}

export function addPiece(piece: Piece) {
  savePieces([piece, ...loadPieces()]);
}

export function removePiece(id: string) {
  savePieces(loadPieces().filter((p) => p.id !== id));
}
