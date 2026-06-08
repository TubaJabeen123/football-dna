import numpy as np
from team_builder import ROLE_WEIGHTS, OPPONENT_ROLE, ATTRIBUTES

def role_score(player: dict, role: str) -> float:
    weights = ROLE_WEIGHTS.get(role, {attr: 1/len(ATTRIBUTES) for attr in ATTRIBUTES})
    score = 0.0
    for attr, w in weights.items():
        score += player.get(attr, 0) * w
    return round(score, 2)

def matchup_score(attacker: dict, defender: dict) -> dict:
    att_role = attacker["role"]
    def_role = defender["role"]

    att_score = role_score(attacker, att_role)
    def_score = role_score(defender, def_role)

    diff = att_score - def_score
    # Normalize to 0-100 advantage percent
    advantage = round(50 + (diff / 2), 1)
    advantage = max(0, min(100, advantage))

    winner = attacker["short_name"] if diff > 0 else defender["short_name"]
    margin = abs(diff)

    insight = generate_insight(attacker, defender, diff)

    # Include full attribute stats so the frontend DuelModal can render bars
    attacker_stats = {a: attacker.get(a, 0) for a in ATTRIBUTES}
    attacker_stats["overall"] = attacker.get("overall", 0)
    defender_stats = {a: defender.get(a, 0) for a in ATTRIBUTES}
    defender_stats["overall"] = defender.get("overall", 0)

    return {
        "attacker": attacker["short_name"],
        "attacker_role": att_role,
        "attacker_score": att_score,
        "attacker_stats": attacker_stats,
        "defender": defender["short_name"],
        "defender_role": def_role,
        "defender_score": def_score,
        "defender_stats": defender_stats,
        "advantage_pct": advantage,
        "winner": winner,
        "margin": round(margin, 1),
        "insight": insight,
    }

def generate_insight(p1: dict, p2: dict, diff: float) -> str:
    if diff > 10:
        return f"{p1['short_name']} dominates this duel — significant attribute advantage."
    elif diff > 3:
        return f"{p1['short_name']} has the edge, but {p2['short_name']} can still compete."
    elif diff > -3:
        return f"Evenly matched duel. Could go either way on the day."
    elif diff > -10:
        return f"{p2['short_name']} has the advantage in this matchup."
    else:
        return f"{p2['short_name']} strongly favored — this is a mismatch."

def get_key_duels(teamA: list, teamB: list) -> list:
    duels = []
    role_map_B = {}
    for p in teamB:
        role_map_B[p["role"]] = p

    for player in teamA:
        opp_role = OPPONENT_ROLE.get(player["role"])
        if opp_role and opp_role in role_map_B:
            opponent = role_map_B[opp_role]
            duel = matchup_score(player, opponent)
            duels.append(duel)

    return duels

def get_weaknesses(lineup: list) -> list:
    weaknesses = []
    for player in lineup:
        role = player["role"]
        weights = ROLE_WEIGHTS.get(role, {})
        for attr, w in weights.items():
            if w >= 0.3:
                val = player.get(attr, 0)
                if val < 65:
                    weaknesses.append({
                        "player": player["short_name"],
                        "role": role,
                        "weakness": attr,
                        "value": val,
                        "severity": "High" if val < 55 else "Medium",
                    })
    return sorted(weaknesses, key=lambda x: x["value"])[:5]
