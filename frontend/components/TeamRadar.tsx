"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from "recharts";

const ATTRS = ["pace","shooting","passing","dribbling","defending","physic"];
const LABELS: Record<string,string> = {
  pace:"PAC", shooting:"SHO", passing:"PAS",
  dribbling:"DRI", defending:"DEF", physic:"PHY"
};

export default function TeamRadar({ teamA, teamB, nameA, nameB }: any) {
  if (!teamA || !teamB) return null;
  const data = ATTRS.map(attr => ({
    attr: LABELS[attr],
    [nameA]: teamA[attr] ?? 0,
    [nameB]: teamB[attr] ?? 0,
  }));

  return (
    <div style={{
      background: "var(--card)", border: "1px solid var(--border)",
      borderRadius: "12px", padding: "24px",
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: "16px",
        letterSpacing: "3px", color: "var(--muted)",
        marginBottom: "16px", textAlign: "center",
      }}>
        TEAM PROFILE COMPARISON
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#1e2d3d" />
          <PolarAngleAxis dataKey="attr" tick={{ fill: "#5a7080", fontSize: 12 }} />
          <Radar name={nameA} dataKey={nameA} stroke="#00e5ff" fill="#00e5ff" fillOpacity={0.15} strokeWidth={2} />
          <Radar name={nameB} dataKey={nameB} stroke="#ff3d5a" fill="#ff3d5a" fillOpacity={0.15} strokeWidth={2} />
          <Legend wrapperStyle={{ fontFamily: "DM Sans", fontSize: "13px", paddingTop: "12px" }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
