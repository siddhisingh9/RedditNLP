import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api.js'

const SUBREDDITS = [
  { name: 'AITAH',               desc: 'Relationship verdicts',    color: '#e85d04' },
  { name: 'AskReddit',           desc: 'Open questions',           color: '#f48c06' },
  { name: 'Btechtards',          desc: 'Indian engineering',       color: '#dc2f02' },
  { name: 'Fitness',             desc: 'Health & workouts',        color: '#d62828' },
  { name: 'JEENEETards',         desc: 'Indian entrance exams',    color: '#9d0208' },
  { name: 'cats',                desc: 'Cat content',              color: '#f3722c' },
  { name: 'depression',          desc: 'Mental health support',    color: '#4a4e69' },
  { name: 'gaming',              desc: 'Video games',              color: '#22577a' },
  { name: 'mumbai',              desc: 'Mumbai city life',         color: '#38a3a5' },
  { name: 'relationship_advice', desc: 'Relationship help',        color: '#57cc99' },
]

const FINDINGS = [
  { icon: '🏋️', text: 'r/Fitness is the most linguistically distinct subreddit (F1: 0.83)' },
  { icon: '😔', text: 'r/depression uses "life" with: suck, sad, worth — starkly negative associations' },
  { icon: '💬', text: 'r/relationship_advice links "help" to: therapy, therapist, professional' },
  { icon: '🇮🇳', text: 'r/JEENEETards & r/Btechtards share significant vocabulary — same cultural origin' },
  { icon: '🗣️', text: 'Hinglish text forms its own BERTopic cluster — a distinct linguistic fingerprint' },
  { icon: '🎮', text: 'r/gaming & r/AskReddit are hardest to separate — both casual & conversational' },
]

function StatCard({ value, label, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '1.5rem', textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </div>
    </motion.div>
  )
}

export default function Overview() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.stats().then(setStats).catch(() => {})
  }, [])

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: '1rem', textTransform: 'uppercase' }}>
          NLP · Machine Learning · Community Analysis
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: '1.25rem' }}>
          Reddit as a<br />
          <span style={{ color: 'var(--accent)' }}>Linguistic Ecosystem</span>
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--muted)', maxWidth: '560px', lineHeight: 1.7 }}>
          Mapping community identity across 10 subreddits using TF-IDF classification,
          BERTopic modelling, and Word2Vec embeddings.
        </p>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', margin: '3rem 0' }}>
        <StatCard value={stats ? stats.total_subreddits : '10'} label="Subreddits"         delay={0.1} />
        <StatCard value={stats ? `${stats.classifier_accuracy}%` : '64%'} label="Classifier Accuracy" delay={0.2} />
        <StatCard value={stats ? `${stats.topics_discovered}+` : '18+'} label="Topics Discovered" delay={0.3} />
        <StatCard value={stats ? stats.vocab_size.toLocaleString() : '—'} label="Vocabulary Size"    delay={0.4} />
      </div>

      {/* Pipeline */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text)' }}>
          Pipeline
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {['Data Collection', 'Cleaning', 'EDA', 'Preprocessing', 'TF-IDF Classifier', 'BERTopic', 'Word2Vec'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                background: i >= 4 ? 'var(--accent)' : 'var(--surface2)',
                border: `1px solid ${i >= 4 ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '8px', padding: '0.5rem 0.9rem', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: i >= 4 ? 'white' : 'var(--muted)',
              }}>
                {step}
              </div>
              {i < 6 && <div style={{ color: 'var(--border)', padding: '0 0.3rem', fontSize: '1.2rem' }}>→</div>}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Subreddits */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} style={{ marginTop: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Communities studied
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {SUBREDDITS.map(({ name, desc, color }, i) => (
            <motion.div key={name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i + 0.6 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '0.9rem 1rem',
                borderLeft: `3px solid ${color}`,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500, color: 'var(--text)', marginBottom: '0.2rem' }}>
                r/{name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Key Findings */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ marginTop: '3rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Key findings
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '0.75rem' }}>
          {FINDINGS.map(({ icon, text }, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.8 }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '1rem 1.1rem',
                display: 'flex', gap: '0.8rem', alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: '0.88rem', color: 'var(--muted)', lineHeight: 1.55 }}>{text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
