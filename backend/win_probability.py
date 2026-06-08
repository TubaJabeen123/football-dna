
import numpy as np

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def calculate_win_probability(vectorA: dict, vectorB: dict) -> dict:
    # Zone-based scoring
    attack_diff     = vectorA.get("attack_score", 0)     - vectorB.get("attack_score", 0)
    midfield_diff   = vectorA.get("midfield_control", 0) - vectorB.get("midfield_control", 0)
    defense_diff    = vectorA.get("defense_score", 0)    - vectorB.get("defense_score", 0)
    pace_diff       = vectorA.get("pace_index", 0)       - vectorB.get("pace_index", 0)
    physical_diff   = vectorA.get("physical_index", 0)   - vectorB.get("physical_index", 0)

    # Weighted composite score
    composite = (
        attack_diff   * 0.30 +
        midfield_diff * 0.25 +
        defense_diff  * 0.25 +
        pace_diff     * 0.10 +
        physical_diff * 0.10
    )

    # Convert to probability
    win_a  = round(float(sigmoid(composite / 10)) * 100, 1)
    win_b  = round(float(sigmoid(-composite / 10)) * 100, 1)
    draw   = round(max(0, 100 - win_a - win_b + 20), 1)

    # Normalize to 100
    total = win_a + win_b + draw
    win_a  = round(win_a  / total * 100, 1)
    win_b  = round(win_b  / total * 100, 1)
    draw   = round(100 - win_a - win_b, 1)

    # Determine favored team
    if win_a > win_b + 5:
        verdict = "Team A Favored"
    elif win_b > win_a + 5:
        verdict = "Team B Favored"
    else:
        verdict = "Too Close to Call"

    return {
        "win_a": win_a,
        "win_b": win_b,
        "draw": draw,
        "verdict": verdict,
        "composite_score": round(float(composite), 2),
        "breakdown": {
            "attack_diff":   round(float(attack_diff), 1),
            "midfield_diff": round(float(midfield_diff), 1),
            "defense_diff":  round(float(defense_diff), 1),
            "pace_diff":     round(float(pace_diff), 1),
            "physical_diff": round(float(physical_diff), 1),
        }
    }