"use client";
import { useState, useEffect, useCallback } from "react";
import { Player, SimilarPlayer } from "@/types";
import { getAllPlayers, getPlayer, getSimilarPlayers } from "@/lib/api";

/** Loads the full player list once on mount. Used for search dropdowns. */
export function useAllPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAllPlayers()
      .then(d => {
        setPlayers(d.players);
        setLoading(false);
      })
      .catch(() => {
        setError("Cannot connect to backend on port 8000.");
        setLoading(false);
      });
  }, []);

  return { players, loading, error };
}

/**
 * Manages the two players being compared on the Player Compare page.
 * Automatically fetches similar players once both are selected.
 */
export function usePlayerComparison() {
  const [p1, setP1] = useState<Player | null>(null);
  const [p2, setP2] = useState<Player | null>(null);
  const [similar, setSimilarPlayers] = useState<SimilarPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectPlayer = useCallback(async (which: "p1" | "p2", name: string) => {
    setLoading(true);
    setError("");
    try {
      const full = await getPlayer(name);
      if (which === "p1") setP1(full);
      else setP2(full);
    } catch {
      setError("Failed to load player.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch similar players whenever both players are set
  useEffect(() => {
    if (!p1 || !p2) return;
    getSimilarPlayers(p1.short_name)
      .then(setSimilarPlayers)
      .catch(() => {
        // Silent failure — similar players tab will just show empty state
      });
  }, [p1, p2]);

  const reset = useCallback(() => {
    setP1(null);
    setP2(null);
    setSimilarPlayers([]);
  }, []);

  return { p1, p2, similar, loading, error, selectPlayer, reset };
}

/**
 * Loads a single player's full profile on demand.
 * Used by the SimilarPlayerModal when a similar player row is clicked.
 */
export function useLoadPlayer() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (name: string): Promise<Player | null> => {
    setLoading(true);
    setError("");
    try {
      const player = await getPlayer(name);
      return player;
    } catch {
      setError("Failed to load player.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { load, loading, error };
}