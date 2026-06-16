"use client";
import { KeyDuel } from "@/types";

interface DuelExplainerModalProps {
  duel: KeyDuel;
  teamA: string;
  teamB: string;
  onClose: () => void;
}
type StatKey =
  | "pace"
  | "shooting"
  | "passing"
  | "dribbling"
  | "defending"
  | "physic";


interface Dim {
  label: string;
  icon: string;
  aKey: StatKey;
  bKey: StatKey;
  who: string;
}




// Role-specific battle dimensions, written in fan language — no formulas shown
const DIMS: Record<string, Dim[]> = {
  ST: [
    { label: "Finishing ability", icon: "⚽", aKey: "shooting",  bKey: "defending", who: "Who is more clinical in front of goal vs how well the defender reads danger?" },
    { label: "Foot race",         icon: "💨", aKey: "pace",      bKey: "pace",      who: "Can the striker get in behind, or does the defender track back fast enough?" },
    { label: "Physical contest",  icon: "💪", aKey: "physic",    bKey: "physic",    who: "Who wins the shoulder-to-shoulder battle for the ball?" },
    { label: "Ball control",      icon: "🎯", aKey: "dribbling", bKey: "defending", who: "Can the striker hold off challenges and turn, or does the defender win the ball?" },
  ],
  CB: [
    { label: "Defending vs finishing",       icon: "🛡️", aKey: "defending", bKey: "shooting",  who: "How solid is the defender's positioning and tackling against the striker's finishing?" },
    { label: "Aerial battle",                icon: "✈️", aKey: "physic",    bKey: "physic",    who: "Who wins the header at corners and crosses?" },
    { label: "Pace duel",                    icon: "💨", aKey: "pace",      bKey: "pace",      who: "Does the striker have the legs to get in behind, or can the defender recover?" },
    { label: "Hold-up play vs interceptions",icon: "🎯", aKey: "passing",   bKey: "defending", who: "Can the defender read passes and cut out the supply?" },
  ],
  LW: [
    { label: "Pace on the wing",            icon: "💨", aKey: "pace",      bKey: "pace",      who: "Can the winger get past the full-back with speed?" },
    { label: "1v1 dribbling",               icon: "🎯", aKey: "dribbling", bKey: "defending", who: "Can the winger beat the defender with skill?" },
    { label: "Cross quality",               icon: "⚽", aKey: "passing",   bKey: "defending", who: "How dangerous is the delivery from wide areas?" },
    { label: "Physical battle on the flank",icon: "💪", aKey: "physic",    bKey: "physic",    who: "Who wins the shoulder charge on the touchline?" },
  ],
  RW: [
    { label: "Pace on the wing",            icon: "💨", aKey: "pace",      bKey: "pace",      who: "Can the winger get past the full-back with speed?" },
    { label: "1v1 dribbling",               icon: "🎯", aKey: "dribbling", bKey: "defending", who: "Can the winger beat the defender with skill?" },
    { label: "Cross quality",               icon: "⚽", aKey: "passing",   bKey: "defending", who: "How dangerous is the delivery from wide areas?" },
    { label: "Physical battle on the flank",icon: "💪", aKey: "physic",    bKey: "physic",    who: "Who wins the shoulder challenge?" },
  ],
  CAM: [
    { label: "Vision & passing",      icon: "🎯", aKey: "passing",   bKey: "defending", who: "Can the playmaker find gaps, or does the midfielder cut out the pass?" },
    { label: "Dribbling through lines",icon: "⚡", aKey: "dribbling", bKey: "defending", who: "Can the 10 carry the ball forward into dangerous areas?" },
    { label: "Movement and pace",     icon: "💨", aKey: "pace",      bKey: "pace",      who: "Does the playmaker drift away from markers into space?" },
    { label: "Shooting threat",       icon: "⚽", aKey: "shooting",  bKey: "defending", who: "Can they score from outside the box?" },
  ],
  CM: [
    { label: "Passing range",        icon: "🎯", aKey: "passing",   bKey: "passing",   who: "Who controls the rhythm of the game through distribution?" },
    { label: "Pressing intensity",   icon: "💪", aKey: "physic",    bKey: "physic",    who: "Who works harder and wins more loose balls?" },
    { label: "Dribbling under pressure", icon: "⚡", aKey: "dribbling", bKey: "dribbling", who: "Who keeps the ball better when closed down?" },
    { label: "Defensive contribution",icon: "🛡️", aKey: "defending", bKey: "defending", who: "Who does more to break up opposition attacks?" },
  ],
  CDM: [
    { label: "Breaking up play",     icon: "🛡️", aKey: "defending", bKey: "passing",   who: "Can the holder stop the opposition building through midfield?" },
    { label: "Physical duels",       icon: "💪", aKey: "physic",    bKey: "physic",    who: "Who wins more tackles and aerial battles in the centre?" },
    { label: "Reading the game",     icon: "🎯", aKey: "defending", bKey: "dribbling", who: "Who anticipates danger better and intercepts more often?" },
    { label: "Recovery pace",        icon: "💨", aKey: "pace",      bKey: "pace",      who: "Can they track runners or recover when caught out of position?" },
  ],
  LB: [
    { label: "Defending vs dribbling",icon: "🛡️", aKey: "defending", bKey: "dribbling", who: "Can the full-back contain the winger, or does the winger get past?" },
    { label: "Pace battle",          icon: "💨", aKey: "pace",      bKey: "pace",      who: "Who wins the foot race down the flank?" },
    { label: "Physical challenge",   icon: "💪", aKey: "physic",    bKey: "physic",    who: "Who holds their ground in contact?" },
    { label: "Overlapping quality",  icon: "⚽", aKey: "passing",   bKey: "defending", who: "Can the full-back get forward and provide an attacking option?" },
  ],
  RB: [
    { label: "Defending vs dribbling",icon: "🛡️", aKey: "defending", bKey: "dribbling", who: "Can the full-back contain the winger, or does the winger get past?" },
    { label: "Pace battle",          icon: "💨", aKey: "pace",      bKey: "pace",      who: "Who wins the foot race down the flank?" },
    { label: "Physical challenge",   icon: "💪", aKey: "physic",    bKey: "physic",    who: "Who holds their ground in contact?" },
    { label: "Overlapping quality",  icon: "⚽", aKey: "passing",   bKey: "defending", who: "Can the full-back get forward?" },
  ],
};

export default function DuelExplainerModal({ duel, teamA, teamB, onClose }: DuelExplainerModalProps) {
  const attWins = duel.advantage_pct >= 50;
  const gap = Math.abs(duel.advantage_pct - 50);
  const verdict =
    gap <= 2  ? "Too close to call" :
    gap <= 8  ? `Slight edge: ${duel.winner}` :
    gap <= 16 ? `${duel.winner} has the advantage` :
                `${duel.winner} clearly comes out on top`;

  const dims = DIMS[duel.attacker_role] || DIMS["CM"];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Player Matchup</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{teamA} vs {teamB}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Players */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center", marginBottom: 20 }}>
          <div style={{ background: "var(--card2)", borderRadius: 10, padding: 14, border: "1px solid var(--cyan)33", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--cyan)", marginBottom: 3 }}>{duel.attacker}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{teamA}</div>
            <div style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", background: "var(--cyan-dim)", color: "var(--cyan)", borderRadius: 20, display: "inline-block", marginTop: 6 }}>{duel.attacker_role}</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textAlign: "center" }}>VS</div>
          <div style={{ background: "var(--card2)", borderRadius: 10, padding: 14, border: "1px solid var(--red)33", textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--red)", marginBottom: 3 }}>{duel.defender}</div>
            <div style={{ fontSize: 11, color: "var(--text3)" }}>{teamB}</div>
            <div style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", background: "var(--red-dim)", color: "var(--red)", borderRadius: 20, display: "inline-block", marginTop: 6 }}>{duel.defender_role}</div>
          </div>
        </div>

        {/* Battle breakdown — fan language */}
        <div className="section-label" style={{ marginBottom: 10 }}>Battle Breakdown</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {dims.map((dim, i) => {
         const aVal = Number(duel.attacker_stats?.[dim.aKey] ?? 0);
         const bVal = Number(duel.defender_stats?.[dim.bKey] ?? 0);
            const hasVals = aVal > 0 || bVal > 0;
            const diff = aVal - bVal;
            const aWins = diff > 4, bWins = diff < -4;
            const edgeCol  = aWins ? "var(--cyan)" : bWins ? "var(--red)" : "var(--text3)";
            const edgeName = aWins ? duel.attacker : bWins ? duel.defender : "Even";

            return (
              <div key={i} style={{ background: "var(--card2)", borderRadius: 8, padding: 12, borderLeft: `3px solid ${edgeCol}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: 14 }}>{dim.icon}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{dim.label}</span>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: edgeCol,
                    padding: "2px 8px", background: `${edgeCol}18`,
                    border: `1px solid ${edgeCol}33`, borderRadius: 20,
                  }}>
                    {edgeName === "Even" ? "Even" : `Edge: ${edgeName}`}
                  </span>
                </div>

                {hasVals && (
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--cyan)", width: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{duel.attacker}</span>
                      <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(aVal, 100)}%`, background: "var(--cyan)", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: aWins ? "var(--cyan)" : "var(--text2)", width: 28, textAlign: "right", flexShrink: 0 }}>{aVal || "—"}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--red)", width: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{duel.defender}</span>
                      <div style={{ flex: 1, height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(bVal, 100)}%`, background: "var(--red)", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: bWins ? "var(--red)" : "var(--text2)", width: 28, textAlign: "right", flexShrink: 0 }}>{bVal || "—"}</span>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>{dim.who}</div>
              </div>
            );
          })}
        </div>

        {/* Verdict */}
        <div style={{
          background: attWins ? "var(--cyan-dim)" : gap <= 2 ? "var(--border)" : "var(--red-dim)",
          border: `1px solid ${attWins ? "var(--cyan)" : gap <= 2 ? "var(--border2)" : "var(--red)"}44`,
          borderRadius: 10, padding: 16, textAlign: "center",
        }}>
          <div style={{ fontSize: 11, color: "var(--text3)", letterSpacing: 1.5, marginBottom: 6 }}>VERDICT</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: gap <= 2 ? "var(--text2)" : attWins ? "var(--cyan)" : "var(--red)" }}>
            {verdict}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
            <span style={{ fontSize: 11, color: "var(--cyan)", width: 80, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{duel.attacker}</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--border)", overflow: "hidden", display: "flex" }}>
              <div style={{ width: `${duel.advantage_pct}%`, background: "var(--cyan)", transition: "width 1s" }} />
              <div style={{ flex: 1, background: "var(--red)" }} />
            </div>
            <span style={{ fontSize: 11, color: "var(--red)", width: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{duel.defender}</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 6 }}>Wider bar = stronger in this matchup</div>
        </div>
      </div>
    </div>
  );
}