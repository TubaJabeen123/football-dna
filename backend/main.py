from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from data_loader import df
from team_builder import get_nations, get_best_xi, get_team_vector
from matchup_engine import get_key_duels, get_weaknesses
from win_probability import calculate_win_probability

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def clean_row(row: dict) -> dict:
    return {k: (None if isinstance(v, float) and np.isnan(v) else v) for k, v in row.items()}

# ── Existing Routes ──────────────────────────────────────

@app.get("/api/players")
def get_players():
    cols = ['short_name', 'club_name', 'nationality_name', 'player_positions',
            'overall', 'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic']
    subset = df[cols].copy()
    subset = subset.fillna({"club_name":"Unknown","nationality_name":"Unknown","player_positions":""})
    for col in ['overall','pace','shooting','passing','dribbling','defending','physic']:
        subset[col] = pd.to_numeric(subset[col], errors='coerce').fillna(0).astype(int)
    players = subset.to_dict(orient="records")
    return {"players": players}

@app.get("/api/player/{name}")
def get_player(name: str):
    results = df[df['short_name'] == name]
    if results.empty:
        raise HTTPException(status_code=404, detail="Player not found")
    return clean_row(results.iloc[0].to_dict())

@app.post("/api/compare")
def compare_players(data: dict):
    p1 = df[df['short_name'] == data['player1']]
    p2 = df[df['short_name'] == data['player2']]
    if p1.empty or p2.empty:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"player1": clean_row(p1.iloc[0].to_dict()), "player2": clean_row(p2.iloc[0].to_dict())}

@app.get("/api/similar/{name}")
def find_similar(name: str):
    from sklearn.metrics.pairwise import cosine_similarity
    attributes = ['pace','shooting','passing','dribbling','defending','physic']
    results = df[df['short_name'] == name]
    if results.empty:
        raise HTTPException(status_code=404, detail="Player not found")
    target = results[attributes].fillna(0).values
    all_stats = df[attributes].fillna(0).values
    scores = cosine_similarity(target, all_stats)[0]
    temp = df.copy()
    temp['similarity'] = scores
    similar = temp.sort_values('similarity', ascending=False)[1:6]
    return similar[['short_name','club_name','overall','similarity']].fillna("Unknown").to_dict(orient="records")

# ── World Cup Routes ─────────────────────────────────────

@app.get("/api/nations")
def get_all_nations():
    return {"nations": get_nations()}

@app.get("/api/team/{nation}")
def get_team(nation: str):
    lineup = get_best_xi(nation)
    if not lineup:
        raise HTTPException(status_code=404, detail="Nation not found")
    return {"nation": nation, "lineup": lineup, "team_vector": get_team_vector(lineup), "weaknesses": get_weaknesses(lineup)}

@app.post("/api/match")
def analyze_match(data: dict):
    nation_a, nation_b = data.get("teamA"), data.get("teamB")
    lineup_a, lineup_b = get_best_xi(nation_a), get_best_xi(nation_b)
    if not lineup_a or not lineup_b:
        raise HTTPException(status_code=404, detail="One or both nations not found")
    vector_a, vector_b = get_team_vector(lineup_a), get_team_vector(lineup_b)
    return {
        "teamA": {"nation": nation_a, "lineup": lineup_a, "vector": vector_a, "weaknesses": get_weaknesses(lineup_a)},
        "teamB": {"nation": nation_b, "lineup": lineup_b, "vector": vector_b, "weaknesses": get_weaknesses(lineup_b)},
        "key_duels": get_key_duels(lineup_a, lineup_b),
        "win_probability": calculate_win_probability(vector_a, vector_b),
    }