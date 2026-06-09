"use client";
import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import { getPlaystyleTags } from "@/components/Playstyletags";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

const ratingColor = (v: number) =>
  v >= 82 ? "var(--elite)" : v >= 73 ? "var(--good)" : v >= 62 ? "var(--avg)" : "var(--poor)";

const fmt = (raw: any) => {
  const n = Number(raw);
  return (!isNaN(n) && n > 0) ? n : "—";
};

const STAT_COLS = [
  { key: "pace",      label: "PAC" },
  { key: "shooting",  label: "SHO" },
  { key: "passing",   label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "DEF" },
  { key: "physic",    label: "PHY" },
];

const POSITIONS = ["All","GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST"];

// ─── Fan votes stored in memory (resets on refresh — no DB) ─────────────────
const fanVotes: Record<string, { over: number; under: number }> = {};
function getFanVote(name: string) { return fanVotes[name] || { over: 0, under: 0 }; }
function castVote(name: string, type: "over" | "under") {
  if (!fanVotes[name]) fanVotes[name] = { over: 0, under: 0 };
  fanVotes[name][type]++;
}

// ─── Table view ──────────────────────────────────────────────────────────────
type TableView = "overall" | "attackers" | "defenders" | "physical" | "fanindex";

const VIEWS: { key: TableView; label: string; icon: string; desc: string }[] = [
  { key: "overall",      label: "World Rankings",    icon: "🌍", desc: "Top players by overall rating" },
  { key: "attackers",    label: "Best Attackers",    icon: "⚡", desc: "Ranked by shooting + dribbling" },
  { key: "defenders",    label: "Best Defenders",    icon: "🛡️", desc: "Ranked by defending + physical" },
  { key: "physical",     label: "Pace & Power",      icon: "💨", desc: "Fastest and strongest players" },
  { key: "fanindex",     label: "Fan Index",         icon: "❤️", desc: "Community ratings — vote overrated/underrated" },
];

export default function Leaderboard() {
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [search,     setSearch]     = useState("");
  const [pos,        setPos]        = useState("All");
  const [sortBy,     setSortBy]     = useState("overall");
  const [view,       setView]       = useState<TableView>("overall");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [, forceUpdate]             = useState(0);

  useEffect(() => {
    fetch(`${BASE}/players`)
      .then(r => r.json())
      .then(d => { setAllPlayers(d.players || []); setLoading(false); })
      .catch(() => { setError("Cannot connect to backend."); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    let list = [...allPlayers];

    // Apply view filter
    switch (view) {
      case "attackers":
        list = list.filter(p => ["ST","LW","RW","CAM","CF"].some(r => p.player_positions?.includes(r)));
        list.sort((a, b) => ((Number(b.shooting)+Number(b.dribbling)) - (Number(a.shooting)+Number(a.dribbling))));
        break;
      case "defenders":
        list = list.filter(p => ["CB","LB","RB","CDM"].some(r => p.player_positions?.includes(r)));
        list.sort((a, b) => ((Number(b.defending)+Number(b.physic)) - (Number(a.defending)+Number(a.physic))));
        break;
      case "physical":
        list.sort((a, b) => (Number(b.pace)+Number(b.physic)) - (Number(a.pace)+Number(a.physic)));
        break;
      case "fanindex":
        list.sort((a, b) => {
          const va = getFanVote(a.short_name);
          const vb = getFanVote(b.short_name);
          return (vb.over + vb.under) - (va.over + va.under);
        });
        break;
      default:
        list.sort((a, b) => (Number(b.overall) || 0) - (Number(a.overall) || 0));
    }

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.short_name?.toLowerCase().includes(q) ||
        p.club_name?.toLowerCase().includes(q) ||
        p.nationality_name?.toLowerCase().includes(q)
      );
    }
    if (pos !== "All") list = list.filter(p => p.player_positions?.includes(pos));

    return list.slice(0, 100);
  }, [allPlayers, search, pos, view]);

  const handleVote = (name: string, type: "over" | "under") => {
    castVote(name, type);
    forceUpdate(n => n + 1);
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <span className="topbar-title">Global Football Index</span>
          <span style={{ fontSize: "11px", color: "var(--text2)", whiteSpace: "nowrap" }}>
            {loading ? "Loading…" : `${filtered.length} of ${allPlayers.length.toLocaleString()} players`}
          </span>
        </div>

        <div className="page">
          {error && (
            <div style={{ background: "var(--red-dim)", border: "1px solid #7a2020", borderRadius: "8px", padding: "12px 16px", marginBottom: "16px", color: "var(--red)", fontSize: "13px" }}>
              {error}
            </div>
          )}

          {/* ── View selector cards ────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "8px", marginBottom: "20px" }}>
            {VIEWS.map(v => (
              <button key={v.key} onClick={() => setView(v.key)} style={{
                padding: "12px 10px",
                background: view === v.key ? "var(--cyan-dim)" : "var(--card)",
                border: `1px solid ${view === v.key ? "var(--cyan)" : "var(--border)"}`,
                borderRadius: "10px", cursor: "pointer",
                textAlign: "left", fontFamily: "DM Sans,sans-serif",
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: "18px", marginBottom: "4px" }}>{v.icon}</div>
                <div style={{ fontSize: "12px", fontWeight: 600, color: view === v.key ? "var(--cyan)" : "var(--text)" }}>{v.label}</div>
                <div style={{ fontSize: "10px", color: "var(--text3)", marginTop: "2px", lineHeight: "1.4" }}>{v.desc}</div>
              </button>
            ))}
          </div>

          {/* ── Filters ──────────────────────────────────── */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, club, country…"
              style={{ padding: "8px 12px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text)", fontSize: "13px", fontFamily: "DM Sans,sans-serif", outline: "none", width: "220px", flexShrink: 0 }}
            />
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {POSITIONS.map(p => (
                <button key={p} onClick={() => setPos(p)} style={{
                  padding: "5px 9px", fontSize: "11px", fontWeight: 500,
                  background: pos === p ? "var(--cyan-dim)" : "var(--surface)",
                  border: `1px solid ${pos === p ? "var(--cyan)" : "var(--border)"}`,
                  color: pos === p ? "var(--cyan)" : "var(--text2)",
                  borderRadius: "6px", cursor: "pointer", fontFamily: "DM Sans,sans-serif",
                }}>{p}</button>
              ))}
            </div>
          </div>

          {/* ── Table ────────────────────────────────────── */}
          <div className="card" style={{ overflow: "hidden" }}>
            <div className="table-scroll">
              <div style={{ minWidth: view === "fanindex" ? "580px" : "680px" }}>

                {/* Header */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: view === "fanindex"
                    ? "40px 1fr 120px 52px 160px"
                    : "40px 1fr 140px 52px 48px 48px 48px 48px 48px 48px",
                  padding: "10px 16px", borderBottom: "1px solid var(--border)",
                  fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px",
                  color: "var(--text3)", textTransform: "uppercase", alignItems: "center",
                }}>
                  <span>#</span>
                  <span>Player</span>
                  <span>Club</span>
                  <span>OVR</span>
                  {view === "fanindex"
                    ? <span>Fan Vote</span>
                    : STAT_COLS.map(s => <span key={s.key}>{s.label}</span>)
                  }
                </div>

                {/* Loading skeleton */}
                {loading && Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ height: "12px", background: "var(--border)", borderRadius: "4px", animation: "pulse 1.5s ease infinite" }} />
                  </div>
                ))}

                {/* Rows */}
                {!loading && filtered.map((p, i) => {
                  const ovr = Number(p.overall) || 0;
                  const tags = getPlaystyleTags(p).slice(0, 1);
                  const vote = getFanVote(p.short_name);
                  const totalVotes = vote.over + vote.under;
                  const overPct = totalVotes > 0 ? Math.round((vote.over / totalVotes) * 100) : 0;
                  const potGap = Number(p.potential) - ovr;

                  return (
                    <div key={`${p.short_name}-${i}`}
                      className="table-row"
                      style={{
                        display: "grid",
                        gridTemplateColumns: view === "fanindex"
                          ? "40px 1fr 120px 52px 160px"
                          : "40px 1fr 140px 52px 48px 48px 48px 48px 48px 48px",
                        padding: "10px 16px", borderBottom: "1px solid var(--border)",
                        alignItems: "center", background: "transparent",
                      }}
                    >
                      {/* Rank */}
                      <span style={{ fontSize: "12px", color: "var(--text3)", fontWeight: 600 }}>
                        {i < 3 ? ["🥇","🥈","🥉"][i] : i + 1}
                      </span>

                      {/* Player */}
                      <div style={{ paddingRight: "10px", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "13px", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.short_name}</span>
                          {tags.map(t => (
                            <span key={t.label} style={{ fontSize: "9px", fontWeight: 600, padding: "1px 5px", borderRadius: "10px", background: `${t.color}18`, color: t.color, flexShrink: 0 }}>{t.label}</span>
                          ))}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.nationality_name} · {p.player_positions || "—"}
                        </div>
                      </div>

                      {/* Club */}
                      <div style={{ paddingRight: "10px", minWidth: 0 }}>
                        <div style={{ fontSize: "12px", color: "var(--text2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.club_name || "—"}</div>
                      </div>

                      {/* OVR */}
                      <span style={{ fontSize: "15px", fontWeight: 700, color: ratingColor(ovr) }}>{ovr > 0 ? ovr : "—"}</span>

                      {/* Fan vote column */}
                      {view === "fanindex" && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <button onClick={() => handleVote(p.short_name, "under")} title="Underrated" style={{
                            padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                            background: "var(--green-dim)", border: "1px solid var(--green)",
                            color: "var(--green)", borderRadius: "6px", cursor: "pointer",
                            fontFamily: "DM Sans,sans-serif",
                          }}>▲ {vote.under}</button>
                          <button onClick={() => handleVote(p.short_name, "over")} title="Overrated" style={{
                            padding: "3px 8px", fontSize: "11px", fontWeight: 600,
                            background: "var(--red-dim)", border: "1px solid var(--red)",
                            color: "var(--red)", borderRadius: "6px", cursor: "pointer",
                            fontFamily: "DM Sans,sans-serif",
                          }}>▼ {vote.over}</button>
                          {totalVotes > 0 && (
                            <span style={{ fontSize: "10px", color: overPct < 40 ? "var(--green)" : overPct > 60 ? "var(--red)" : "var(--text3)" }}>
                              {overPct < 40 ? "Underrated" : overPct > 60 ? "Overrated" : "Fair"}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stat columns */}
                      {view !== "fanindex" && STAT_COLS.map(s => {
                        const raw = p[s.key];
                        const val = raw !== null && raw !== undefined ? Number(raw) : null;
                        return (
                          <span key={s.key} style={{
                            fontSize: "12px",
                            fontWeight: 400,
                            color: val && val > 0 ? ratingColor(val) : "var(--text3)",
                          }}>
                            {val && val > 0 ? val : "—"}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}

                {!loading && filtered.length === 0 && (
                  <div style={{ padding: "48px", textAlign: "center", color: "var(--text3)", fontSize: "13px" }}>
                    No players match your filters
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend + note */}
          {!loading && allPlayers.length > 0 && (
            <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap", alignItems: "center" }}>
              {[
                { label: "Elite 82+", color: "var(--elite)" },
                { label: "Good 73–81", color: "var(--good)" },
                { label: "Avg 62–72", color: "var(--avg)" },
                { label: "Poor <62", color: "var(--poor)" },
              ].map(l => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "11px", color: "var(--text3)" }}>{l.label}</span>
                </div>
              ))}
              {view === "fanindex" && (
                <span style={{ fontSize: "11px", color: "var(--text3)", marginLeft: "auto" }}>
                  ▲ = Underrated · ▼ = Overrated · Votes reset on page refresh
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

