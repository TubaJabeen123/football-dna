import { Player } from "@/types";

/** Returns a CSS variable string for a rating colour */
export function ratingColor(v: number): string {
  if (v >= 82) return "var(--elite)";
  if (v >= 73) return "var(--good)";
  if (v >= 62) return "var(--avg)";
  return "var(--poor)";
}

/** Returns a plain-English label for a rating */
export function ratingLabel(v: number): string {
  if (v >= 82) return "Elite";
  if (v >= 73) return "Good";
  if (v >= 62) return "Average";
  return "Poor";
}

/** Safely converts any value to a display number or "—" */
export function fmtStat(raw: any): string {
  if (raw === null || raw === undefined || raw === "") return "—";
  const n = Number(raw);
  if (isNaN(n) || n === 0) return "—";
  return String(n);
}

/** Derive playstyle tags from player attributes */
export function getPlaystyleTags(p: Player): { label: string; color: string }[] {
  const pa = Number(p.pace) || 0;
  const sh = Number(p.shooting) || 0;
  const ps = Number(p.passing) || 0;
  const dr = Number(p.dribbling) || 0;
  const df = Number(p.defending) || 0;
  const ph = Number(p.physic) || 0;
  const ov = Number(p.overall) || 0;
  const pot = Number(p.potential) || 0;
  const age = Number(p.age) || 25;

  const tags: { label: string; color: string }[] = [];

  if (sh >= 80 && pa >= 78)              tags.push({ label: "Poacher",          color: "#f87171" });
  if (sh >= 82 && ph >= 78 && pa < 80)   tags.push({ label: "Target Man",       color: "#f87171" });
  if (pa >= 88 && dr >= 80)              tags.push({ label: "Speed Demon",       color: "#fbbf24" });
  if (dr >= 85 && pa >= 80)              tags.push({ label: "Inverted Winger",   color: "#a78bfa" });
  if (ps >= 84 && dr >= 82 && sh >= 75)  tags.push({ label: "Creative Force",   color: "#38bdf8" });
  else if (ps >= 82 && dr >= 80 && sh >= 75) tags.push({ label: "Playmaker",    color: "#38bdf8" });
  if (df >= 75 && ph >= 78 && ps >= 72)  tags.push({ label: "Ball-Winner",      color: "#4ade80" });
  if (ps >= 80 && df >= 70 && ph >= 76)  tags.push({ label: "Box-to-Box",       color: "#4ade80" });
  if (df >= 82 && ph >= 78)              tags.push({ label: "Rock Solid",        color: "#4ade80" });
  if (ph >= 84)                          tags.push({ label: "Physical Beast",    color: "#fbbf24" });
  if (ov >= 88)                          tags.push({ label: "World Class",       color: "#fbbf24" });
  else if (ov >= 82)                     tags.push({ label: "Top Quality",       color: "#a78bfa" });
  if (pot - ov >= 8 && age <= 23)        tags.push({ label: "High Potential",   color: "#fbbf24" });

  return tags.slice(0, 3);
}

/** Build pitch position from player_positions string */
export function getPitchPosition(
  playerPositions: string,
  PITCH_POS: Record<string, { x: number; y: number }>
): { role: string; x: number; y: number } | null {
  const parts = (playerPositions || "").split(",").map(s => s.trim());
  for (const p of parts) {
    if (PITCH_POS[p]) return { role: p, ...PITCH_POS[p] };
  }
  return null;
}

/** Generate career progression curve points */
export function generateCareerCurve(
  overall: number,
  potential: number,
  currentAge: number
): { age: number; rating: number }[] {
  const peakAge = potential >= 90 ? 29 : potential >= 85 ? 28 : potential >= 80 ? 27 : 26;
  const startAge = Math.max(17, currentAge - 4);
  const points: { age: number; rating: number }[] = [];

  for (let a = startAge; a <= 37; a++) {
    let r: number;
    if (a <= peakAge) {
      const prog = (a - startAge) / Math.max(1, peakAge - startAge);
      r = (overall - 6) + (potential - (overall - 6)) * Math.pow(prog, 0.65);
    } else {
      r = potential - (a - peakAge) * (potential >= 88 ? 0.55 : 0.85);
    }
    points.push({ age: a, rating: Math.round(Math.min(99, Math.max(44, r))) });
  }
  return points;
}

/** Sigmoid function for win probability */
export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/** Recalculate win probability from a breakdown object */
export function recalcWinProb(bd: Record<string, number>): {
  winA: number; winB: number; draw: number;
} {
  const composite =
    (bd.attack_diff   || 0) * 0.30 +
    (bd.midfield_diff || 0) * 0.25 +
    (bd.defense_diff  || 0) * 0.25 +
    (bd.pace_diff     || 0) * 0.10 +
    (bd.physical_diff || 0) * 0.10;

  let winA = Math.round(sigmoid(composite / 10) * 1000) / 10;
  let winB = Math.round(sigmoid(-composite / 10) * 1000) / 10;
  const total = winA + winB;
  winA  = Math.round((winA  / total) * 80 * 10) / 10;
  winB  = Math.round((winB  / total) * 80 * 10) / 10;
  const draw = Math.round((100 - winA - winB) * 10) / 10;
  return { winA, winB, draw };
}