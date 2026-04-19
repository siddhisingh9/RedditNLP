# Reddit Linguistic Ecosystem

A fullstack NLP web app exploring linguistic identity across 10 subreddits.

**Stack:** FastAPI · React · Vite · Render · Vercel

---

## Project structure

```
reddit-nlp/
    backend/
        main.py             ← FastAPI app
        requirements.txt
        tfidf.pkl           ← add this
        classifier.pkl      ← add this
        w2v_models/         ← add this folder
        eda_plots/          ← add this folder
    frontend/
        src/
            pages/
                Overview.jsx
                Classifier.jsx
                WordExplorer.jsx
                EDADashboard.jsx
        package.json
        vercel.json
    render.yaml
```

---

## Local setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
# create .env.local with:
# VITE_API_URL=http://localhost:8000
npm run dev
# runs on http://localhost:5173
```

---

## Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/reddit-nlp.git
git push -u origin main
```

### 2. Deploy backend on Render
1. Go to render.com → New → Web Service
2. Connect your GitHub repo
3. Set root directory to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Copy the Render URL (e.g. `https://reddit-nlp-backend.onrender.com`)

### 3. Deploy frontend on Vercel
1. Go to vercel.com → New Project
2. Connect your GitHub repo
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=https://your-render-url.onrender.com`
5. Deploy

---

## Features

| Page | Description |
|------|-------------|
| Overview | Project summary, stats, pipeline, key findings |
| Classifier | Type text → predict subreddit with confidence bars |
| Word Explorer | See how the same word means different things per subreddit |
| EDA Dashboard | Browse all 14 EDA visualisations |
