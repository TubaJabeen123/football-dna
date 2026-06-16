"use client";
import { MatchResult } from "@/types";

interface WinExplainerModalProps {
  result: MatchResult;
  onClose: () => void;
}

interface Zone {
  val: number;
  label: string;
  icon: string;
  text: (v: number) => string;
}

export default function WinExplainerModal({ result, onClose }: WinExplainerModalProps) {
  const wp = result.win_probability;
  const bd = wp.breakdown;
  const nA = result.teamA.nation;
  const nB = result.teamB.nation;

  const att = bd.attack_diff ?? 0;
  const mid = bd.midfield_diff ?? 0;
  const def = bd.defense_diff ?? 0;
  const pac = bd.pace_diff ?? 0;
  const phy = bd.physical_diff ?? 0;

  const diff = Math.abs(wp.win_a - wp.win_b);
  const confidence =
    diff <= 5  ? "Very even — hard to call" :
    diff <= 15 ? "Slight lean, could go either way" :
    diff <= 25 ? "Moderate advantage" :
                 "Clear favourite on paper";

  const zones: Zone[] = [
    {
      val: att, label: "Attacking quality", icon: "⚡",
      text: (v: number) => v > 0
        ? `${nA}'s forwards carry a higher goal threat than ${nB}'s.`
        : `${nB}'s attackers are rated higher and pose more danger up front.`,
    },
    {
      val: mid, label: "Midfield control", icon: "🎯",
      text: (v: number) => v > 0
        ? `${nA} should dominate possession and dictate tempo through the middle.`
        : `${nB} are likely to control the ball and set the pace of the game.`,
    },
    {
      val: def, label: "Defensive solidity", icon: "🛡️",
      text: (v: number) => v > 0
        ? `${nA}'s back line is more organised and harder to break down.`
        : `${nB} look more solid defensively and are harder to break down.`,
    },
    {
      val: pac, label: "Pace & transitions", icon: "💨",
      text: (v: number) => v > 0
        ? `${nA} are quicker overall — dangerous in counter-attacks and behind the defence.`
        : `${nB} have more pace across the squad — a threat on the break.`,
    },
    {
      val: phy, label: "Physical strength", icon: "💪",
      text: (v: number) => v > 0
        ? `${nA} win more aerial duels and physical contests — important at set-pieces.`
        : `${nB} are the more physical side and will win more challenges.`,
    },
  ].filter(z => Math.abs(z.val) > 1.5);

  const aAdv = zones.filter(z => z.val > 0).length;
  const bAdv = zones.filter(z => z.val < 0).length;
  const outlook =
    aAdv > bAdv + 1 ? `Overall, ${nA} look the stronger squad on paper across multiple departments.` :
    bAdv > aAdv + 1 ? `Overall, ${nB} look the stronger squad on paper across multiple departments.` :
                      `Both squads have strengths in different areas. This is a closely matched contest on paper.`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Match Analysis</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{nA} vs {nB}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Probability strip */}
        <div style={{ background: "var(--card2)", borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--cyan)", lineHeight: 1 }}>{wp.win_a}%</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{nA}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 20, fontWeight: 600, color: "var(--text3)" }}>{wp.draw}%</div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>Draw</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "var(--red)", lineHeight: 1 }}>{wp.win_b}%</div>
              <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{nB}</div>
            </div>
          </div>
          <div className="prob-track" style={{ marginBottom: 10 }}>
            <div style={{ width: `${wp.win_a}%`, background: "var(--cyan)", transition: "width 1s" }} />
            <div style={{ width: `${wp.draw}%`, background: "var(--border2)" }} />
            <div style={{ width: `${wp.win_b}%`, background: "var(--red)", transition: "width 1s" }} />
          </div>
          <div style={{ fontSize: 11, color: "var(--text3)" }}>
            Prediction confidence: <span style={{ color: "var(--text2)", fontWeight: 500 }}>{confidence}</span>
          </div>
        </div>

        {/* Zone analysis — plain English, no formulas */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Why this prediction?</div>
          {zones.map((z, i) => (
            <div
              key={i}
              style={{
                display: "flex", gap: 12, padding: 12,
                background: "var(--card2)", borderRadius: 8,
                borderLeft: `3px solid ${z.val > 0 ? "var(--cyan)" : "var(--red)"}`,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{z.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: z.val > 0 ? "var(--cyan)" : "var(--red)", marginBottom: 3 }}>
                  {z.label} — {z.val > 0 ? nA : nB} ahead
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{z.text(z.val)}</div>
              </div>
            </div>
          ))}
          {zones.length === 0 && (
            <div style={{ padding: 12, background: "var(--card2)", borderRadius: 8, fontSize: 12, color: "var(--text2)" }}>
              The two squads are virtually identical across all departments — no clear advantage either way.
            </div>
          )}
        </div>

        {/* Tactical outlook — two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          {[
            { n: nA, pros: zones.filter(z => z.val > 0).map(z => z.label), col: "var(--cyan)" },
            { n: nB, pros: zones.filter(z => z.val < 0).map(z => z.label), col: "var(--red)" },
          ].map(t => (
            <div key={t.n} style={{ background: "var(--card2)", borderRadius: 8, padding: 12, borderTop: `2px solid ${t.col}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.col, letterSpacing: 1, marginBottom: 8 }}>{t.n}</div>
              {t.pros.length === 0
                ? <div style={{ fontSize: 11, color: "var(--text3)" }}>No clear advantages</div>
                : t.pros.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                    <span style={{ color: t.col, fontSize: 10, marginTop: 2 }}>▸</span>
                    <span style={{ fontSize: 11, color: "var(--text2)" }}>{s}</span>
                  </div>
                ))
              }
            </div>
          ))}
        </div>

        {/* Overall outlook */}
        <div style={{ background: "var(--card2)", borderRadius: 8, padding: 14, marginBottom: 14, borderLeft: "3px solid var(--gold)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 6 }}>OVERALL OUTLOOK</div>
          <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{outlook}</div>
        </div>

        {/* Disclaimer */}
        <div style={{ background: "var(--border)", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text3)", letterSpacing: 1, marginBottom: 6 }}>⚠️ IMPORTANT</div>
          <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.7, marginBottom: 8 }}>
            This is based on FIFA 22 player ratings only. Real matches are also decided by:
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
            {["Current form", "Injuries", "Team tactics", "Manager decisions", "Motivation", "Weather", "Home support", "Referee decisions"].map(f => (
              <div key={f} style={{ display: "flex", gap: 5 }}>
                <span style={{ color: "var(--text3)", fontSize: 10 }}>–</span>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}