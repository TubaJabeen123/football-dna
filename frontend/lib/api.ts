import { Player, SimilarPlayer, MatchResult } from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

export async function getAllPlayers(): Promise<{ players: Player[] }> {
  return fetchJSON(`${BASE}/players`);
}

export async function getPlayer(name: string): Promise<Player> {
  return fetchJSON(`${BASE}/player/${encodeURIComponent(name)}`);
}

export async function comparePlayers(
  player1: string, player2: string
): Promise<{ player1: Player; player2: Player }> {
  return fetchJSON(`${BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player1, player2 }),
  });
}

export async function getSimilarPlayers(name: string): Promise<SimilarPlayer[]> {
  return fetchJSON(`${BASE}/similar/${encodeURIComponent(name)}`);
}

export async function getNations(): Promise<{ nations: string[] }> {
  return fetchJSON(`${BASE}/nations`);
}

export async function analyzeMatch(teamA: string, teamB: string): Promise<MatchResult> {
  return fetchJSON(`${BASE}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teamA, teamB }),
  });
}