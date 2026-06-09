"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

const ATTRIBUTES = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
const LABELS: Record<string, string> = {
  pace: "PAC", shooting: "SHO", passing: "PAS",
  dribbling: "DRI", defending: "DEF", physic: "PHY",
};

interface PlayerRadarProps {
  player1: any;
  player2: any;
}

export default function PlayerRadar({ player1, player2 }: PlayerRadarProps) {
  if (!player1 || !player2) return null;

  const data = ATTRIBUTES.map((attr) => ({
    attr: LABELS[attr],
    [player1.short_name]: player1[attr] ?? 0,
    [player2.short_name]: player2[attr] ?? 0,
  }));

  return (
    <div style={{
      background: "var(--card)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "24px",
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: "18px",
        letterSpacing: "2px",
        color: "var(--muted)",
        marginBottom: "16px",
        textAlign: "center",
      }}>
        ATTRIBUTE COMPARISON
      </div>

      <ResponsiveContainer width="100%" height={380}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#1e2d3d" />
          <PolarAngleAxis
            dataKey="attr"
            tick={{ fill: "#5a7080", fontSize: 13, fontFamily: "DM Sans" }}
          />
          <Radar
            name={player1.short_name}
            dataKey={player1.short_name}
            stroke="#00e5ff"
            fill="#00e5ff"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name={player2.short_name}
            dataKey={player2.short_name}
            stroke="#ff3d5a"
            fill="#ff3d5a"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{
              fontFamily: "DM Sans",
              fontSize: "14px",
              color: "var(--text)",
              paddingTop: "16px",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
