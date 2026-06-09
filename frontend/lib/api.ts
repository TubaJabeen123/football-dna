const BASE = "http://127.0.0.1:8000/api";  // ← use 127.0.0.1 not localhost


export async function getAllPlayers() {
  const res = await fetch(`${BASE}/players`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export async function getPlayer(name: string) {
  const res = await fetch(`${BASE}/player/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error("Failed to fetch player");
  return res.json();
}

export async function comparePlayers(player1: string, player2: string) {
  const res = await fetch(`${BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player1, player2 }),
  });
  if (!res.ok) throw new Error("Failed to compare players");
  return res.json();
}

export async function getSimilarPlayers(name: string) {
  const res = await fetch(`${BASE}/similar/${encodeURIComponent(name)}`);
  if (!res.ok) throw new Error("Failed to get similar players");
  return res.json();
}
export async function getNations() {
  const res = await fetch(`${BASE}/nations`);
  if (!res.ok) throw new Error("Failed to fetch nations");
  return res.json();
}

export async function analyzeMatch(teamA: string, teamB: string) {
  const res = await fetch(`${BASE}/match`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      teamA,
      teamB,
    }),
  });

  if (!res.ok) throw new Error("Failed to analyze match");

  return res.json();
}