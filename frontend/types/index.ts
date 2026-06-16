export interface Player {
  short_name: string;
  long_name?: string;
  age?: number;
  club_name: string;
  nationality_name: string;
  player_positions?: string;
  overall: number;
  potential?: number;
  player_face_url?: string;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physic?: number;
}

export interface SimilarPlayer {
  short_name: string;
  club_name: string;
  overall: number;
  similarity: number;
}

export interface TeamLineupPlayer {
  short_name: string;
  overall: number;
  role: string;
  club_name: string;
  player_face_url?: string;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physic?: number;
}

export interface TeamVector {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  attack_score: number;
  midfield_control: number;
  defense_score: number;
  pace_index: number;
  physical_index: number;
}

export interface Weakness {
  player: string;
  role: string;
  weakness: string;
  value: number;
  severity: "High" | "Medium";
}

export interface PlayerStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  overall: number;
}

export interface KeyDuel {
  attacker: string;
  attacker_role: string;
  attacker_score: number;

  attacker_stats: PlayerStats;

  defender: string;
  defender_role: string;
  defender_score: number;

  defender_stats: PlayerStats;

  advantage_pct: number;
  winner: string;
  margin: number;
  insight: string;
}

export interface WinProbability {
  win_a: number;
  win_b: number;
  draw: number;
  verdict: string;
  composite_score: number;
  breakdown: {
    attack_diff: number;
    midfield_diff: number;
    defense_diff: number;
    pace_diff: number;
    physical_diff: number;
  };
}

export interface TeamResult {
  nation: string;
  lineup: TeamLineupPlayer[];
  vector: TeamVector;
  weaknesses: Weakness[];
}

export interface MatchResult {
  teamA: TeamResult;
  teamB: TeamResult;
  key_duels: KeyDuel[];
  win_probability: WinProbability;
}