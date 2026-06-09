"use client";

interface WinMeterProps {
  teamA: string;
  teamB: string;
  winA: number;
  winB: number;
  draw: number;
  verdict: string;
  breakdown: any;
}

export default function WinMeter({ teamA, teamB, winA, winB, draw, verdict, breakdown }: WinMeterProps) {
  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "14px",
      padding: "32px",
      marginBottom: "24px",
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "16px", letterSpacing: "3px",
        color: "var(--muted)", marginBottom: "24px",
      }}>
        WIN PROBABILITY
      </div>

      {/* Big probability bar */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: "#00e5ff", fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px" }}>
            {winA}%
          </span>
          <span style={{ color: "var(--muted)", fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", alignSelf: "center" }}>
            DRAW {draw}%
          </span>
          <span style={{ color: "#ff3d5a", fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px" }}>
            {winB}%
          </span>
        </div>
        <div style={{ height: "12px", borderRadius: "6px", overflow: "hidden", display: "flex" }}>
          <div style={{ width: `${winA}%`, background: "#00e5ff", transition: "width 1s ease" }} />
          <div style={{ width: `${draw}%`, background: "var(--border)", transition: "width 1s ease" }} />
          <div style={{ width: `${winB}%`, background: "#ff3d5a", transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
          <span style={{ color: "#00e5ff", fontSize: "13px" }}>{teamA}</span>
          <span style={{ color: "#ff3d5a", fontSize: "13px" }}>{teamB}</span>
        </div>
      </div>

      {/* Verdict badge */}
      <div style={{
        textAlign: "center",
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "18px",
        letterSpacing: "2px",
        color: "#ffd700",
        background: "#ffd70011",
        border: "1px solid #ffd70033",
        borderRadius: "8px",
        padding: "10px",
        marginBottom: "24px",
      }}>
        ⚡ {verdict}
      </div>

      {/* Zone breakdown */}
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "13px", letterSpacing: "2px",
        color: "var(--muted)", marginBottom: "12px",
      }}>
        ZONE BREAKDOWN
      </div>
      {Object.entries(breakdown).map(([key, val]: any) => {
        const label = key.replace("_diff", "").replace("_", " ").toUpperCase();
        const positive = val >= 0;
        return (
          <div key={key} style={{ marginBottom: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span style={{ color: "var(--muted)", letterSpacing: "1px" }}>{label}</span>
              <span style={{ color: positive ? "#00e5ff" : "#ff3d5a", fontWeight: 600 }}>
                {positive ? `+${val}` : val} {positive ? `(${teamA})` : `(${teamB})`}
              </span>
            </div>
            <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute",
                height: "100%",
                width: `${Math.min(Math.abs(val) * 2, 100)}%`,
                background: positive ? "#00e5ff" : "#ff3d5a",
                left: positive ? "50%" : `calc(50% - ${Math.min(Math.abs(val) * 2, 50)}%)`,
                borderRadius: "2px",
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}