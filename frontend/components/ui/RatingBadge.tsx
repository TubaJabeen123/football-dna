"use client";
import { ratingColor } from "@/lib/utils";

interface Props {
  value: number;
  size?: "sm" | "md" | "lg";
  background?: string;
}

export default function RatingBadge({ value, size = "md", background }: Props) {
  const sizes = { sm: 36, md: 44, lg: 52 };
  const fonts = { sm: 16, md: 20, lg: 26 };
  const s = sizes[size], f = fonts[size];
  return (
    <div style={{
      width: s, height: s, borderRadius: 8,
      background: background || ratingColor(value),
      color: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: f, flexShrink: 0,
    }}>
      {value}
    </div>
  );
}