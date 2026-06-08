# ⚽ Football DNA — Scout Intelligence Platform

A full-stack football analytics web application that lets fans, coaches, and scouts compare players, analyze national team matchups, explore career projections, and discover similar playing styles — all powered by the FIFA 22 dataset.

![Stack](https://img.shields.io/badge/Stack-Next.js%20%2B%20FastAPI-blue?style=flat-square)
![Dataset](https://img.shields.io/badge/Dataset-FIFA%2022-green?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=flat-square)
![Node](https://img.shields.io/badge/Node-20%2B-green?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 🖼️ What It Does

Football DNA is a **SofaScore-style** analytics platform built on top of FIFA 22 player ratings. Designed for football fans, not data scientists — every number, chart, and prediction is explained in plain football language.

### Pages

| Page | What you can do |
|---|---|
| **Player Compare** | Search any two players by name, club, or country. See a radar chart, head-to-head attribute bars, playstyle tags, career projection curve, and similar players with scouting notes. |
| **World Cup Intelligence** | Select two national teams. Get their predicted best XI, formation view, squad comparison, key player matchups, tactical weaknesses, and a live scenario explorer. |
| **Global Football Index** | Six ranking tables — World Rankings, Best Attackers, Best Defenders, Rising Talents (U23), Pace & Power, Fan Index with voting. |

---

## ✨ Features

### Player Comparison Page

- **Search by name, club, or country** — three filter modes on each search box
- **Radar chart** — six-attribute spider chart, larger shape means stronger player in that area
- **Head-to-head bars** — each attribute compared side by side with plain English descriptions
- **Playstyle tags** — auto-generated labels like "Target Man", "Inverted Winger", "Box-to-Box", "High Potential" derived from attribute combinations
- **Career Progression Curve** — SVG chart projecting rating from now to retirement, shows current age (green), peak age (gold), and projected peak rating
- **Similar Players** — click any result to open a full profile with attribute bars showing +/- difference, a plain-English explanation of why they are similar, and a scouting note on whether they are a budget option or like-for-like replacement
- **Position on pitch** — mini football pitch showing where the player operates

### World Cup Intelligence Page

- **Best XI auto-selector** — picks the highest-rated available player for each of 11 positions
- **Formation Pitch View** — all 11 players rendered on a green SVG pitch in 4-2-3-1, dots colour-coded by rating
- **Squad Strength Prediction** — win probability with full analyst-language explanation, no maths formulas shown
- **Scenario Explorer** — toggle real-world factors (home advantage, rain, squad fatigue, high press, defensive block) and watch the prediction update live with plain-English zone analysis
- **Key Player Duels** — click any matchup card for a fan-friendly battle breakdown covering pace duel, aerial battle, 1v1 dribbling, finishing vs defending, with a clear verdict
- **Tactical Weaknesses** — identifies players where a key attribute for their role falls below the expected standard

### Global Football Index Page

- Six views: World Rankings, Best Attackers, Best Defenders, Rising Talents, Pace & Power, Fan Index
- Position chips and search filter on every view
- Fan voting — vote any player Overrated or Underrated, verdict updates in real time
- Playstyle tags and potential gap badges displayed in each row
- Medal icons for top 3 in each category

---

## 🗂️ Project Structure

```
football-dna/
│
├── backend/                        ← Python / FastAPI
│   ├── main.py                     ← All API routes
│   ├── data_loader.py              ← Loads and cleans FIFA 22 CSV
│   ├── team_builder.py             ← Builds best XI per nation
│   ├── matchup_engine.py           ← Role-based player duel scoring
│   ├── win_probability.py          ← Squad strength to win % model
│   ├── requirements.txt
│   └── data/
│       └── players_22.csv          ← FIFA 22 dataset (not in git)
│
├── frontend/                       ← React / Next.js 14
│   ├── app/
│   │   ├── page.tsx                ← Player comparison page
│   │   ├── worldcup/
│   │   │   └── page.tsx            ← World Cup intelligence page
│   │   ├── leaderboard/
│   │   │   └── page.tsx            ← Global Football Index page
│   │   ├── layout.tsx
│   │   └── globals.css             ← Dark theme + all CSS classes
│   ├── components/
│   │   └── Sidebar.tsx             ← Fixed left navigation
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml              ← CI/CD auto-deploy to EC2
│
└── README.md
```

---

## 🔧 Tech Stack

### Backend

| Technology | Purpose |
|---|---|
| **FastAPI** | REST API — fast, automatic docs at `/docs` |
| **Pandas** | Load, clean, and query the FIFA 22 dataset |
| **scikit-learn** | Cosine similarity for similar player matching |
| **NumPy** | Vector math for team strength and win probability |
| **Gunicorn + Uvicorn** | Production ASGI server |

### Frontend

| Technology | Purpose |
|---|---|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety across all components |
| **Recharts** | Radar charts for attribute comparison |
| **Pure SVG** | Career progression curves (no extra library, no conflicts) |
| **DM Sans** | Clean, modern typography via Google Fonts |
| **CSS custom properties** | Dark theme design tokens consistent across all pages |

### Infrastructure

| Technology | Purpose |
|---|---|
| **AWS EC2** | Ubuntu 22.04 server hosting both services |
| **Nginx** | Reverse proxy — routes `/api/*` to FastAPI, `/*` to Next.js |
| **PM2** | Process manager — keeps services alive, auto-restarts on crash |
| **Certbot** | Free HTTPS certificate via Let's Encrypt |
| **GitHub Actions** | CI/CD pipeline — auto-deploys on push to `main` |

---

## 🚀 Local Development

### Prerequisites

- Python 3.10 or above
- Node.js 20 or above
- FIFA 22 dataset: [kaggle.com/datasets/stefanoleone992/fifa-22-complete-player-dataset](https://www.kaggle.com/datasets/stefanoleone992/fifa-22-complete-player-dataset)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/football-dna.git
cd football-dna
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate — Windows:
venv\Scripts\activate
# Activate — Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Place your dataset
mkdir data
# Move players_22.csv into backend/data/players_22.csv

# Start the backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Visit `http://localhost:8000/docs` — you should see all routes listed and the terminal should show:

```
[data_loader] Loaded from data/players_22.csv — 18944 rows
[data_loader] Pace non-zero: 16892
```

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend

npm install

# Create local environment file
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" > .env.local

npm run dev
```

Visit `http://localhost:3000`.

---

## 🔌 API Endpoints

### Players

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/players` | All players — name, club, nation, overall, all 6 stats |
| `GET` | `/api/player/{name}` | Full profile for one player |
| `POST` | `/api/compare` | Compare two players. Body: `{"player1": "L. Messi", "player2": "Cristiano Ronaldo"}` |
| `GET` | `/api/similar/{name}` | Top 5 most similar players by cosine similarity |

### World Cup

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/nations` | All available nationalities |
| `GET` | `/api/team/{nation}` | Best XI, team vector, and weaknesses for a nation |
| `POST` | `/api/match` | Full match analysis. Body: `{"teamA": "Brazil", "teamB": "France"}` |

### Sample `/api/match` response

```json
{
  "teamA": {
    "nation": "Brazil",
    "lineup": [{ "short_name": "Alisson", "role": "GK", "overall": 91 }, "..."],
    "vector": { "attack_score": 84.2, "midfield_control": 79.1, "defense_score": 76.4 },
    "weaknesses": [{ "player": "Danilo", "role": "RB", "weakness": "pace", "value": 63, "severity": "Medium" }]
  },
  "teamB": { "..." },
  "key_duels": [
    { "attacker": "Vinicius Jr", "attacker_role": "LW", "defender": "Hernandez", "defender_role": "RB", "advantage_pct": 64.2, "winner": "Vinicius Jr", "insight": "..." }
  ],
  "win_probability": {
    "win_a": 44.1,
    "win_b": 37.9,
    "draw": 18.0,
    "verdict": "Brazil Slightly Favored",
    "breakdown": { "attack_diff": 3.1, "midfield_diff": 1.8, "defense_diff": -0.9, "pace_diff": 2.2, "physical_diff": 0.4 }
  }
}
```

---

## 🧠 How the Models Work

### Similar Players — Cosine Similarity

Each player is a 6-dimensional vector of their attributes. Cosine similarity measures the angle between two vectors. A score of 1.0 (100%) means the players have identical attribute ratios regardless of overall rating level — a 65-rated player and an 85-rated player can be highly similar if they have the same balance of pace, technique, and physicality. This makes the feature genuinely useful for finding budget replacements with the same playing style.

### Win Probability — Weighted Zone Model

Five zone scores are computed per team:

```
Attack    (weight 30%) = average shooting of forwards
Midfield  (weight 25%) = average passing of central midfielders
Defense   (weight 25%) = average defending of backline
Pace      (weight 10%) = average pace of full XI
Physical  (weight 10%) = average physic of full XI
```

Team A minus Team B across all zones gives a composite score. A sigmoid function converts this to a probability between 0 and 100%. Small differences produce near-50/50 splits; large differences shift the probability meaningfully. The result is labelled with a confidence level and explained in plain football language — no formulas are shown to the user.

> This model is a **squad strength indicator** based on FIFA 22 ratings only. It does not account for form, injuries, real tactics, or any live match data.

### Playstyle Tags — Attribute Thresholds

Tags are derived from attribute combinations. Examples:

```
"Target Man"       → shooting ≥ 82  and  physic ≥ 78  and  pace < 80
"Inverted Winger"  → dribbling ≥ 85  and  pace ≥ 80
"Ball-Winner"      → defending ≥ 75  and  physic ≥ 78  and  passing ≥ 72
"High Potential"   → potential − overall ≥ 8  and  age ≤ 23
"World Class"      → overall ≥ 88
```

### Career Curve — Projection Model

A growth-to-peak-to-decline curve is generated from three data points: current age, overall rating, and potential ceiling. Peak age is estimated from potential (higher potential = later peak). Growth before peak follows a power curve. Decline after peak is linear at a rate based on quality tier. Everything is rendered as a pure SVG with no recharts dependency.

---

## ☁️ Deployment on AWS EC2

### Architecture

```
Internet (port 80/443)
    │
    ▼
Nginx
    ├── /api/*  →  Gunicorn + FastAPI  (port 8000)
    └── /*      →  PM2 + Next.js       (port 3000)
```

### Steps Summary

1. Launch EC2 Ubuntu 22.04, open ports 80 and 443 in Security Group
2. SSH in and install Python, Node.js 20, Nginx, PM2
3. Upload `players_22.csv` via `scp` to the server
4. Clone repo, set up virtual environment, install backend dependencies
5. Build the Next.js frontend with `npm run build`
6. Start both services with PM2, then run `pm2 startup` to persist across reboots
7. Configure Nginx as reverse proxy for both services
8. Run `sudo nginx -t` to validate config, then `sudo systemctl restart nginx`
9. Optionally point a domain at the IP and run `certbot` for free HTTPS
10. Add GitHub Actions deploy workflow with EC2 SSH secrets

### Auto-Deploy Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to EC2

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /home/ubuntu/football-dna
            git pull origin main
            cd backend && source venv/bin/activate && pip install -r requirements.txt -q
            pm2 restart football-backend
            cd ../frontend && npm ci -q && npm run build
            pm2 restart football-frontend
```

Required GitHub Secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.

---

## 📦 Dataset

Download **FIFA 22 Complete Player Dataset** from Kaggle (free account required):

```
https://www.kaggle.com/datasets/stefanoleone992/fifa-22-complete-player-dataset
```

File needed: `players_22.csv`
Place at: `backend/data/players_22.csv`
Size: approximately 75 MB, 18,944 players

The dataset is not included in this repository.

---

## 🤝 Contributing

Pull requests are welcome. For major changes open an issue first to discuss the idea.

```bash
# Create a branch
git checkout -b feature/your-feature-name

# Make changes, then
git add .
git commit -m "add: description of your change"
git push origin feature/your-feature-name

# Open a pull request on GitHub
```

---

## 📄 License

MIT — free to use, modify, and distribute with attribution.

---

## 👤 About This Project

Built as a portfolio project demonstrating:

- FastAPI REST API design with Pydantic models and automatic documentation
- React / Next.js 14 with TypeScript and App Router
- Machine learning integration — cosine similarity, sigmoid probability modelling
- Data engineering with Pandas on a real-world dataset of 18,000+ records
- Pure SVG data visualisation without library dependencies
- AWS EC2 production deployment with Nginx reverse proxy and PM2
- Automated CI/CD pipeline with GitHub Actions

---

## 🔮 Potential Future Upgrades

- Real match data integration via FBref or StatsBomb public APIs
- Expected Goals (xG) based on actual shot location data
- Form ratings updated from recent match results
- Elo-based international team rankings
- Multi-season career data for accurate progression modelling
- Mobile-first layout improvements
- Player image search and recognition