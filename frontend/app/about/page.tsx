"use client";
import Sidebar from "@/components/Sidebar";

const MODULES = [
  {
    icon: "👤",
    title: "Player Comparison",
    href: "/",
    color: "var(--cyan)",
    dim: "var(--cyan-dim)",
    desc:
      "Compare two players side-by-side using FIFA 22 ratings. Radar charts, head-to-head attribute bars, and cosine-similarity-based 'DNA matching' to find players with the same style.",
  },
  {
    icon: "🏆",
    title: "World Cup Intelligence",
    href: "/worldcup",
    color: "var(--red)",
    dim: "var(--red-dim)",
    desc:
      "Pick any two national teams and get a predicted Best XI, squad radar, key player duels, tactical weaknesses, and a sigmoid-based win probability breakdown.",
  },
  {
    icon: "📊",
    title: "Leaderboard",
    href: "/leaderboard",
    color: "var(--gold)",
    dim: "var(--gold-dim)",
    desc:
      "Global ranking of all players sorted by overall rating. Filter by position, sort by any stat column, and search across names, clubs, and nations.",
  },
];

const STACK = [
  { label: "Data",      value: "FIFA 22 player dataset (~18 k players)" },
  { label: "Backend",   value: "FastAPI + pandas + scikit-learn (Python)" },
  { label: "Frontend",  value: "Next.js 15 + React 19 + Recharts" },
  { label: "Similarity", value: "Cosine similarity on 6-attribute stat vectors" },
  { label: "Win model", value: "Zone-weighted sigmoid probability function" },
];

export default function AboutPage() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <span className="topbar-title">About Football DNA</span>
          <span
            style={{
              fontSize: "11px",
              color: "var(--cyan)",
              background: "var(--cyan-dim)",
              padding: "3px 10px",
              borderRadius: "20px",
              fontWeight: 500,
            }}
          >
            v1.0
          </span>
        </div>

        <div className="page" style={{ maxWidth: "860px" }}>
          {/* Hero */}
          <div
            className="card"
            style={{
              padding: "32px",
              marginBottom: "20px",
              borderTop: "2px solid var(--cyan)",
              background:
                "linear-gradient(135deg, var(--card) 0%, var(--card2) 100%)",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "var(--text)",
                marginBottom: "10px",
              }}
            >
              ⚽ Football DNA
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "var(--text2)",
                lineHeight: "1.8",
                maxWidth: "640px",
              }}
            >
              A data-driven football analytics platform that combines player
              statistics, team composition, and match prediction. Inspired by
              tools like SofaScore and Opta — built as an open-source showcase
              of FIFA-style data modelling.
            </div>
          </div>

          {/* Modules */}
          <div
            className="section-label"
            style={{ marginBottom: "12px" }}
          >
            Modules
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            {MODULES.map((m) => (
              <a
                key={m.title}
                href={m.href}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="card"
                  style={{
                    padding: "18px",
                    borderTop: `2px solid ${m.color}`,
                    cursor: "pointer",
                    transition: "transform 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform =
                      "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.transform =
                      "translateY(0)")
                  }
                >
                  <div
                    style={{
                      fontSize: "22px",
                      marginBottom: "8px",
                    }}
                  >
                    {m.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 600,
                      color: m.color,
                      marginBottom: "8px",
                    }}
                  >
                    {m.title}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--text2)",
                      lineHeight: "1.7",
                    }}
                  >
                    {m.desc}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Tech Stack */}
          <div
            className="section-label"
            style={{ marginBottom: "12px" }}
          >
            Tech Stack
          </div>
          <div className="card" style={{ overflow: "hidden", marginBottom: "24px" }}>
            {STACK.map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "16px",
                  padding: "12px 20px",
                  borderBottom:
                    i < STACK.length - 1
                      ? "1px solid var(--border)"
                      : undefined,
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    color: "var(--text3)",
                    textTransform: "uppercase",
                    width: "90px",
                    flexShrink: 0,
                  }}
                >
                  {s.label}
                </span>
                <span style={{ fontSize: "13px", color: "var(--text2)" }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Prediction disclaimer */}
          <div
            style={{
              padding: "16px",
              background: "var(--card2)",
              borderRadius: "10px",
              borderLeft: "3px solid var(--gold)",
              fontSize: "12px",
              color: "var(--text3)",
              lineHeight: "1.8",
            }}
          >
            <span
              style={{
                fontWeight: 700,
                color: "var(--gold)",
                display: "block",
                marginBottom: "6px",
                letterSpacing: "1px",
                fontSize: "11px",
              }}
            >
              ⚠️ DISCLAIMER
            </span>
            All predictions are based on FIFA 22 static ratings and squad
            composition only. They do not account for current form, injuries,
            team chemistry, tactical systems, or any live data. Treat results as
            a{" "}
            <strong style={{ color: "var(--text2)" }}>
              Squad Strength Indicator
            </strong>{" "}
            — not a match forecast.
          </div>
        </div>
      </div>
    </div>
  );
}
