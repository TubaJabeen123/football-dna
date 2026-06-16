"use client";
import { useState, useRef, useEffect } from "react";
import { Player } from "@/types";

type SearchMode = "name" | "club" | "nation";

interface PlayerSearchProps {
  players: Player[];
  onSelect: (player: Player) => void;
  accent: string;
  label: string;
}

export default function PlayerSearch({ players, onSelect, accent, label }: PlayerSearchProps) {
  const [query, setQuery]   = useState("");
  const [mode, setMode]     = useState<SearchMode>("name");
  const [open, setOpen]     = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = players.filter(p => {
    const q = query.toLowerCase();
    if (mode === "name")   return p.short_name?.toLowerCase().includes(q);
    if (mode === "club")   return p.club_name?.toLowerCase().includes(q);
    return p.nationality_name?.toLowerCase().includes(q);
  }).slice(0, 12);

  const handleSelect = (p: Player) => {
    onSelect(p);
    setQuery(p.short_name);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Label */}
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: accent, textTransform: "uppercase", marginBottom: 8 }}>
        {label}
      </div>

      {/* Mode chips */}
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {(["name", "club", "nation"] as SearchMode[]).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setQuery(""); setOpen(true); }}
            style={{
              padding: "3px 10px", fontSize: 11, fontWeight: 500,
              background: mode === m ? `${accent}22` : "var(--surface)",
              border: `1px solid ${mode === m ? accent : "var(--border)"}`,
              color: mode === m ? accent : "var(--text2)",
              borderRadius: 20, cursor: "pointer", fontFamily: "DM Sans,sans-serif",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Input */}
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={
          mode === "name"   ? "Search player..." :
          mode === "club"   ? "Search by club..." :
                              "Search by country..."
        }
        style={{
          width: "100%", background: "var(--surface)",
          border: `1px solid ${open ? accent : "var(--border)"}`,
          borderRadius: 8, padding: "10px 14px",
          color: "var(--text)", fontSize: 14,
          fontFamily: "DM Sans,sans-serif", outline: "none",
          transition: "border-color 0.15s",
        }}
      />

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="search-dropdown">
          {filtered.map(p => (
            <div key={p.short_name} className="search-option" onClick={() => handleSelect(p)}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.short_name}</span>
                <span style={{ fontSize: 11, color: "var(--text2)", marginLeft: 8 }}>{p.club_name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--text3)", padding: "1px 6px", background: "var(--surface)", borderRadius: 4 }}>
                  {p.nationality_name}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: accent, minWidth: 28, textAlign: "right" }}>
                  {p.overall}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}