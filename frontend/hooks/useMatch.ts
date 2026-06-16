"use client";
import { useState, useEffect } from "react";
import { MatchResult } from "@/types";
import { getNations, analyzeMatch } from "@/lib/api";

/**
 * Manages national team selection and match analysis for the World Cup page.
 * Loads the nation list once on mount, then exposes an `analyze()` function
 * that fetches the full match breakdown (lineups, duels, win probability).
 */
export function useMatch() {
  const [nations, setNations] = useState<string[]>([]);
  const [teamA, setTeamA] = useState("");
  const [teamB, setTeamB] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getNations()
      .then(d => setNations(d.nations))
      .catch(() => setError("Cannot connect to backend."));
  }, []);

  const analyze = async () => {
    if (!teamA || !teamB) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await analyzeMatch(teamA, teamB);
      setResult(data);
    } catch {
      setError("Match analysis failed. Check the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setTeamA("");
    setTeamB("");
    setResult(null);
    setError("");
  };

  return {
    nations,
    teamA, setTeamA,
    teamB, setTeamB,
    result, loading, error,
    analyze, reset,
  };
}