import pandas as pd
import numpy as np
from data_loader import df

ROLE_WEIGHTS = {
    "ST":  {"shooting": 0.40, "pace": 0.30, "dribbling": 0.20, "physic": 0.10},
    "LW":  {"dribbling": 0.35, "pace": 0.35, "shooting": 0.20, "passing": 0.10},
    "RW":  {"dribbling": 0.35, "pace": 0.35, "shooting": 0.20, "passing": 0.10},
    "CAM": {"passing": 0.40, "dribbling": 0.30, "shooting": 0.20, "pace": 0.10},
    "CM":  {"passing": 0.40, "defending": 0.25, "dribbling": 0.20, "physic": 0.15},
    "CDM": {"defending": 0.45, "physic": 0.30, "passing": 0.15, "pace": 0.10},
    "LB":  {"defending": 0.40, "pace": 0.30, "physic": 0.20, "passing": 0.10},
    "RB":  {"defending": 0.40, "pace": 0.30, "physic": 0.20, "passing": 0.10},
    "CB":  {"defending": 0.50, "physic": 0.30, "pace": 0.10, "passing": 0.10},
    "GK":  {"overall": 1.0},
}

ATTRIBUTES = ["pace", "shooting", "passing", "dribbling", "defending", "physic"]

OPPONENT_ROLE = {
    "ST": "CB", "LW": "RB", "RW": "LB",
    "CAM": "CDM", "CM": "CM", "CDM": "CAM",
    "LB": "RW", "RB": "LW", "CB": "ST", "GK": "ST",
}

def get_nations():
    nations = df["nationality_name"].dropna().unique().tolist()
    return sorted(nations)

def get_best_xi(nation: str):
    team = df[df["nationality_name"] == nation].copy()
    if team.empty:
        return None

    lineup = []
    used_ids = set()
    formation_roles = ["GK", "CB", "CB", "LB", "RB", "CDM", "CM", "CAM", "LW", "RW", "ST"]

    for role in formation_roles:
        if role == "GK":
            candidates = team[team["player_positions"].str.contains("GK", na=False)]
        else:
            candidates = team[team["player_positions"].str.contains(role, na=False)]

        if candidates.empty:
            candidates = team

        candidates = candidates[~candidates.index.isin(used_ids)]
        if candidates.empty:
            candidates = team[~team.index.isin(used_ids)]
        if candidates.empty:
            continue

        best = candidates.nlargest(1, "overall").iloc[0]
        used_ids.add(best.name)

        player_data = {
            "short_name": str(best["short_name"]),
            "overall": int(best["overall"]) if pd.notna(best["overall"]) else 0,
            "role": role,
            "player_face_url": str(best.get("player_face_url", "") or ""),
            "club_name": str(best.get("club_name", "") or ""),
        }
        for attr in ATTRIBUTES:
            val = best.get(attr, 0)
            player_data[attr] = int(val) if pd.notna(val) else 0

        lineup.append(player_data)

    return lineup

def get_team_vector(lineup: list) -> dict:
    if not lineup:
        return {}
    result = {}
    for attr in ATTRIBUTES:
        vals = [p[attr] for p in lineup if p.get(attr, 0) > 0]
        result[attr] = round(float(np.mean(vals)), 1) if vals else 0.0

    attackers  = [p for p in lineup if p["role"] in ["ST", "LW", "RW", "CAM"]]
    midfielders = [p for p in lineup if p["role"] in ["CM", "CDM"]]
    defenders  = [p for p in lineup if p["role"] in ["CB", "LB", "RB"]]

    def zone_avg(players, attr):
        vals = [p[attr] for p in players if p.get(attr, 0) > 0]
        return round(float(np.mean(vals)), 1) if vals else 0.0

    result["attack_score"]     = zone_avg(attackers, "shooting")
    result["midfield_control"] = zone_avg(midfielders, "passing")
    result["defense_score"]    = zone_avg(defenders, "defending")
    result["pace_index"]       = zone_avg(lineup, "pace")
    result["physical_index"]   = zone_avg(lineup, "physic")

    return result