import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api.js'

const SUB_COLORS = {
  AITAH: '#e85d04', AskReddit: '#f48c06', Btechtards: '#dc2f02',
  Fitness: '#d62828', JEENEETards: '#9d0208', cats: '#f3722c',
  depression: '#4a4e69', gaming: '#22577a', mumbai: '#38a3a5',
  relationship_advice: '#57cc99',
}

export default function WordExplorer() {
  const [word, setWord]         = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [presets, setPresets]   = useState([])
  const [activePreset, setActivePreset] = useState(null)

  useEffect(() => {
    api.compareWords().then(d => setPresets(d.words || [])).catch(() => {})
  }, [])

  async function explore(w) {
    const target = w || word.trim().toLowerCase()
    if (!target) return
    setLoading(true)
    setError(null)
    setResult(null)
    setActivePreset(target)
    try {
      const data = await api.wordExplorer(target)
      if (data.detail) throw new Error(data.detail)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          Word2Vec · Per-subreddit embeddings · Semantic comparison
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Word Explorer
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          See how the same word carries different meanings across communities.
        </p>
      </motion.div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          value={word}
          onChange={e => setWord(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && explore()}
          placeholder="Type a word..."
          style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px',
            padding: '0.65rem 1rem', color: 'var(--text)', fontFamily: 'var(--font-body)',
            fontSize: '0.95rem', outline: 'none', minWidth: '200px', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
        />
        <button onClick={() => explore()} disabled={!word.trim() || loading} style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem',
          padding: '0.65rem 1.5rem', background: 'var(--accent)', color: 'white',
          border: 'none', borderRadius: '8px', cursor: 'pointer',
        }}>
          {loading ? '...' : 'Explore →'}
        </button>
      </div>

      {/* Preset chips */}
      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {presets.map(p => (
            <button key={p} onClick={() => { setWord(p); explore(p) }} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.3rem 0.75rem',
              background: activePreset === p ? 'var(--accent)' : 'var(--surface2)',
              border: `1px solid ${activePreset === p ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '20px', color: activePreset === p ? 'white' : 'var(--muted)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #440000', borderRadius: '8px', color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

            {/* Word header */}
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)' }}>
                "{result.word}"
              </h2>
              {result.not_found?.length > 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                  not in: {result.not_found.join(', ')}
                </span>
              )}
            </div>

            {/* Subreddit cards grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
              {Object.entries(result.results)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([sub, words], i) => (
                  <motion.div key={sub}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    style={{
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: '12px', padding: '1.1rem',
                      borderTop: `3px solid ${SUB_COLORS[sub] || 'var(--accent)'}`,
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 500, color: SUB_COLORS[sub] || 'var(--accent)', marginBottom: '0.75rem' }}>
                      r/{sub}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {words.map(({ word: w, score }) => (
                        <span key={w} style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                          padding: '0.25rem 0.6rem', borderRadius: '4px',
                          background: 'var(--surface2)', color: 'var(--text)',
                          border: '1px solid var(--border)',
                          opacity: 0.5 + score * 0.5,
                        }}>
                          {w}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Similarity heatmap if available */}
            {result.has_plot && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                  Cosine similarity of "{result.word}" embeddings across subreddits
                </div>
                <img
                  src={api.plotUrl(`word_similarity_${result.word}.png`)}
                  alt={`Word similarity heatmap for ${result.word}`}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            {/* t-SNE */}
            <div style={{ marginTop: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                t-SNE — word embedding space per subreddit
              </div>
              <img
                src={api.plotUrl('tsne_embeddings.png')}
                alt="t-SNE embeddings"
                style={{ width: '100%', display: 'block' }}
              />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
