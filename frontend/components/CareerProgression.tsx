"use client";
import { useMemo } from "react";

function generateCurve(overall: number, potential: number, currentAge: number) {
  const startAge = Math.max(16, currentAge - 3);
  const peakAge  = potential >= 90 ? 29 : potential >= 85 ? 28 : potential >= 80 ? 27 : 26;
  const endAge   = 38;
  const points: { age: number; rating: number; phase: "growth"|"peak"|"decline"|"current" }[] = [];

  for (let age = startAge; age <= endAge; age++) {
    let rating: number;
    if (age <= peakAge) {
      const progress = (age - startAge) / Math.max(1, peakAge - startAge);
      const from = Math.max(overall - 6, potential - 16);
      rating = from + (potential - from) * Math.pow(progress, 0.65);
    } else {
      const yearsAfterPeak = age - peakAge;
      const declineRate = potential >= 88 ? 0.55 : potential >= 82 ? 0.80 : 1.0;
      rating = potential - yearsAfterPeak * declineRate;
    }
    rating = Math.round(Math.min(99, Math.max(44, rating)));
    const phase = age === currentAge ? "current" : age < peakAge ? "growth" : age === peakAge ? "peak" : "decline";
    points.push({ age, rating, phase });
  }
  return { points, peakAge };
}

const ratingColor = (v: number) =>
  v >= 82 ? "#4ade80" : v >= 73 ? "#38bdf8" : v >= 62 ? "#fbbf24" : "#f87171";

interface CareerProgressionProps { player: any }

export default function CareerProgression({ player }: CareerProgressionProps) {
  const overall   = Number(player?.overall)   || 75;
  const potential = Number(player?.potential) || overall + 4;
  const age       = Number(player?.age)       || 24;

  const { points, peakAge } = useMemo(
    () => generateCurve(overall, potential, age),
    [overall, potential, age]
  );

  if (points.length < 2) return null;

  // SVG chart dimensions
  const W = 480, H = 160, PAD = { t: 20, r: 30, b: 36, l: 36 };
  const chartW = W - PAD.l - PAD.r;
  const chartH = H - PAD.t - PAD.b;

  const allRatings = points.map(p => p.rating);
  const minR = Math.min(...allRatings) - 2;
  const maxR = Math.max(...allRatings) + 2;
  const ages  = points.map(p => p.age);
  const minA  = ages[0], maxA = ages[ages.length - 1];

  const toX = (a: number) => PAD.l + ((a - minA) / (maxA - minA)) * chartW;
  const toY = (r: number) => PAD.t + (1 - (r - minR) / (maxR - minR)) * chartH;

  // Build polyline path
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.age)},${toY(p.rating)}`).join(" ");
  // Area under curve
  const areaPath = `${linePath} L${toX(maxA)},${toY(minR)} L${toX(minA)},${toY(minR)} Z`;

  const currentPt  = points.find(p => p.phase === "current");
  const peakPt     = points.find(p => p.age === peakAge);

  // Y-axis ticks
  const yTicks = [Math.round(minR / 5) * 5, Math.round((minR + maxR) / 2 / 5) * 5, Math.round(maxR / 5) * 5];

  return (
    <div>
      {/* Stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "14px" }}>
        {[
          { label: "Current", value: overall, color: "#38bdf8" },
          { label: "Potential", value: potential, color: "#fbbf24" },
          { label: "Peak age", value: peakAge, color: "#4ade80" },
          { label: "Peak OVR", value: peakPt?.rating ?? "—", color: "#a78bfa" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--card2)", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
            <div style={{ fontSize: "9px", color: "var(--text3)", letterSpacing: "1px", marginBottom: "4px", textTransform: "uppercase" }}>{s.label}</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* SVG chart — no recharts dependency */}
      <div style={{ overflowX: "auto" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: "280px" }}>
          {/* Area fill */}
          <path d={areaPath} fill="#38bdf833" />

          {/* Gridlines */}
          {yTicks.map(tick => (
            <g key={tick}>
              <line
                x1={PAD.l} y1={toY(tick)} x2={W - PAD.r} y2={toY(tick)}
                stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3"
              />
              <text x={PAD.l - 4} y={toY(tick)} textAnchor="end" dominantBaseline="central"
                fill="var(--text3)" fontSize="9">{tick}</text>
            </g>
          ))}

          {/* Current age vertical line */}
          {currentPt && (
            <line x1={toX(age)} y1={PAD.t} x2={toX(age)} y2={H - PAD.b}
              stroke="#4ade80" strokeWidth="1" strokeDasharray="4 3" />
          )}

          {/* Peak age vertical line */}
          {peakPt && age !== peakAge && (
            <line x1={toX(peakAge)} y1={PAD.t} x2={toX(peakAge)} y2={H - PAD.b}
              stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 3" />
          )}

          {/* Line */}
          <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" />

          {/* Dots for current and peak */}
          {currentPt && (
            <>
              <circle cx={toX(currentPt.age)} cy={toY(currentPt.rating)} r="5" fill="#4ade80" />
              <circle cx={toX(currentPt.age)} cy={toY(currentPt.rating)} r="8" fill="none" stroke="#4ade80" strokeWidth="1" opacity="0.4" />
              <text x={toX(currentPt.age)} y={toY(currentPt.rating) - 12} textAnchor="middle" fontSize="9" fill="#4ade80">Now</text>
            </>
          )}
          {peakPt && age !== peakAge && (
            <>
              <circle cx={toX(peakPt.age)} cy={toY(peakPt.rating)} r="4" fill="#fbbf24" />
              <text x={toX(peakPt.age)} y={toY(peakPt.rating) - 10} textAnchor="middle" fontSize="9" fill="#fbbf24">Peak</text>
            </>
          )}

          {/* X-axis age labels */}
          {points.filter((_, i) => i % 3 === 0 || points[i].age === age || points[i].age === peakAge).map(p => (
            <text key={p.age} x={toX(p.age)} y={H - PAD.b + 14} textAnchor="middle"
              fontSize="9" fill={p.age === age ? "#4ade80" : p.age === peakAge ? "#fbbf24" : "var(--text3)"}
              fontWeight={p.age === age || p.age === peakAge ? 600 : 400}>
              {p.age}
            </text>
          ))}

          {/* X axis line */}
          <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke="var(--border2)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Phase analysis */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "12px" }}>
        <div style={{ background: "var(--card2)", borderRadius: "8px", padding: "12px", borderLeft: "3px solid #38bdf8" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#38bdf8", letterSpacing: "1px", marginBottom: "4px" }}>DEVELOPMENT</div>
          <div style={{ fontSize: "12px", color: "var(--text2)", lineHeight: "1.6" }}>
            {age < peakAge
              ? `${player?.short_name || "This player"} is still developing. Peak expected at age ${peakAge} with an estimated rating of ${peakPt?.rating}.`
              : age === peakAge
              ? `${player?.short_name || "This player"} is currently at peak age. This is when they should perform at their very best.`
              : `${player?.short_name || "This player"} has passed their statistical peak. Form may still vary season to season.`}
          </div>
        </div>
        <div style={{ background: "var(--card2)", borderRadius: "8px", padding: "12px", borderLeft: "3px solid #fbbf24" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#fbbf24", letterSpacing: "1px", marginBottom: "4px" }}>POTENTIAL GAP</div>
          <div style={{ fontSize: "12px", color: "var(--text2)", lineHeight: "1.6" }}>
            {potential > overall
              ? `${potential - overall} point gap between current (${overall}) and ceiling (${potential}). ${potential - overall >= 8 ? "Significant room to grow." : "Small improvement expected."}`
              : `Already at or near potential ceiling of ${potential}.`}
          </div>
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "var(--text3)", marginTop: "10px", textAlign: "center" }}>
        Projected curve based on FIFA 22 age, overall, and potential ratings · Illustrative only
      </div>
    </div>
  );
}