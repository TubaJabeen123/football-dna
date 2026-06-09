"use client";

const ratingColor = (v: number) =>
  v >= 82 ? "var(--elite)" : v >= 73 ? "var(--good)" : v >= 62 ? "var(--avg)" : "var(--poor)";

interface SquadDepthProps {
  lineup: any[];
  nation: string;
  accentColor: string;
}

export default function SquadDepth({ lineup, nation, accentColor }: SquadDepthProps) {
  if (!lineup?.length) return null;

  const ratings = lineup.map(p => Number(p.overall) || 0);
  const avg = Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length);
  const top5 = ratings.slice().sort((a, b) => b - a).slice(0, 5);
  const top5avg = Math.round(top5.reduce((a, b) => a + b, 0) / top5.length);
  const depth = Math.round((avg / top5avg) * 100);

  // Zone averages
  const getZoneAvg = (roles: string[]) => {
    const ps = lineup.filter(p => roles.includes(p.role));
    if (!ps.length) return 0;
    return Math.round(ps.reduce((a, p) => a + (Number(p.overall) || 0), 0) / ps.length);
  };

  const zones = [
    { label: "Attack",   roles: ["ST","LW","RW","CAM"], icon: "⚡" },
    { label: "Midfield", roles: ["CM","CDM"],           icon: "🎯" },
    { label: "Defense",  roles: ["CB","LB","RB"],       icon: "🛡️" },
    { label: "Goalkeeper", roles: ["GK"],               icon: "🧤" },
  ];

  return (
    <div>
      {/* Squad overview */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" }}>
        {[
          { label: "Squad OVR", value: avg, color: accentColor },
          { label: "Star Power", value: top5avg, color: "var(--gold)" },
          { label: "Depth %", value: depth + "%", color: "var(--green)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--card2)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "var(--text3)", letterSpacing: "1px", marginBottom: "4px" }}>{s.label.toUpperCase()}</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Zone breakdown */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "11px", color: "var(--text3)", letterSpacing: "1.5px", marginBottom: "10px" }}>ZONE RATINGS</div>
        {zones.map(z => {
          const zAvg = getZoneAvg(z.roles);
          if (!zAvg) return null;
          return (
            <div key={z.label} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", fontSize: "12px" }}>
                <span style={{ color: "var(--text2)" }}>{z.icon} {z.label}</span>
                <span style={{ fontWeight: 700, color: ratingColor(zAvg) }}>{zAvg}</span>
              </div>
              <div style={{ height: "5px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${zAvg}%`, background: ratingColor(zAvg), borderRadius: "3px", transition: "width 0.8s ease" }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player list */}
      <div style={{ fontSize: "11px", color: "var(--text3)", letterSpacing: "1.5px", marginBottom: "10px" }}>STARTING XI</div>
      {lineup.map((p, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "7px 0", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "10px", fontWeight: 600, color: accentColor, width: "32px", letterSpacing: "0.5px" }}>{p.role}</span>
            <span style={{ fontSize: "13px", fontWeight: 500 }}>{p.short_name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ height: "4px", width: "60px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${p.overall}%`, background: ratingColor(Number(p.overall)), borderRadius: "2px" }}/>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 700, color: ratingColor(Number(p.overall)), width: "24px", textAlign: "right" }}>{p.overall}</span>
          </div>
        </div>
      ))}
    </div>
  );
}