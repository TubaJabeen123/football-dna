"use client";
import { Player } from "@/types";
import { getPlaystyleTags } from "@/lib/utils";

export default function PlaystyleTags({ player }: { player: Player }) {
  const tags = getPlaystyleTags(player);
  if (!tags.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
      {tags.map(t => (
        <span
          key={t.label}
          style={{
            fontSize: 10, fontWeight: 600,
            padding: "2px 7px", borderRadius: 20,
            background: `${t.color}18`,
            border: `1px solid ${t.color}44`,
            color: t.color,
          }}
        >
          {t.label}
        </span>
      ))}
    </div>
  );
}