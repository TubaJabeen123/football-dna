"use client";

// Derive playstyle tags from player attributes
export function getPlaystyleTags(p: any): { label: string; color: string }[] {
  if (!p) return [];
  const tags: { label: string; color: string }[] = [];
  const pac = p.pace || 0, sho = p.shooting || 0, pas = p.passing || 0;
  const dri = p.dribbling || 0, def = p.defending || 0, phy = p.physic || 0;
  const ovr = p.overall || 0;

  // Attacking roles
  if (sho >= 80 && pac >= 78) tags.push({ label: "Poacher", color: "#f87171" });
  if (sho >= 82 && phy >= 78) tags.push({ label: "Target Man", color: "#f87171" });
  if (pac >= 88 && dri >= 80) tags.push({ label: "Speed Demon", color: "#fbbf24" });
  if (dri >= 85 && pac >= 80) tags.push({ label: "Inverted Winger", color: "#a78bfa" });
  if (pas >= 82 && dri >= 80 && sho >= 75) tags.push({ label: "Playmaker", color: "#38bdf8" });
  if (pas >= 85 && dri >= 82) tags.push({ label: "Creative Force", color: "#38bdf8" });

  // Midfield roles
  if (def >= 75 && phy >= 78 && pas >= 72) tags.push({ label: "Ball-Winner", color: "#4ade80" });
  if (pas >= 80 && def >= 70 && phy >= 76) tags.push({ label: "Box-to-Box", color: "#4ade80" });
  if (pas >= 84 && def >= 65) tags.push({ label: "Deep Playmaker", color: "#38bdf8" });

  // Defensive
  if (def >= 82 && phy >= 78) tags.push({ label: "Rock Solid", color: "#4ade80" });
  if (def >= 78 && pac >= 78) tags.push({ label: "Sweeper", color: "#4ade80" });
  if (phy >= 84) tags.push({ label: "Physical Beast", color: "#fbbf24" });

  // General
  if (ovr >= 88) tags.push({ label: "World Class", color: "#fbbf24" });
  else if (ovr >= 82) tags.push({ label: "Top Quality", color: "#a78bfa" });
  if (ovr <= 65 && p.age <= 21) tags.push({ label: "Wonderkid", color: "#fbbf24" });
  if (p.potential && p.potential - ovr >= 8 && p.age <= 23) tags.push({ label: "High Potential", color: "#fbbf24" });

  return tags.slice(0, 3);
}

export default function PlaystyleTags({ player }: { player: any }) {
  const tags = getPlaystyleTags(player);
  if (!tags.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "10px" }}>
      {tags.map(t => (
        <span key={t.label} style={{
          fontSize: "10px", fontWeight: 600,
          padding: "2px 8px", borderRadius: "20px",
          background: `${t.color}18`,
          border: `1px solid ${t.color}44`,
          color: t.color,
          letterSpacing: "0.3px",
        }}>{t.label}</span>
      ))}
    </div>
  );
}