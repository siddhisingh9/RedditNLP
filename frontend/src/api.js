const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = {
  classify:     (text)         => fetch(`${BASE}/classify`,      { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text }) }).then(r => r.json()),
  wordExplorer: (word, topn=7) => fetch(`${BASE}/word-explorer`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ word, topn }) }).then(r => r.json()),
  stats:        ()             => fetch(`${BASE}/stats`).then(r => r.json()),
  plots:        ()             => fetch(`${BASE}/plots`).then(r => r.json()),
  plotUrl:      (filename)     => `${BASE}/plots/${filename}`,
  compareWords: ()             => fetch(`${BASE}/compare-words`).then(r => r.json()),
}
