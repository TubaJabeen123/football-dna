"use client";
import { WinProbability } from "@/types";

interface WinProbabilityCardProps {
  winProbability: WinProbability;
  nameA: string;
  nameB: string;
  onExplain: () => void;
}

export default function WinProbabilityCard({ winProbability, nameA, nameB, onExplain }: WinProbabilityCardProps) {
  const wp = winProbability;

  return (
    <div className="card" style={{ padding: 20, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div className="section-label" style={{ margin: 0 }}>Squad Strength Prediction</div>
        <button
          onClick={onExplain}
          style={{
            padding: "4px 10px", background: "transparent",
            border: "1px solid var(--border2)", borderRadius: 6,
            color: "var(--text3)", fontSize: 11, cursor: "pointer",
            fontFamily: "DM Sans,sans-serif",
          }}
        >
          Why this prediction? →
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--cyan)", lineHeight: 1 }}>{wp.win_a}%</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{nameA}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "var(--text3)" }}>{wp.draw}%</div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>Draw</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: "var(--red)", lineHeight: 1 }}>{wp.win_b}%</div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{nameB}</div>
        </div>
      </div>

      <div className="prob-track" style={{ marginBottom: 10 }}>
        <div style={{ width: `${wp.win_a}%`, background: "var(--cyan)", transition: "width 1s" }} />
        <div style={{ width: `${wp.draw}%`, background: "var(--border2)" }} />
        <div style={{ width: `${wp.win_b}%`, background: "var(--red)", transition: "width 1s" }} />
      </div>

      <div style={{
        textAlign: "center", fontSize: 12, fontWeight: 600,
        color: "var(--gold)", padding: 8,
        background: "var(--gold-dim)", borderRadius: 6,
      }}>
        {wp.verdict}
      </div>
    </div>
  );
}