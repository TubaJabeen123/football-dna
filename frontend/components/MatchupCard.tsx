"use client";

interface MatchupCardProps {
  duel: any;
  teamANation: string;
}

export default function MatchupCard({ duel, teamANation }: MatchupCardProps) {
  const attackerWins = duel.advantage_pct >= 50;

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "10px",
      padding: "16px 20px",
      marginBottom: "10px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
        {/* Attacker */}
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{ fontSize: "14px", color: "#00e5ff", fontWeight: 600 }}>{duel.attacker}</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "1px" }}>{duel.attacker_role}</div>
        </div>

        {/* VS badge */}
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "14px", color: "var(--muted)",
          background: "var(--surface)",
          padding: "4px 10px", borderRadius: "4px",
        }}>
          VS
        </div>

        {/* Defender */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ fontSize: "14px", color: "#ff3d5a", fontWeight: 600 }}>{duel.defender}</div>
          <div style={{ fontSize: "11px", color: "var(--muted)", letterSpacing: "1px" }}>{duel.defender_role}</div>
        </div>
      </div>

      {/* Advantage bar */}
      <div style={{ height: "6px", background: "#ff3d5a33", borderRadius: "3px", overflow: "hidden", marginBottom: "8px" }}>
        <div style={{
          height: "100%",
          width: `${duel.advantage_pct}%`,
          background: "#00e5ff",
          borderRadius: "3px",
          transition: "width 0.8s ease",
        }} />
      </div>

      {/* Insight */}
      <div style={{ fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>
        {duel.insight}
      </div>

      {/* Winner tag */}
      <div style={{ marginTop: "8px" }}>
        <span style={{
          fontSize: "11px",
          letterSpacing: "1px",
          color: attackerWins ? "#00e5ff" : "#ff3d5a",
          background: attackerWins ? "#00e5ff11" : "#ff3d5a11",
          border: `1px solid ${attackerWins ? "#00e5ff33" : "#ff3d5a33"}`,
          borderRadius: "4px",
          padding: "2px 8px",
          fontFamily: "'Bebas Neue', sans-serif",
        }}>
          EDGE: {duel.winner}
        </span>
      </div>
    </div>
  );
}
