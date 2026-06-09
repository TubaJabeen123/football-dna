import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Football DNA — Scout Intelligence",
  description: "AI-powered football player & team analysis",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}