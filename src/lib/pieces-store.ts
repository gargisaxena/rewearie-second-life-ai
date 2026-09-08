import { supabase } from "@/integrations/supabase/client";
import { OUTCOME_ORDER, impactFor, type Outcome, type Piece } from "@/lib/rewearie";

/* ------------------------------------------------------------------ */
/* Draft (the piece just analyzed, not saved to the archive yet)       */
/* ------------------------------------------------------------------ */

const DRAFT_KEY = "rewearie.draft.v1";
export const DRAFT_ID = "draft";

export function saveDraft(piece: Piece) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(DRAFT_KEY, JSON.stringify(piece));
  } catch {
    /* photo too large for session storage — the report still renders */
  }
}

export function loadDraft(): Piece | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as Piece) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(DRAFT_KEY);
}

/* ------------------------------------------------------------------ */
/* Cloud archive                                                       */
/* ------------------------------------------------------------------ */

const BUCKET = "piece-photos";

type PieceRow = {
  id: string;
  name: string;
  image_url: string | null;
  category: string | null;
  condition: string;
  reason_not_worn: string;
  preferences: string[];
  rewear_score: number;
  repair_score: number;
  upcycle_score: number;
  resell_score: number;
  donate_score: number;
  recycle_score: number;
  best_recommendation: string;
  confidence: number;
  created_at: string;
};

function scoresFromRow(row: PieceRow): { outcome: Outcome; score: number }[] {
  const map: Record<Outcome, number> = {
    rewear: row.rewear_score,
    repair: row.repair_score,
    upcycle: row.upcycle_score,
    resell: row.resell_score,
    donate: row.donate_score,
    recycle: row.recycle_score,
  };
  return OUTCOME_ORDER.map((outcome) => ({ outcome, score: map[outcome] })).sort(
    (a, b) => b.score - a.score,
  );
}

function rowToPiece(row: PieceRow, photo: string | null): Piece {
  const category = row.category ?? "";
  const impact = impactFor(category);
  return {
    id: row.id,
    name: row.name || category,
    category,
    condition: row.condition,
    reason: row.reason_not_worn,
    photo,
    outcome: row.best_recommendation as Outcome,
    confidence: row.confidence,
    scores: scoresFromRow(row),
    createdAt: new Date(row.created_at).getTime(),
    co2: impact.co2,
    water: impact.water,
    openTo: row.preferences as Outcome[],
  };
}

/** Signed URLs for private photo paths, keyed by path. */
async function signPhotos(paths: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  if (paths.length === 0) return out;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600);
  for (const item of data ?? []) {
    if (item.path && item.signedUrl) out[item.path] = item.signedUrl;
  }
  return out;
}

export async function fetchPieces(): Promise<Piece[]> {
  const { data, error } = await supabase
    .from("pieces")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const rows = (data ?? []) as unknown as PieceRow[];
  const signed = await signPhotos(
    rows.map((r) => r.image_url).filter((p): p is string => Boolean(p)),
  );
  return rows.map((r) => rowToPiece(r, r.image_url ? (signed[r.image_url] ?? null) : null));
}

export async function fetchPiece(id: string): Promise<Piece | null> {
  const { data, error } = await supabase.from("pieces").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const row = data as unknown as PieceRow;
  const signed = row.image_url ? await signPhotos([row.image_url]) : {};
  return rowToPiece(row, row.image_url ? (signed[row.image_url] ?? null) : null);
}

async function uploadPhoto(userId: string, dataUrl: string): Promise<string | null> {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = blob.type.split("/")[1] ?? "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: blob.type, upsert: false });
    if (error) throw error;
    return path;
  } catch {
    return null;
  }
}

/** Persist an analyzed piece to the signed-in user's archive. Returns its new id. */
export async function savePiece(piece: Piece, userId: string): Promise<string> {
  const imagePath = piece.photo ? await uploadPhoto(userId, piece.photo) : null;
  const score = (outcome: Outcome) =>
    piece.scores.find((s) => s.outcome === outcome)?.score ?? 0;

  const { data, error } = await supabase
    .from("pieces")
    .insert({
      user_id: userId,
      name: piece.name,
      image_url: imagePath,
      category: piece.category,
      condition: piece.condition,
      reason_not_worn: piece.reason,
      preferences: piece.openTo ?? [],
      rewear_score: score("rewear"),
      repair_score: score("repair"),
      upcycle_score: score("upcycle"),
      resell_score: score("resell"),
      donate_score: score("donate"),
      recycle_score: score("recycle"),
      best_recommendation: piece.outcome,
      confidence: piece.confidence,
    })
    .select("id")
    .single();

  if (error) throw error;
  return (data as { id: string }).id;
}

export async function deletePiece(id: string): Promise<void> {
  const { data } = await supabase.from("pieces").select("image_url").eq("id", id).maybeSingle();
  const path = (data as { image_url: string | null } | null)?.image_url;
  const { error } = await supabase.from("pieces").delete().eq("id", id);
  if (error) throw error;
  if (path) await supabase.storage.from(BUCKET).remove([path]);
}
