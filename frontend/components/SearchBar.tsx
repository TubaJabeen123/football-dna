"use client";

import { useState, useRef, useEffect } from "react";

interface SearchBarProps {
  players: any[];
  value: string;
  onChange: (name: string) => void;
  placeholder?: string;
  accentColor?: string;
}

export default function SearchBar({
  players,
  value,
  onChange,
  placeholder = "Search player...",
  accentColor = "#00e5ff",
}: SearchBarProps) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = players
    .filter((p) =>
      p.short_name?.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 8);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        style={{
          width: "100%",
          background: "var(--surface)",
          border: `1px solid ${open ? accentColor : "var(--border)"}`,
          borderRadius: "8px",
          padding: "12px 16px",
          color: "var(--text)",
          fontSize: "15px",
          fontFamily: "DM Sans",
          outline: "none",
          transition: "border-color 0.2s",
        }}
      />

      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 6px)",
          left: 0,
          right: 0,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          zIndex: 100,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          {filtered.map((p) => (
            <div
              key={p.short_name}
              onClick={() => {
                onChange(p.short_name);
                setQuery(p.short_name);
                setOpen(false);
              }}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid var(--border)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--card)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div>
                <span style={{ color: "var(--text)", fontSize: "14px" }}>{p.short_name}</span>
                <span style={{ color: "var(--muted)", fontSize: "12px", marginLeft: "8px" }}>
                  {p.club_name}
                </span>
              </div>
              <span style={{
                color: accentColor,
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "18px",
              }}>
                {p.overall}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
