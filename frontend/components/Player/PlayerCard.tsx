"use client";
import { Player } from "@/types";
import { ratingColor } from "@/lib/utils";
import { ATTRS, ATTR_LABELS, ATTR_DESCRIPTIONS, ATTRIBUTE_CATEGORIES, PITCH_POSITIONS } from "@/lib/constants";
import PlaystyleTags from "@/components/ui/PlaystyleTags";

interface PlayerCardProps {
  player: Player;
  accent: string;
}

function PitchDot({ positions, accent }: { positions: string; accent: string }) {
  const parts = positions.split(",").map(s => s.trim());
  const pos = parts.reduce((found: any, p: string) => found || (PITCH_POSITIONS[p] ? { role: p, ...PITCH_POSITIONS[p] } : null), null);
  if (!pos) return null;
  return (
    <div style={{ marginTop: 14 }}>
      <div className="section-label">Position</div>
      <div style={{ position: "relative", width: "100%", aspectRatio: "0.65", background: "#0a2a14", borderRadius: 8, overflow: "hidden", border: "1px solid #1a4a24" }}>
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 308">
          <rect x="10" y="10" width="180" height="288" fill="none" stroke="#1e5c28" strokeWidth="1.2" />
          <line x1="10" y1="154" x2="190" y2="154" stroke="#1e5c28" strokeWidth="0.8" />
          <circle cx="100" cy="154" r="26" fill="none" stroke="#1e5c28" strokeWidth="0.8" />
          <rect x="50" y="10"  width="100" height="52" fill="none" stroke="#1e5c28" strokeWidth="0.8" />
          <rect x="75" y="10"  width="50"  height="20" fill="none" stroke="#1e5c28" strokeWidth="0.8" />
          <rect x="50" y="246" width="100" height="52" fill="none" stroke="#1e5c28" strokeWidth="0.8" />
          <rect x="75" y="278" width="50"  height="20" fill="none" stroke="#1e5c28" strokeWidth="0.8" />
        </svg>
        <div style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}` }} />
      </div>
    </div>
  );
}

export default function PlayerCard({ player, accent }: PlayerCardProps) {
  const positions = player.player_positions || "";
  const primaryPos = positions.split(",").map(s => s.trim()).find(p => PITCH_POSITIONS[p]);

  return (
    <div className="card" style={{ padding: 20, height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          {player.player_face_url && (
            <img
              src={player.player_face_url} alt=""
              style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", background: "var(--card2)", border: `2px solid ${accent}44` }}
              onError={(e: any) => { e.target.style.display = "none"; }}
            />
          )}
          <div style={{ position: "absolute", bottom: -4, right: -4, background: accent, color: "#000", fontSize: 11, fontWeight: 700, padding: "2px 5px", borderRadius: 6 }}>
            {player.overall}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {player.short_name}
          </div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 2 }}>{player.club_name}</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "var(--text3)" }}>{player.nationality_name}</span>
            {primaryPos && (
              <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", background: `${accent}22`, color: accent, borderRadius: 4 }}>
                {primaryPos}
              </span>
            )}
          </div>
          <PlaystyleTags player={player} />
        </div>
      </div>

      {/* Attribute category bars */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-label">Attributes</div>
        {ATTRIBUTE_CATEGORIES.map(cat => {
          const avg = Math.round(cat.attrs.reduce((s, a) => s + (Number(player[a]) || 0), 0) / cat.attrs.length);
          return (
            <div key={cat.label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12 }}>{cat.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text2)" }}>{cat.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: ratingColor(avg) }}>{avg}</span>
              </div>
              <div className="stat-bar-track">
                <div className="stat-bar-fill" style={{ width: `${avg}%`, background: ratingColor(avg) }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual stats */}
      <div className="section-label">Stats</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
        {ATTRS.map(a => (
          <div key={a} title={ATTR_DESCRIPTIONS[a]} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--border)", cursor: "help" }}>
            <span style={{ fontSize: 11, letterSpacing: 0.5, color: "var(--text3)", fontWeight: 500 }}>{ATTR_LABELS[a]}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: ratingColor(Number(player[a]) || 0) }}>
              {Number(player[a]) || "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Age & Potential */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
        <div style={{ background: "var(--card2)", borderRadius: 8, padding: 10, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 1, marginBottom: 4 }}>AGE</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{player.age || "—"}</div>
        </div>
        <div style={{ background: "var(--card2)", borderRadius: 8, padding: 10, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--text3)", letterSpacing: 1, marginBottom: 4 }}>POTENTIAL</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--gold)" }}>{player.potential || "—"}</div>
        </div>
      </div>

      <PitchDot positions={positions} accent={accent} />
    </div>
  );
}