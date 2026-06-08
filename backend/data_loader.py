import pandas as pd
import numpy as np

STAT_COLS = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic']

REQUIRED_COLS = [
    'short_name', 'long_name', 'age', 'club_name',
    'nationality_name', 'player_positions', 'overall', 'potential',
    'player_face_url',
] + STAT_COLS

def load_players():
    # Try both common paths
    for path in [
        "data/players_22.csv", "players_22.csv",
        "data/players_21.csv", "players_21.csv",
    ]:
        try:
            raw = pd.read_csv(path, low_memory=False)
            print(f"[data_loader] Loaded from {path} — {len(raw)} rows, {len(raw.columns)} cols")
            print(f"[data_loader] Columns sample: {list(raw.columns[:20])}")

            # Keep only columns that exist
            cols = [c for c in REQUIRED_COLS if c in raw.columns]
            missing = [c for c in REQUIRED_COLS if c not in raw.columns]
            if missing:
                print(f"[data_loader] WARNING — missing columns: {missing}")

            df = raw[cols].copy()

            # Ensure stat cols are numeric integers, NaN → 0
            for col in STAT_COLS:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

            # Overall and potential
            for col in ['overall', 'potential', 'age']:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)

            # String cols — fill NaN with empty string
            for col in ['short_name', 'long_name', 'club_name', 'nationality_name',
                        'player_positions', 'player_face_url']:
                if col in df.columns:
                    df[col] = df[col].fillna("").astype(str)

            # Drop rows with no name
            df = df[df['short_name'].str.strip() != ""]

            print(f"[data_loader] Final: {len(df)} players")
            print(f"[data_loader] Pace non-zero: {(df['pace'] > 0).sum() if 'pace' in df.columns else 'N/A'}")
            print(f"[data_loader] Shooting non-zero: {(df['shooting'] > 0).sum() if 'shooting' in df.columns else 'N/A'}")
            return df

        except FileNotFoundError:
            continue
        except Exception as e:
            print(f"[data_loader] Error loading {path}: {e}")
            continue

    raise FileNotFoundError(
        "Could not find players_22.csv. "
        "Place it in backend/data/players_22.csv"
    )

df = load_players()