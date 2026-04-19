import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../api.js'

const EXAMPLES = [
  { label: 'Fitness',      text: "I've been going to the gym for 3 months now. My bench press went from 60kg to 80kg. Should I increase protein intake or focus more on progressive overload?" },
  { label: 'Depression',   text: "I've been feeling really low lately. Nothing brings me joy anymore and I feel completely disconnected from everyone around me. I don't know how to talk about it." },
  { label: 'AITAH',        text: "My sister borrowed ₹20,000 from me six months ago and still hasn't paid me back. I brought it up at dinner and now the whole family is angry at me. AITA?" },
  { label: 'Gaming',       text: "Just finished Elden Ring for the first time. The final boss took me 3 hours but I finally beat it. The lore is incredible. What should I play next?" },
  { label: 'Mumbai',       text: "The traffic on the Western Express Highway is absolutely insane today. BMC really needs to fix the potholes near Andheri station." },
  { label: 'JEENEETards',  text: "Got 94 percentile in JEE Mains. Is NIT Trichy CSE possible? Should I drop for another attempt or join? Parents are pressuring me a lot." },
]

const SUB_COLORS = {
  AITAH: '#e85d04', AskReddit: '#f48c06', Btechtards: '#dc2f02',
  Fitness: '#d62828', JEENEETards: '#9d0208', cats: '#f3722c',
  depression: '#4a4e69', gaming: '#22577a', mumbai: '#38a3a5',
  relationship_advice: '#57cc99',
}

export default function Classifier() {
  const [text, setText]     = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState(null)

  async function classify() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await api.classify(text)
      if (data.detail) throw new Error(data.detail)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          TF-IDF + Logistic Regression · 10-class · 64% accuracy
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          Subreddit Classifier
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          Type any text and the model predicts which subreddit it came from.
        </p>
      </motion.div>

      {/* Examples */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {EXAMPLES.map(({ label, text: t }) => (
          <button key={label} onClick={() => { setText(t); setResult(null) }} style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.72rem', padding: '0.35rem 0.8rem',
            background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '20px',
            color: 'var(--muted)', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--muted)' }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <textarea
          value={text}
          onChange={e => { setText(e.target.value); setResult(null) }}
          placeholder="Type something... e.g. 'I haven't been sleeping well and feel disconnected from everyone'"
          rows={5}
          style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: '12px', padding: '1rem', color: 'var(--text)',
            fontFamily: 'var(--font-body)', fontSize: '0.95rem', lineHeight: 1.6,
            resize: 'vertical', outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = 'var(--border)'}
          onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) classify() }}
        />
      </div>

      <button
        onClick={classify}
        disabled={!text.trim() || loading}
        style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
          padding: '0.7rem 2rem', background: loading ? 'var(--border)' : 'var(--accent)',
          color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s', letterSpacing: '0.01em',
        }}
      >
        {loading ? 'Classifying...' : 'Predict Subreddit →'}
      </button>

      {error && (
        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#1a0a0a', border: '1px solid #440000', borderRadius: '8px', color: '#ff6b6b', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: '2rem' }}>

            {/* Prediction */}
            <div style={{
              background: 'var(--surface)', border: `2px solid ${SUB_COLORS[result.prediction] || 'var(--accent)'}`,
              borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '2rem',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Predicted subreddit
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 800, color: SUB_COLORS[result.prediction] || 'var(--accent)', letterSpacing: '-0.02em' }}>
                r/{result.prediction}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.5rem' }}>
                {result.confidence}% confidence
              </div>
            </div>

            {/* Probability bars */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>
              Confidence breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {result.probabilities.map(({ subreddit, probability }) => (
                <div key={subreddit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: subreddit === result.prediction ? 'var(--accent)' : 'var(--muted)', width: '160px', flexShrink: 0 }}>
                    r/{subreddit}
                  </div>
                  <div style={{ flex: 1, background: 'var(--surface2)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${probability * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      style={{ height: '100%', background: subreddit === result.prediction ? (SUB_COLORS[subreddit] || 'var(--accent)') : '#333', borderRadius: '4px' }}
                    />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', width: '44px', textAlign: 'right' }}>
                    {(probability * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Model performance images */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} style={{ marginTop: '4rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Model performance
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {[
            { src: api.plotUrl('confusion_matrix.png'), title: 'Confusion Matrix' },
            { src: api.plotUrl('top_features.png'),     title: 'Top Features per Subreddit' },
          ].map(({ src, title }) => (
            <div key={title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>
                {title}
              </div>
              <img src={src} alt={title} style={{ width: '100%', display: 'block' }} />
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
