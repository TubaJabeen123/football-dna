"use client";
import { KeyDuel } from "@/types";

interface DuelCardProps {
  duel: KeyDuel;
  teamANation: string;
  teamBNation: string;
  onClick: () => void;
}

export default function DuelCard({ duel, teamANation, teamBNation, onClick }: DuelCardProps) {
  const attWins = duel.advantage_pct >= 50;

  return (
    <div
      onClick={onClick}
      className="card"
      style={{ padding: "14px 16px", marginBottom: 8, cursor: "pointer", transition: "border-color 0.15s" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border2)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Player names + roles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cyan)" }}>{duel.attacker}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 0.5 }}>{teamANation} · {duel.attacker_role}</div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text3)", background: "var(--surface)", padding: "3px 8px", borderRadius: 4 }}>VS</span>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--red)" }}>{duel.defender}</div>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 0.5 }}>{teamBNation} · {duel.defender_role}</div>
        </div>
      </div>

      {/* Advantage bar */}
      <div style={{ height: 5, background: "var(--red-dim)", borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
        <div style={{ height: "100%", width: `${duel.advantage_pct}%`, background: "var(--cyan)", borderRadius: 3 }} />
      </div>

      {/* Insight + edge badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: "var(--text3)", fontStyle: "italic" }}>{duel.insight}</span>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: attWins ? "var(--cyan)" : "var(--red)",
          padding: "2px 7px",
          background: attWins ? "var(--cyan-dim)" : "var(--red-dim)",
          borderRadius: 4, flexShrink: 0, marginLeft: 8,
        }}>
          {duel.winner} edges →
        </span>
      </div>
    </div>
  );
}