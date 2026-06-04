from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from data_loader import df
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # ← allow ALL origins during development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route 1 — Get all player names for search dropdown
@app.get("/api/players")
def get_players():
    players = df[['short_name', 'club_name', 
                  'nationality_name', 'overall']].fillna("Unknown").to_dict(orient="records")
    return {"players": players}


# Route 2 — Get single player full stats
@app.get("/api/player/{name}")
def get_player(name: str):
    player = df[df['short_name'] == name].iloc[0].to_dict()
    # Replace NaN with None
    player = {k: (None if isinstance(v, float) and np.isnan(v) else v) for k, v in player.items()}
    return player


# Route 3 — Compare two players
@app.post("/api/compare")
def compare_players(data: dict):
    import numpy as np
    def clean(row):
        return {k: (None if isinstance(v, float) and np.isnan(v) else v) for k, v in row.items()}
    
    p1 = clean(df[df['short_name'] == data['player1']].iloc[0].to_dict())
    p2 = clean(df[df['short_name'] == data['player2']].iloc[0].to_dict())
    return {"player1": p1, "player2": p2}


# Route 4 — Find similar players
@app.get("/api/similar/{name}")
def find_similar(name: str):
    attributes = ['pace', 'shooting', 'passing', 
                  'dribbling', 'defending', 'physic']
    target = df[df['short_name'] == name][attributes].values
    all_stats = df[attributes].fillna(0).values
    scores = cosine_similarity(target, all_stats)[0]
    df['similarity'] = scores
    results = df.sort_values('similarity', ascending=False)[1:6]
    return results[['short_name', 'club_name', 
                     'overall', 'similarity']].to_dict(orient="records")