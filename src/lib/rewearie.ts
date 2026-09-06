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

export function analyse(input: {
  category: string;
  condition: string;
  reason: string;
  openTo?: Outcome[];
}): { outcome: Outcome; confidence: number; scores: { outcome: Outcome; score: number }[] } {
  const s: Record<Outcome, number> = {
    rewear: 12,
    repair: 10,
    upcycle: 10,
    resell: 10,
    donate: 10,
    recycle: 4,
  };

  switch (input.condition) {
    case "Like new":
      s.resell += 40;
      s.rewear += 26;
      s.donate += 14;
      break;
    case "Gently worn":
      s.rewear += 34;
      s.resell += 22;
      s.donate += 18;
      break;
    case "Small damage":
      s.repair += 46;
      s.upcycle += 20;
      break;
    case "Visibly worn":
      s.upcycle += 38;
      s.donate += 18;
      s.recycle += 16;
      break;
    case "Beyond wearing":
      s.recycle += 52;
      s.upcycle += 18;
      break;
  }

  switch (input.reason) {
    case "Doesn't fit anymore":
      s.resell += 22;
      s.donate += 16;
      s.upcycle += 10;
      s.rewear -= 12;
      break;
    case "Bored of the styling":
      s.rewear += 24;
      s.upcycle += 14;
      break;
    case "Needs a small repair":
      s.repair += 34;
      break;
    case "Fabric is tired":
      s.recycle += 20;
      s.upcycle += 16;
      s.resell -= 12;
      break;
    case "Fell out of love with it":
      s.resell += 18;
      s.donate += 16;
      break;
  }

  if (input.category === "Denim") {
    s.repair += 10;
    s.upcycle += 8;
  }
  if (input.category === "Knitwear") s.repair += 8;
  if (input.category === "Outerwear" || input.category === "Dress") s.resell += 10;
  if (input.category === "Shoes / accessory") s.recycle += 6;

  if (input.openTo) {
    for (const o of input.openTo) {
      s[o] += 18;
    }
  }

  const scores = OUTCOME_ORDER.map((o) => ({ outcome: o, score: Math.max(s[o], 0) })).sort(
    (a, b) => b.score - a.score,
  );
  const total = scores.reduce((sum, x) => sum + x.score, 0) || 1;
  const top = scores[0]!;
  const confidence = Math.round((top.score / total) * 100);
  return { outcome: top.outcome, confidence: Math.min(96, Math.max(46, confidence + 22)), scores };
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
