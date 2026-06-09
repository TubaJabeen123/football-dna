"use client";

interface PlayerCardProps {
  player: any;
  accentColor: string;
}

export default function PlayerCard({ player, accentColor }: PlayerCardProps) {
  if (!player) return null;

  const stats = [
    { label: "PAC", value: player.pace },
    { label: "SHO", value: player.shooting },
    { label: "PAS", value: player.passing },
    { label: "DRI", value: player.dribbling },
    { label: "DEF", value: player.defending },
    { label: "PHY", value: player.physic },
  ];

  return (
    <div style={{
      background: "var(--card)",
      border: `1px solid ${accentColor}33`,
      borderTop: `3px solid ${accentColor}`,
      borderRadius: "12px",
      padding: "24px",
      width: "100%",
    }}>
      {/* Player photo + name */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
        {player.player_face_url && (
          <img
            src={player.player_face_url}
            alt={player.short_name}
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              border: `2px solid ${accentColor}`,
              objectFit: "cover",
              background: "var(--surface)",
            }}
            onError={(e: any) => { e.target.style.display = "none"; }}
          />
        )}
        <div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "22px",
            letterSpacing: "1px",
            color: "var(--text)",
          }}>
            {player.short_name}
          </div>
          <div style={{ fontSize: "13px", color: "var(--muted)" }}>
            {player.club_name} · {player.nationality_name}
          </div>
        </div>

        {/* Overall rating badge */}
        <div style={{
          marginLeft: "auto",
          background: accentColor,
          color: "#000",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "28px",
          width: "52px",
          height: "52px",
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          letterSpacing: "1px",
        }}>
          {player.overall}
        </div>
      </div>

      {/* Stat bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {stats.map(({ label, value }) => (
          <div key={label}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
              fontSize: "12px",
            }}>
              <span style={{ color: "var(--muted)", letterSpacing: "1px" }}>{label}</span>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{value ?? "—"}</span>
            </div>
            <div style={{
              height: "4px",
              background: "var(--border)",
              borderRadius: "2px",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: `${value ?? 0}%`,
                background: accentColor,
                borderRadius: "2px",
                transition: "width 0.8s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
