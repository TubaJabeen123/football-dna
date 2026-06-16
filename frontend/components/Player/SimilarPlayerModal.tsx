"use client";
import { Player } from "@/types";
import { ATTRS, ATTR_LABELS, ATTR_DESCRIPTIONS } from "@/lib/constants";
import { ratingColor, getPlaystyleTags } from "@/lib/utils";

interface Props {
  player: Player;
  compareWith: Player | null;
  onClose: () => void;
  onCompare: (player: Player) => void;
}

function buildExplanation(sim: Player, ref: Player): string {
  const attrNames: Record<string, string> = {
    pace: "pace", shooting: "finishing", passing: "passing ability",
    dribbling: "dribbling", defending: "defensive work", physic: "physical strength",
  };
  const diffs = ATTRS.map(a => ({ attr: a, simV: Number(sim[a]) || 0, refV: Number(ref[a]) || 0 }))
    .filter(d => d.simV > 0 && d.refV > 0);
  const closest  = diffs.filter(d => Math.abs(d.simV - d.refV) <= 8);
  const stronger = diffs.filter(d => d.simV > d.refV + 8);
  const weaker   = diffs.filter(d => d.refV > d.simV + 8);

  if (!closest.length) return `${sim.short_name} has a broadly similar playing profile to ${ref.short_name}.`;
  let txt = `${sim.short_name} and ${ref.short_name} have very similar levels of ${closest.slice(0, 3).map(d => attrNames[d.attr]).join(", ")}`;
  if (stronger.length) txt += `. ${sim.short_name} is actually stronger in ${stronger.map(d => attrNames[d.attr]).join(" and ")}`;
  if (weaker.length)   txt += `, but trails in ${weaker.map(d => attrNames[d.attr]).join(" and ")}`;
  return txt + ".";
}

function buildScoutingNote(sim: Player, ref: Player): string {
  const diff = Number(ref.overall) - (Number(sim.overall) || 0);
  if (diff >= 10) return `${sim.short_name} is a lower-rated but stylistically similar option — useful as a budget alternative or squad depth.`;
  if (diff >= 5)  return `A close alternative to ${ref.short_name}. Could step in without drastically changing the team's playing style.`;
  if (diff >= -4) return `Very comparable quality. Could be a like-for-like replacement or an upgrade in specific areas.`;
  return `${sim.short_name} is actually rated higher than ${ref.short_name}. An interesting head-to-head comparison.`;
}

export default function SimilarPlayerModal({ player, compareWith, onClose, onCompare }: Props) {
  const tags = getPlaystyleTags(player);
  const ov   = Number(player.overall)   || 0;
  const pot  = Number(player.potential) || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{player.short_name}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
              {player.club_name} · {player.nationality_name}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text2)", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        {/* Photo + badges */}
        <div style={{ display: "flex", gap: 16, alignItems: "center", padding: 16, background: "var(--card2)", borderRadius: 10, marginBottom: 16 }}>
          {player.player_face_url && (
            <img src={player.player_face_url} alt="" style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", background: "var(--border)", border: "2px solid var(--border2)", flexShrink: 0 }}
              onError={(e: any) => { e.target.style.display = "none"; }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", background: "var(--cyan-dim)", color: "var(--cyan)", borderRadius: 20 }}>OVR {ov}</span>
              {pot > 0 && <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", background: "var(--gold-dim)", color: "var(--gold)", borderRadius: 20 }}>POT {pot}</span>}
              {player.age && <span style={{ fontSize: 11, padding: "2px 8px", background: "var(--border)", color: "var(--text2)", borderRadius: 20 }}>Age {player.age}</span>}
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {tags.map(t => <span key={t.label} style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 20, background: `${t.color}18`, border: `1px solid ${t.color}44`, color: t.color }}>{t.label}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Attribute bars with diff */}
        <div style={{ marginBottom: 16 }}>
          <div className="section-label" style={{ marginBottom: 10 }}>Attributes</div>
          {ATTRS.map(a => {
            const val     = Number(player[a]) || 0;
            const refVal  = compareWith ? Number(compareWith[a]) || 0 : null;
            const col     = ratingColor(val);
            const diff    = refVal !== null ? val - refVal : null;
            return (
              <div key={a} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: "var(--text2)", fontWeight: 500 }}>
                    {ATTR_LABELS[a]}{" "}
                    <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>— {ATTR_DESCRIPTIONS[a]}</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {diff !== null && Math.abs(diff) > 1 && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: diff > 0 ? "var(--green)" : "var(--red)" }}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    )}
                    <span style={{ fontWeight: 700, color: col }}>{val > 0 ? val : "—"}</span>
                  </div>
                </div>
                <div className="stat-bar-track">
                  <div className="stat-bar-fill" style={{ width: `${Math.min(val, 100)}%`, background: col }} />
                </div>
              </div>
            );
          })}
          {compareWith && <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>+/- compared to {compareWith.short_name}</div>}
        </div>

        {/* Why similar */}
        {compareWith && (
          <div style={{ background: "var(--card2)", borderRadius: 8, padding: 14, marginBottom: 12, borderLeft: "3px solid var(--cyan)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", letterSpacing: 1, marginBottom: 6 }}>WHY ARE THEY SIMILAR?</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{buildExplanation(player, compareWith)}</div>
          </div>
        )}

        {/* Scouting note */}
        {compareWith && (
          <div style={{ background: "var(--card2)", borderRadius: 8, padding: 14, marginBottom: 16, borderLeft: "3px solid var(--gold)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--gold)", letterSpacing: 1, marginBottom: 6 }}>SCOUTING NOTE</div>
            <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7 }}>{buildScoutingNote(player, compareWith)}</div>
          </div>
        )}

        {/* Compare CTA */}
        {compareWith && (
          <button
            onClick={() => { onCompare(player); onClose(); }}
            style={{ width: "100%", padding: 11, background: "var(--cyan-dim)", border: "1px solid var(--cyan)", borderRadius: 8, color: "var(--cyan)", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "DM Sans,sans-serif" }}
          >
            Compare {player.short_name} vs {compareWith.short_name} →
          </button>
        )}
      </div>
    </div>
  );
}