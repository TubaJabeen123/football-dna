"use client";
import { ratingColor } from "@/lib/utils";
import { ATTR_DESCRIPTIONS, ATTR_LABELS, AttrKey } from "@/lib/constants";

interface StatBarProps {
  attr: AttrKey;
  value: number;
}

export default function StatBar({ attr, value }: StatBarProps) {
  const col = ratingColor(value);
  return (
    <div title={ATTR_DESCRIPTIONS[attr]} style={{ marginBottom: 10, cursor: "help" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
        <span style={{ color: "var(--text2)", fontWeight: 500 }}>
          {ATTR_LABELS[attr]}{" "}
          <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400 }}>
            — {ATTR_DESCRIPTIONS[attr]}
          </span>
        </span>
        <span style={{ fontWeight: 700, color: col }}>{value > 0 ? value : "—"}</span>
      </div>
      <div className="stat-bar-track">
        <div className="stat-bar-fill" style={{ width: `${Math.min(value, 100)}%`, background: col }} />
      </div>
    </div>
  );
}