"use client";

// Formation layouts — [x%, y%] positions on pitch (0,0 = top-left, 100,100 = bottom-right)
const FORMATIONS: Record<string, { role: string; x: number; y: number }[]> = {
  "4-2-3-1": [
    { role: "GK",  x: 50, y: 91 },
    { role: "RB",  x: 84, y: 74 }, { role: "CB",  x: 63, y: 78 },
    { role: "CB",  x: 37, y: 78 }, { role: "LB",  x: 16, y: 74 },
    { role: "CDM", x: 62, y: 60 }, { role: "CDM", x: 38, y: 60 },
    { role: "RW",  x: 82, y: 42 }, { role: "CAM", x: 50, y: 44 }, { role: "LW", x: 18, y: 42 },
    { role: "ST",  x: 50, y: 22 },
  ],
  "4-3-3": [
    { role: "GK",  x: 50, y: 91 },
    { role: "RB",  x: 84, y: 74 }, { role: "CB",  x: 63, y: 78 },
    { role: "CB",  x: 37, y: 78 }, { role: "LB",  x: 16, y: 74 },
    { role: "CM",  x: 72, y: 52 }, { role: "CM",  x: 50, y: 55 }, { role: "CM", x: 28, y: 52 },
    { role: "RW",  x: 82, y: 28 }, { role: "ST",  x: 50, y: 20 }, { role: "LW", x: 18, y: 28 },
  ],
};

const ratingColor = (v: number) =>
  v >= 82 ? "#4ade80" : v >= 73 ? "#38bdf8" : v >= 62 ? "#fbbf24" : "#f87171";

interface FormationPitchProps {
  lineup: any[];
  nation: string;
  accentColor: string;
}

export default function FormationPitch({ lineup, nation, accentColor }: FormationPitchProps) {
  if (!lineup?.length) return null;

  // Map lineup by role
  const byRole: Record<string, any> = {};
  lineup.forEach(p => { byRole[p.role] = p; });

  const formation = FORMATIONS["4-2-3-1"];

  return (
    <div>
      <div style={{ fontSize: "11px", color: "var(--text3)", marginBottom: "10px", textAlign: "center" }}>
        {nation} · 4-2-3-1 Formation
      </div>
      <div style={{
        position: "relative",
        width: "100%",
        aspectRatio: "0.7",
        background: "linear-gradient(180deg, #0a2a14 0%, #0d3318 50%, #0a2a14 100%)",
        borderRadius: "10px",
        overflow: "hidden",
        border: "1px solid #1a4a24",
      }}>
        {/* Pitch markings */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 200 285">
          {/* Outline */}
          <rect x="10" y="10" width="180" height="265" fill="none" stroke="#1e5c28" strokeWidth="1.5"/>
          {/* Halfway line */}
          <line x1="10" y1="142" x2="190" y2="142" stroke="#1e5c28" strokeWidth="1"/>
          {/* Centre circle */}
          <circle cx="100" cy="142" r="28" fill="none" stroke="#1e5c28" strokeWidth="1"/>
          <circle cx="100" cy="142" r="2" fill="#1e5c28"/>
          {/* Top penalty box */}
          <rect x="50" y="10" width="100" height="55" fill="none" stroke="#1e5c28" strokeWidth="1"/>
          <rect x="75" y="10" width="50" height="22" fill="none" stroke="#1e5c28" strokeWidth="1"/>
          {/* Bottom penalty box */}
          <rect x="50" y="220" width="100" height="55" fill="none" stroke="#1e5c28" strokeWidth="1"/>
          <rect x="75" y="263" width="50" height="22" fill="none" stroke="#1e5c28" strokeWidth="1"/>
          {/* Corner arcs */}
          {[[10,10],[190,10],[10,275],[190,275]].map(([cx,cy],i)=>(
            <circle key={i} cx={cx} cy={cy} r="6" fill="none" stroke="#1e5c28" strokeWidth="1"/>
          ))}
        </svg>

        {/* Player dots */}
        {formation.map((pos, i) => {
          const player = byRole[pos.role];
          if (!player) return null;
          const ovr = Number(player.overall) || 0;
          return (
            <div key={i} style={{
              position: "absolute",
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
              zIndex: 10,
            }}>
              {/* Player avatar */}
              <div style={{
                width: "28px", height: "28px",
                borderRadius: "50%",
                background: accentColor,
                border: "2px solid rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: 700, color: "#000",
                boxShadow: `0 2px 8px ${accentColor}66`,
                flexShrink: 0,
              }}>
                {ovr > 0 ? ovr : "?"}
              </div>
              {/* Name tag */}
              <div style={{
                background: "rgba(0,0,0,0.75)",
                backdropFilter: "blur(4px)",
                borderRadius: "4px",
                padding: "1px 5px",
                fontSize: "9px",
                fontWeight: 600,
                color: "var(--text)",
                whiteSpace: "nowrap",
                maxWidth: "52px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                letterSpacing: "0.2px",
              }}>
                {player.short_name?.split(" ").slice(-1)[0] || pos.role}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}