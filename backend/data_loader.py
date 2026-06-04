import pandas as pd
import numpy as np

def load_players():
    df = pd.read_csv("data/players_22.csv", low_memory=False)
    
    cols = ['short_name', 'long_name', 'age', 'club_name',
            'nationality_name', 'overall', 'potential', 'player_positions',
            'pace', 'shooting', 'passing', 'dribbling', 
            'defending', 'physic', 'player_face_url']
    
    df = df[cols].dropna(subset=['short_name'])
    
    # ← THIS is the fix: replace all NaN with None (JSON-safe)
    df = df.where(pd.notnull(df), None)
    
    return df

df = load_players()