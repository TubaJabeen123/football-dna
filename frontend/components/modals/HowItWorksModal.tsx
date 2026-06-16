"use client";

interface HowItWorksModalProps {
  onClose: () => void;
}

const ITEMS = [
  { icon: "🔍", t: "Search Modes", d: "Switch between Name, Club, and Country filters using the chips above each search box." },
  { icon: "📊", t: "Radar Chart", d: "Spider shape maps 6 attributes. Where a shape bulges outward, that player leads in that area." },
  { icon: "⚔️", t: "Head-to-Head", d: "Each row shows one attribute. Cyan = Player 1, Red = Player 2. Wider bar wins." },
  { icon: "🏷️", t: "Playstyle Tags", d: "Auto-generated labels derived from attribute combinations — e.g. 'Inverted Winger', 'Target Man'." },
  { icon: "📈", t: "Career Curve", d: "Projects the player's rating from now to retirement. Green dot = now, Gold dot = projected peak." },
  { icon: "🧬", t: "Similar Players", d: "Players with the same balance of attributes. Click any name to see full profile and scouting note." },
  { icon: "🗺️", t: "Position on Pitch", d: "Shows where on the pitch this player operates based on their listed positions." },
];

export default function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>How it works</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "var(--text2)", fontSize: 18, cursor: "pointer" }}
          >
            ✕
          </button>
        </div>

        {ITEMS.map(({ icon, t, d }) => (
          <div key={t} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}