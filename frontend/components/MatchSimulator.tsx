"use client";
import { useState, useEffect, useRef } from "react";

interface MatchEvent {
  minute: number;
  type: "goal" | "yellow" | "red" | "chance" | "save" | "momentum";
  team: "A" | "B" | "both";
  player?: string;
  description: string;
  icon: string;
}

interface SimResult {
  events: MatchEvent[];
  scoreA: number;
  scoreB: number;
  xgA: number;
  xgB: number;
  possessionA: number;
  shotsA: number;
  shotsB: number;
  momA: number[];  // momentum per 5-min window
  momB: number[];
}

function simulateMatch(
  teamA: any, teamB: any, nameA: string, nameB: string,
  homeAdv: boolean, weather: string
): SimResult {
  const seed = (nameA + nameB).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  let rng = seed;
  const rand = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 0xffffffff; };

  const vA = teamA.vector || {};
  const vB = teamB.vector || {};

  // Adjust for modifiers
  const homeBonus = homeAdv ? 3 : 0;
  const wetPenalty = weather === "rain" ? -2 : 0;

  const attA = (vA.attack_score || 70) + homeBonus + wetPenalty;
  const attB = (vB.attack_score || 70) + wetPenalty;
  const defA = (vA.defense_score || 70) + homeBonus;
  const defB = (vB.defense_score || 70);
  const midA = vA.midfield_control || 70;
  const midB = vB.midfield_control || 70;
  const paceA = vA.pace_index || 70;
  const paceB = vB.pace_index || 70;

  // xG calculation
  const xgA = Math.max(0.3, Math.min(4.5, ((attA - defB) / 20 + 1.2) * (0.7 + rand() * 0.6)));
  const xgB = Math.max(0.3, Math.min(4.5, ((attB - defA) / 20 + 1.2) * (0.7 + rand() * 0.6)));

  // Actual goals from xG
  const scoreA = Math.floor(xgA * (0.5 + rand() * 0.5));
  const scoreB = Math.floor(xgB * (0.5 + rand() * 0.5));

  // Possession
  const possBase = 50 + (midA - midB) * 0.4 + homeBonus * 0.5;
  const possessionA = Math.round(Math.max(35, Math.min(65, possBase)));

  // Shots
  const shotsA = Math.round(8 + (attA / 20) + rand() * 6);
  const shotsB = Math.round(8 + (attB / 20) + rand() * 6);

  // Players from lineups
  const lineupA = teamA.lineup || [];
  const lineupB = teamB.lineup || [];
  const attackersA = lineupA.filter((p: any) => ["ST","LW","RW","CAM"].includes(p.role));
  const attackersB = lineupB.filter((p: any) => ["ST","LW","RW","CAM"].includes(p.role));
  const randPlayerA = () => attackersA[Math.floor(rand() * attackersA.length)]?.short_name || nameA;
  const randPlayerB = () => attackersB[Math.floor(rand() * attackersB.length)]?.short_name || nameB;

  // Momentum windows (12 x 7.5min)
  const momA: number[] = [], momB: number[] = [];
  for (let i = 0; i < 12; i++) {
    const base = 50 + (midA - midB) * 0.3;
    momA.push(Math.round(Math.max(20, Math.min(80, base + (rand() - 0.5) * 30))));
    momB.push(100 - momA[i]);
  }

  // Generate events
  const events: MatchEvent[] = [];
  const usedMinutes = new Set<number>();

  const addEvent = (min: number, e: Omit<MatchEvent, "minute">) => {
    let m = min;
    while (usedMinutes.has(m)) m++;
    usedMinutes.add(m);
    events.push({ minute: m, ...e });
  };

  // Goals
  const goalMinsA: number[] = [];
  const goalMinsB: number[] = [];
  for (let g = 0; g < scoreA; g++) goalMinsA.push(Math.floor(rand() * 87) + 2);
  for (let g = 0; g < scoreB; g++) goalMinsB.push(Math.floor(rand() * 87) + 2);
  goalMinsA.forEach(m => addEvent(m, { type:"goal", team:"A", player:randPlayerA(), icon:"⚽", description:`${randPlayerA()} scores for ${nameA}!` }));
  goalMinsB.forEach(m => addEvent(m, { type:"goal", team:"B", player:randPlayerB(), icon:"⚽", description:`${randPlayerB()} scores for ${nameB}!` }));

  // Chances missed
  const chancesA = Math.floor(rand() * 3) + 1;
  const chancesB = Math.floor(rand() * 3) + 1;
  for (let i = 0; i < chancesA; i++) addEvent(Math.floor(rand() * 90) + 1, { type:"chance", team:"A", icon:"😤", description:`Big chance missed by ${nameA}` });
  for (let i = 0; i < chancesB; i++) addEvent(Math.floor(rand() * 90) + 1, { type:"chance", team:"B", icon:"😤", description:`Big chance missed by ${nameB}` });

  // Saves
  const savesA = Math.floor(rand() * 2) + (scoreB < 2 ? 1 : 0);
  for (let i = 0; i < savesA; i++) addEvent(Math.floor(rand() * 90) + 1, { type:"save", team:"A", icon:"🧤", description:`Goalkeeper save for ${nameA}` });

  // Cards
  const cards = Math.floor(rand() * 3) + 1;
  for (let i = 0; i < cards; i++) {
    const team = rand() > 0.5 ? "A" : "B";
    const lineup = team === "A" ? lineupA : lineupB;
    const defenders = lineup.filter((p: any) => ["CB","LB","RB","CDM"].includes(p.role));
    const p = defenders[Math.floor(rand() * defenders.length)];
    addEvent(Math.floor(rand() * 85) + 5, { type:"yellow", team, icon:"🟨", description:`Yellow card — ${p?.short_name || "player"}` });
  }

  // Halftime + momentum shifts
  addEvent(45, { type:"momentum", team:"both", icon:"⏸️", description:"Half Time" });

  events.sort((a, b) => a.minute - b.minute);

  return { events, scoreA, scoreB, xgA: Math.round(xgA * 10) / 10, xgB: Math.round(xgB * 10) / 10, possessionA, shotsA, shotsB, momA, momB };
}

export default function MatchSimulator({ teamA, teamB, nameA, nameB }: { teamA: any; teamB: any; nameA: string; nameB: string }) {
  const [sim, setSim] = useState<SimResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const [visibleIdx, setVisibleIdx] = useState(0);
  const [homeAdv, setHomeAdv] = useState(false);
  const [weather, setWeather] = useState("dry");
  const intervalRef = useRef<any>(null);

  const runSim = () => {
    const result = simulateMatch(teamA, teamB, nameA, nameB, homeAdv, weather);
    setSim(result);
    setVisibleIdx(0);
    setPlaying(true);
  };

  useEffect(() => {
    if (playing && sim) {
      intervalRef.current = setInterval(() => {
        setVisibleIdx(prev => {
          if (prev >= sim.events.length - 1) { setPlaying(false); clearInterval(intervalRef.current); return prev; }
          return prev + 1;
        });
      }, 600);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, sim]);

  const visibleEvents = sim ? sim.events.slice(0, visibleIdx + 1) : [];
  const scoreA = visibleEvents.filter(e => e.type === "goal" && e.team === "A").length;
  const scoreB = visibleEvents.filter(e => e.type === "goal" && e.team === "B").length;

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "11px", color: "var(--text3)" }}>Weather:</span>
          {["dry","rain"].map(w => (
            <button key={w} onClick={() => setWeather(w)} style={{
              padding: "4px 10px", fontSize: "11px", fontWeight: 500,
              background: weather === w ? "var(--cyan-dim)" : "var(--surface)",
              border: `1px solid ${weather === w ? "var(--cyan)" : "var(--border)"}`,
              color: weather === w ? "var(--cyan)" : "var(--text2)",
              borderRadius: "6px", cursor: "pointer", fontFamily: "DM Sans,sans-serif",
            }}>{w === "dry" ? "☀️ Dry" : "🌧️ Rain"}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button onClick={() => setHomeAdv(!homeAdv)} style={{
            padding: "4px 10px", fontSize: "11px", fontWeight: 500,
            background: homeAdv ? "var(--gold-dim)" : "var(--surface)",
            border: `1px solid ${homeAdv ? "var(--gold)" : "var(--border)"}`,
            color: homeAdv ? "var(--gold)" : "var(--text2)",
            borderRadius: "6px", cursor: "pointer", fontFamily: "DM Sans,sans-serif",
          }}>🏟️ {nameA} Home</button>
        </div>
        <button onClick={runSim} style={{
          padding: "7px 18px", background: "var(--cyan-dim)", border: "1px solid var(--cyan)",
          borderRadius: "8px", color: "var(--cyan)", fontSize: "13px", fontWeight: 600,
          cursor: "pointer", fontFamily: "DM Sans,sans-serif", marginLeft: "auto",
        }}>
          {sim ? "🔄 Resimulate" : "▶ Simulate Match"}
        </button>
      </div>

      {sim && (
        <>
          {/* Scoreboard */}
          <div style={{ background: "var(--card2)", borderRadius: "12px", padding: "20px", marginBottom: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--text3)", letterSpacing: "2px", marginBottom: "10px" }}>
              {playing ? `LIVE · ${visibleEvents[visibleIdx]?.minute || 0}\'` : "FULL TIME"}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: "12px", alignItems: "center" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--cyan)" }}>{nameA}</div>
              </div>
              <div style={{ fontFamily: "DM Mono,monospace", fontSize: "42px", fontWeight: 700, color: "var(--text)", letterSpacing: "4px" }}>
                {scoreA} <span style={{ color: "var(--text3)", fontSize: "28px" }}>-</span> {scoreB}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--red)" }}>{nameB}</div>
              </div>
            </div>
            {/* xG row */}
            <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "12px" }}>
              {[
                { label: "xG", a: sim.xgA, b: sim.xgB },
                { label: "Possession", a: sim.possessionA + "%", b: (100 - sim.possessionA) + "%" },
                { label: "Shots", a: sim.shotsA, b: sim.shotsB },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "1px" }}>{s.label}</div>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text)", marginTop: "2px" }}>
                    <span style={{ color: "var(--cyan)" }}>{s.a}</span>
                    <span style={{ color: "var(--text3)", margin: "0 4px" }}>·</span>
                    <span style={{ color: "var(--red)" }}>{s.b}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Momentum bar (visual) */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "6px", letterSpacing: "1px" }}>MOMENTUM (PER 7.5 MIN)</div>
            <div style={{ display: "flex", gap: "2px", height: "32px", alignItems: "flex-end" }}>
              {sim.momA.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1px" }}>
                  <div style={{ height: `${m * 0.3}px`, background: "var(--cyan)", borderRadius: "2px 2px 0 0", opacity: 0.8 }}/>
                  <div style={{ height: `${(100 - m) * 0.3}px`, background: "var(--red)", borderRadius: "0 0 2px 2px", opacity: 0.8 }}/>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
              <span style={{ fontSize: "10px", color: "var(--cyan)" }}>{nameA}</span>
              <span style={{ fontSize: "10px", color: "var(--red)" }}>{nameB}</span>
            </div>
          </div>

          {/* Event timeline */}
          <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "8px", letterSpacing: "1px" }}>MATCH TIMELINE</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
            {[...visibleEvents].reverse().map((e, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 12px",
                background: e.type === "goal" ? (e.team === "A" ? "var(--cyan-dim)" : "var(--red-dim)") : "var(--card2)",
                borderRadius: "8px",
                borderLeft: `3px solid ${e.type === "goal" ? (e.team === "A" ? "var(--cyan)" : "var(--red)") : e.type === "yellow" ? "var(--gold)" : "var(--border2)"}`,
              }}>
                <span style={{ fontSize: "14px", flexShrink: 0 }}>{e.icon}</span>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text3)", width: "28px", flexShrink: 0 }}>{e.minute}'</span>
                <span style={{ fontSize: "12px", color: e.type === "goal" ? "var(--text)" : "var(--text2)" }}>{e.description}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {!sim && (
        <div style={{ textAlign: "center", padding: "48px", color: "var(--text3)" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.3 }}>▶</div>
          <div style={{ fontSize: "13px" }}>Configure options above and click Simulate Match</div>
          <div style={{ fontSize: "11px", marginTop: "6px" }}>Weather and home advantage affect the result</div>
        </div>
      )}
    </div>
  );
}