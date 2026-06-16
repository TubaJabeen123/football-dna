"use client";
import { useMemo } from "react";
import { Player } from "@/types";
import { generateCareerCurve } from "@/lib/utils";

interface CareerCurveProps {
  player: Player;
  accent: string;
}

export default function CareerCurve({ player, accent }: CareerCurveProps) {
  const ov      = Number(player.overall)   || 75;
  const pot     = Number(player.potential) || ov + 4;
  const age     = Number(player.age)       || 24;
  const peakAge = pot >= 90 ? 29 : pot >= 85 ? 28 : pot >= 80 ? 27 : 26;

  const pts = useMemo(() => generateCareerCurve(ov, pot, age), [ov, pot, age]);
  if (pts.length < 2) return null;

  // SVG dimensions
  const W = 440, H = 130, PL = 32, PR = 16, PT = 12, PB = 28;
  const cW = W - PL - PR, cH = H - PT - PB;
  const allR  = pts.map(p => p.rating);
  const minR  = Math.min(...allR) - 2;
  const maxR  = Math.max(...allR) + 2;
  const minA  = pts[0].age;
  const maxA  = pts[pts.length - 1].age;
  const tx    = (a: number) => PL + ((a - minA) / (maxA - minA)) * cW;
  const ty    = (r: number) => PT + (1 - (r - minR) / (maxR - minR)) * cH;

  const line  = pts.map((p, i) => `${i === 0 ? "M" : "L"}${tx(p.age)},${ty(p.rating)}`).join(" ");
  const area  = `${line} L${tx(maxA)},${ty(minR)} L${tx(minA)},${ty(minR)} Z`;
  const curPt = pts.find(p => p.age === age);
  const peakPt = pts.find(p => p.age === peakAge);
  const yTicks = [Math.ceil(minR / 5) * 5, Math.round(((minR + maxR) / 2) / 5) * 5, Math.floor(maxR / 5) * 5];
  const xTicks = pts.filter((_, i) => i % 4 === 0).map(p => p.age);

  return (
    <div>
      {/* Stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
        {[
          { l: "Current",     v: ov,              c: "var(--cyan)"  },
          { l: "Potential",   v: pot,              c: "var(--gold)"  },
          { l: "Peak age",    v: peakAge,          c: "var(--green)" },
          { l: "Peak rating", v: peakPt?.rating ?? ov, c: accent    },
        ].map(s => (
          <div key={s.l} style={{ background: "var(--card2)", borderRadius: 6, padding: "8px 6px", textAlign: "center" }}>
            <div style={{ fontSize: 9, color: "var(--text3)", letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" }}>{s.l}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* SVG chart */}
      <div style={{ overflowX: "auto" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 260, display: "block" }}>
          <path d={area} fill={`${accent}20`} />
          {yTicks.map(t => (
            <g key={t}>
              <line x1={PL} y1={ty(t)} x2={W - PR} y2={ty(t)} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3 3" />
              <text x={PL - 3} y={ty(t)} textAnchor="end" dominantBaseline="central" fill="var(--text3)" fontSize="8">{t}</text>
            </g>
          ))}
          {age !== peakAge && peakPt && (
            <line x1={tx(peakAge)} y1={PT} x2={tx(peakAge)} y2={H - PB} stroke="var(--gold)" strokeWidth="1" strokeDasharray="3 3" />
          )}
          {curPt && (
            <line x1={tx(age)} y1={PT} x2={tx(age)} y2={H - PB} stroke="var(--green)" strokeWidth="1" strokeDasharray="3 3" />
          )}
          <path d={line} fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" />
          {xTicks.map(a => (
            <text key={a} x={tx(a)} y={H - PB + 12} textAnchor="middle" fontSize="8"
              fill={a === age ? "var(--green)" : a === peakAge ? "var(--gold)" : "var(--text3)"}>
              {a}
            </text>
          ))}
          {curPt && (
            <>
              <circle cx={tx(curPt.age)} cy={ty(curPt.rating)} r="4" fill="var(--green)" />
              <text x={tx(curPt.age)} y={ty(curPt.rating) - 10} textAnchor="middle" fontSize="8" fill="var(--green)">Now</text>
            </>
          )}
          {peakPt && age !== peakAge && (
            <>
              <circle cx={tx(peakPt.age)} cy={ty(peakPt.rating)} r="4" fill="var(--gold)" />
              <text x={tx(peakPt.age)} y={ty(peakPt.rating) - 10} textAnchor="middle" fontSize="8" fill="var(--gold)">Peak</text>
            </>
          )}
          <line x1={PL} y1={H - PB} x2={W - PR} y2={H - PB} stroke="var(--border2)" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Analysis text */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <div style={{ background: "var(--card2)", borderRadius: 8, padding: 12, borderLeft: "3px solid var(--cyan)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--cyan)", letterSpacing: 1, marginBottom: 4 }}>CAREER PHASE</div>
          <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
            {age < peakAge
              ? `Still developing — peak expected at age ${peakAge} with a projected rating of ${peakPt?.rating}.`
              : age === peakAge
              ? `At peak age right now — this is the best version of this player.`
              : `Past their statistical peak. Experience can compensate for physical decline.`}
          </div>
        </div>
        <div style={{ background: "var(--card2)", borderRadius: 8, padding: 12, borderLeft: "3px solid var(--gold)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 4 }}>POTENTIAL GAP</div>
          <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>
            {pot > ov
              ? `${pot - ov} point gap between current (${ov}) and ceiling (${pot}). ${pot - ov >= 8 ? "Significant room to grow." : "Small further improvement expected."}`
              : `Already at or near their potential ceiling of ${pot}.`}
          </div>
        </div>
      </div>
      <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 8, textAlign: "center" }}>
        Projected curve based on FIFA 22 age, overall and potential · Illustrative only
      </div>
    </div>
  );
}