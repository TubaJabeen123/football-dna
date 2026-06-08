"""
similarity.py — Player similarity utilities using cosine similarity.
Used by the /api/similar/{name} endpoint in main.py.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity as _cosine_similarity

STAT_COLS = ["pace", "shooting", "passing", "dribbling", "defending", "physic"]


def compute_similarity_scores(target_row, all_rows) -> np.ndarray:
    """
    Return cosine similarity scores between target_row (1 x N) and all_rows (M x N).
    Both inputs should already be filled with 0 for NaN.
    """
    return _cosine_similarity(target_row, all_rows)[0]


def find_similar_players(df, player_name: str, n: int = 5) -> list:
    """
    Given a DataFrame and a player name, return the top-n most similar players
    (excluding the player themselves) as a list of dicts with keys:
        short_name, club_name, overall, similarity
    """
    results = df[df["short_name"] == player_name]
    if results.empty:
        return []

    target = results[STAT_COLS].fillna(0).values
    all_stats = df[STAT_COLS].fillna(0).values
    scores = compute_similarity_scores(target, all_stats)

    temp = df.copy()
    temp["similarity"] = scores

    similar = (
        temp[temp["short_name"] != player_name]
        .sort_values("similarity", ascending=False)
        .head(n)
    )

    return (
        similar[["short_name", "club_name", "overall", "similarity"]]
        .fillna("Unknown")
        .to_dict(orient="records")
    )
