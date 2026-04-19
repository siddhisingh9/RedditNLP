from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import pickle
import numpy as np
import os
import nltk

nltk.download("stopwords", quiet=True)
nltk.download("punkt", quiet=True)
nltk.download("punkt_tab", quiet=True)
nltk.download("wordnet", quiet=True)

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from gensim.models import Word2Vec

app = FastAPI(title="Reddit NLP API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── SERVE PLOTS ──────────────────────────────────────────────────────────────

if os.path.exists("eda_plots"):
    app.mount("/plots", StaticFiles(directory="eda_plots"), name="plots")

# ─── STOPWORDS ────────────────────────────────────────────────────────────────

HINGLISH_STOPWORDS = {
    "hai","hain","tha","thi","hoga","hogi","nahi","nah","nai","na","mat",
    "kya","kyu","kyun","kyunki","kaise","kab","kahan","kaun","aur","ya",
    "lekin","par","toh","ki","ka","ke","ko","se","mein","pe","tak","bhi",
    "hi","sirf","bas","main","mujhe","mera","meri","mere","hum","humara",
    "tu","tum","tumhara","aap","apna","apni","apne","yeh","ye","woh","wo",
    "iska","uska","inka","unka","ek","do","teen","bahut","thoda","zyada",
    "kam","accha","theek","sahi","galat","achha","acha","bhai","yaar",
    "bc","haha","lol","lmao",
}

FILLER_WORDS = {
    "get","got","getting","said","say","saying","says","go","going","went",
    "gone","come","came","coming","make","made","making","know","knew",
    "knowing","think","thought","thinking","want","wanted","wanting","use",
    "used","using","see","saw","seen","seeing","look","looked","looking",
    "feel","felt","feeling","take","took","taken","taking","put","putting",
    "give","gave","given","giving","keep","kept","keeping","let","letting",
    "need","needed","needing","try","tried","trying","call","called",
    "calling","tell","told","telling","ask","asked","asking","seem",
    "seemed","seeming","thing","things","something","anything","everything",
    "nothing","people","person","way","time","year","day","lot","bit",
}

STOPWORDS_SET = set(stopwords.words("english")) | {
    "reddit","www","http","https","com","amp","gt","like","just"
} | HINGLISH_STOPWORDS | FILLER_WORDS

lemmatizer = WordNetLemmatizer()

def preprocess(text: str) -> str:
    if not isinstance(text, str):
        return ""
    text = text.lower()
    tokens = word_tokenize(text)
    tokens = [
        lemmatizer.lemmatize(w) for w in tokens
        if w.isalpha() and w not in STOPWORDS_SET and len(w) > 2
    ]
    return " ".join(tokens)

# ─── LOAD MODELS ──────────────────────────────────────────────────────────────

print("Loading models...")

with open("tfidf.pkl", "rb") as f:
    tfidf = pickle.load(f)

with open("classifier.pkl", "rb") as f:
    clf = pickle.load(f)

w2v_models = {}
if os.path.exists("w2v_models"):
    for fname in os.listdir("w2v_models"):
        if fname.endswith(".model"):
            sub = fname.replace(".model", "")
            w2v_models[sub] = Word2Vec.load(f"w2v_models/{fname}")

print(f"Loaded classifier, tfidf, and {len(w2v_models)} Word2Vec models.")

SUBREDDITS = sorted([
    "AITAH", "AskReddit", "Btechtards", "Fitness", "JEENEETards",
    "cats", "depression", "gaming", "mumbai", "relationship_advice"
])

COMPARE_WORDS = [
    "work", "money", "help", "life", "body",
    "college", "friend", "study", "gym", "sad"
]

# ─── SCHEMAS ──────────────────────────────────────────────────────────────────

class TextInput(BaseModel):
    text: str

class WordInput(BaseModel):
    word: str
    topn: int = 7

# ─── ROUTES ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "Reddit NLP API"}

@app.get("/subreddits")
def get_subreddits():
    return {"subreddits": SUBREDDITS}

@app.get("/compare-words")
def get_compare_words():
    return {"words": COMPARE_WORDS}

@app.post("/classify")
def classify(payload: TextInput):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    cleaned = preprocess(payload.text)
    if not cleaned.strip():
        raise HTTPException(status_code=400, detail="Text has no meaningful content after preprocessing")

    vec   = tfidf.transform([cleaned])
    pred  = clf.predict(vec)[0]
    probs = clf.predict_proba(vec)[0]

    results = [
        {"subreddit": cls, "probability": round(float(prob), 4)}
        for cls, prob in zip(clf.classes_, probs)
    ]
    results.sort(key=lambda x: x["probability"], reverse=True)

    return {
        "prediction":  pred,
        "confidence":  round(float(max(probs)) * 100, 1),
        "probabilities": results
    }

@app.post("/word-explorer")
def word_explorer(payload: WordInput):
    word = payload.word.strip().lower()
    if not word:
        raise HTTPException(status_code=400, detail="Word cannot be empty")

    results = {}
    not_found = []

    for sub, model in w2v_models.items():
        if word in model.wv:
            similar = model.wv.most_similar(word, topn=payload.topn)
            results[sub] = [{"word": w, "score": round(float(s), 3)} for w, s in similar]
        else:
            not_found.append(sub)

    if not results:
        raise HTTPException(status_code=404, detail=f"'{word}' not found in any subreddit vocabulary")

    return {
        "word":      word,
        "results":   results,
        "not_found": not_found,
        "has_plot":  os.path.exists(f"eda_plots/word_similarity_{word}.png")
    }

@app.get("/plots")
def list_plots():
    if not os.path.exists("eda_plots"):
        return {"plots": []}
    plots = [f for f in os.listdir("eda_plots") if f.endswith(".png")]
    return {"plots": sorted(plots)}

@app.get("/stats")
def get_stats():
    return {
        "total_subreddits": len(SUBREDDITS),
        "classifier_accuracy": 64.13,
        "topics_discovered": 18,
        "vocab_size": len(tfidf.vocabulary_),
        "w2v_models": len(w2v_models),
    }
