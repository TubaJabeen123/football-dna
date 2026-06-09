"use client";
import { useState, useMemo } from "react";

interface ScenarioProps {
  baseWinA: number;
  baseWinB: number;
  baseDraw: number;
  baseBreakdown: any;
  nameA: string;
  nameB: string;
  verdict: string;
}

type Modifier = {
  id: string;
  label: string;
  desc: string;
  icon: string;
  effect: (bd: any) => Partial<typeof bd>;
};

const MODIFIERS: Modifier[] = [
  {
    id: "home_a",
    label: "Home advantage — Team A",
    desc: "Playing at home adds roughly 3–5 points to midfield control and defense through crowd support and familiarity.",
    icon: "🏟️",
    effect: (bd) => ({
      midfield_diff: (bd.midfield_diff || 0) + 4,
      defense_diff: (bd.defense_diff || 0) + 3,
    }),
  },
  {
    id: "home_b",
    label: "Home advantage — Team B",
    desc: "Team B playing at home. Their midfield and defensive lines benefit from crowd noise and pitch familiarity.",
    icon: "🏟️",
    effect: (bd) => ({
      midfield_diff: (bd.midfield_diff || 0) - 4,
      defense_diff: (bd.defense_diff || 0) - 3,
    }),
  },
  {
    id: "rain",
    label: "Heavy rain",
    desc: "Wet conditions slow the pace of play, reduce passing accuracy, and slightly neutralise the faster team's advantage.",
    icon: "🌧️",
    effect: (bd) => ({
      pace_diff: (bd.pace_diff || 0) * 0.5,
      attack_diff: (bd.attack_diff || 0) * 0.85,
    }),
  },
  {
    id: "tired_a",
    label: "Fatigued squad — Team A",
    desc: "Simulates Team A playing their third game in 7 days. Physical output drops — pace and physical ratings fall.",
    icon: "😓",
    effect: (bd) => ({
      pace_diff: (bd.pace_diff || 0) - 5,
      physical_diff: (bd.physical_diff || 0) - 4,
    }),
  },
  {
    id: "tired_b",
    label: "Fatigued squad — Team B",
    desc: "Team B carrying fatigue. Their pressing and transition speed reduces.",
    icon: "😓",
    effect: (bd) => ({
      pace_diff: (bd.pace_diff || 0) + 5,
      physical_diff: (bd.physical_diff || 0) + 4,
    }),
  },
  {
    id: "highpress",
    label: "High-press tactics — Team A",
    desc: "Team A pressing aggressively. Midfield intensity rises but physical reserves drop faster.",
    icon: "⚡",
    effect: (bd) => ({
      midfield_diff: (bd.midfield_diff || 0) + 5,
      physical_diff: (bd.physical_diff || 0) - 3,
    }),
  },
  {
    id: "defensive_b",
    label: "Defensive block — Team B",
    desc: "Team B sitting deep in two banks of four. Their defense rating effectively increases, attack decreases.",
    icon: "🛡️",
    effect: (bd) => ({
      defense_diff: (bd.defense_diff || 0) - 6,
      attack_diff: (bd.attack_diff || 0) + 3,
    }),
  },
];

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

function recalculate(breakdown: any) {
  const {
    attack_diff = 0, midfield_diff = 0, defense_diff = 0,
    pace_diff = 0, physical_diff = 0,
  } = breakdown;
  const composite =
    attack_diff   * 0.30 +
    midfield_diff * 0.25 +
    defense_diff  * 0.25 +
    pace_diff     * 0.10 +
    physical_diff * 0.10;
  let winA  = Math.round(sigmoid(composite / 10) * 1000) / 10;
  let winB  = Math.round(sigmoid(-composite / 10) * 1000) / 10;
  const total = winA + winB;
  winA  = Math.round(winA  / total * 80 * 10) / 10;
  winB  = Math.round(winB  / total * 80 * 10) / 10;
  const draw = Math.round((100 - winA - winB) * 10) / 10;
  return { winA, winB, draw };
}

const ratingColor = (v: number) =>
  v >= 82 ? "var(--elite)" : v >= 73 ? "var(--good)" : v >= 62 ? "var(--avg)" : "var(--poor)";

export default function ScenarioExplorer({
  baseWinA, baseWinB, baseDraw, baseBreakdown, nameA, nameB, verdict,
}: ScenarioProps) {
  const [active, setActive] = useState<string[]>([]);
  const [expandedMod, setExpandedMod] = useState<string | null>(null);

  const modifiedBreakdown = useMemo(() => {
    let bd = { ...baseBreakdown };
    for (const id of active) {
      const mod = MODIFIERS.find(m => m.id === id);
      if (mod) bd = { ...bd, ...mod.effect(bd) };
    }
    return bd;
  }, [active, baseBreakdown]);

  const { winA, winB, draw } = useMemo(() => {
    if (active.length === 0) return { winA: baseWinA, winB: baseWinB, draw: baseDraw };
    return recalculate(modifiedBreakdown);
  }, [modifiedBreakdown, active, baseWinA, baseWinB, baseDraw]);

  const diff = Math.abs(winA - winB);
  const confidence =
    diff <= 5  ? "Very low — almost even" :
    diff <= 15 ? "Low — slight edge" :
    diff <= 25 ? "Moderate" :
    diff <= 35 ? "High" : "Very high";

  const toggle = (id: string) => {
    // Mutually exclusive modifiers
    const groups: Record<string, string[]> = {
      home: ["home_a", "home_b"],
      tired: ["tired_a", "tired_b"],
    };
    const group = Object.values(groups).find(g => g.includes(id));
    setActive(prev => {
      let next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      if (group && !prev.includes(id)) next = next.filter(x => !group.includes(x) || x === id);
      return next;
    });
  };

  const ZONE_LABELS: Record<string, string> = {
    attack_diff:   "Attack",
    midfield_diff: "Midfield",
    defense_diff:  "Defense",
    pace_diff:     "Pace",
    physical_diff: "Physical",
  };

  return (
    <div>
      {/* What this is */}
      <div style={{ background: "var(--card2)", borderRadius: "8px", padding: "14px", marginBottom: "16px", borderLeft: "3px solid var(--gold)" }}>
        <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--gold)", letterSpacing: "1px", marginBottom: "6px" }}>WHAT THIS IS</div>
        <div style={{ fontSize: "12px", color: "var(--text2)", lineHeight: "1.7" }}>
          This is a <strong style={{ color: "var(--text)" }}>squad strength scenario explorer</strong>, not a match simulator. It shows how contextual factors — home ground, weather, fatigue, tactics — shift the relative advantage between squads, based on the FIFA 22 attribute model. It does not predict goals or events.
        </div>
      </div>

      {/* Base probability */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "11px", color: "var(--text3)", letterSpacing: "1.5px", marginBottom: "8px" }}>
          {active.length === 0 ? "BASE PREDICTION (NO MODIFIERS)" : `ADJUSTED PREDICTION (${active.length} modifier${active.length > 1 ? "s" : ""} active)`}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "10px" }}>
          <div>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--cyan)", lineHeight: 1, transition: "all 0.4s" }}>{winA}%</div>
            <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>{nameA}</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "20px", fontWeight: 600, color: "var(--text3)", transition: "all 0.4s" }}>{draw}%</div>
            <div style={{ fontSize: "11px", color: "var(--text3)" }}>Draw</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "36px", fontWeight: 700, color: "var(--red)", lineHeight: 1, transition: "all 0.4s" }}>{winB}%</div>
            <div style={{ fontSize: "12px", color: "var(--text2)", marginTop: "2px" }}>{nameB}</div>
          </div>
        </div>
        <div style={{ height: "10px", borderRadius: "5px", overflow: "hidden", display: "flex", marginBottom: "8px" }}>
          <div style={{ width: `${winA}%`, background: "var(--cyan)", transition: "width 0.5s ease" }} />
          <div style={{ width: `${draw}%`, background: "var(--border2)", transition: "width 0.5s ease" }} />
          <div style={{ width: `${winB}%`, background: "var(--red)", transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text3)" }}>Confidence: <span style={{ color: "var(--text2)", fontWeight: 500 }}>{confidence}</span></span>
          {active.length > 0 && (
            <button onClick={() => setActive([])} style={{ fontSize: "11px", color: "var(--red)", background: "none", border: "none", cursor: "pointer", fontFamily: "DM Sans,sans-serif" }}>
              Reset modifiers
            </button>
          )}
        </div>
      </div>

      {/* Zone impact (shown when modifiers active) */}
      {active.length > 0 && (
        <div style={{ background: "var(--card2)", borderRadius: "8px", padding: "14px", marginBottom: "16px" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)", letterSpacing: "1.5px", marginBottom: "10px" }}>HOW EACH ZONE SHIFTED</div>
          {Object.entries(ZONE_LABELS).map(([key, label]) => {
            const base = (baseBreakdown[key] || 0) as number;
            const mod  = (modifiedBreakdown[key] || 0) as number;
            const delta = mod - base;
            if (Math.abs(delta) < 0.5) return null;
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "var(--text2)", width: "70px", flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: "4px", background: "var(--border)", borderRadius: "2px", position: "relative" }}>
                  <div style={{
                    position: "absolute", height: "100%",
                    width: `${Math.min(Math.abs(mod) * 1.5, 50)}%`,
                    background: mod > 0 ? "var(--cyan)" : "var(--red)",
                    left: mod > 0 ? "50%" : `calc(50% - ${Math.min(Math.abs(mod)*1.5,50)}%)`,
                    borderRadius: "2px", transition: "all 0.4s",
                  }} />
                </div>
                <span style={{ fontSize: "11px", fontWeight: 600, color: delta > 0 ? "var(--cyan)" : "var(--red)", width: "90px", textAlign: "right", flexShrink: 0 }}>
                  {delta > 0 ? "+" : ""}{delta.toFixed(1)} → {mod > 0 ? nameA : nameB}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Modifier buttons */}
      <div style={{ fontSize: "11px", color: "var(--text3)", letterSpacing: "1.5px", marginBottom: "10px" }}>SCENARIO MODIFIERS — click to apply</div>
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {MODIFIERS.map(mod => {
          const isActive = active.includes(mod.id);
          const isExpanded = expandedMod === mod.id;
          return (
            <div key={mod.id} style={{
              background: isActive ? "var(--cyan-dim)" : "var(--card2)",
              border: `1px solid ${isActive ? "var(--cyan)" : "var(--border)"}`,
              borderRadius: "8px", overflow: "hidden", transition: "border-color 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", cursor: "pointer" }}
                onClick={() => toggle(mod.id)}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{mod.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: 500, flex: 1, color: isActive ? "var(--cyan)" : "var(--text)" }}>
                  {mod.label}
                </span>
                {isActive && <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--cyan)", letterSpacing: "1px" }}>ON</span>}
                <button onClick={e => { e.stopPropagation(); setExpandedMod(isExpanded ? null : mod.id); }}
                  style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 4px" }}>
                  {isExpanded ? "−" : "+"}
                </button>
              </div>
              {isExpanded && (
                <div style={{ padding: "0 12px 12px 38px", fontSize: "12px", color: "var(--text2)", lineHeight: "1.7", borderTop: "1px solid var(--border)" }}>
                  <div style={{ paddingTop: "10px" }}>{mod.desc}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: "16px", padding: "12px", background: "var(--border)", borderRadius: "8px", fontSize: "11px", color: "var(--text3)", lineHeight: "1.7" }}>
        Modifiers adjust the underlying zone scores proportionally. The model is still based on FIFA 22 squad ratings — it does not account for real match data, individual form, or current fitness levels.
      </div>
    </div>
  );
}