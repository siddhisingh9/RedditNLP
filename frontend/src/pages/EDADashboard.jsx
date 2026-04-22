import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api.js'

const PLOT_META = {
  'wordclouds.png':           { title: 'Word Clouds',                  desc: 'Most frequent words per subreddit visualised as word clouds' },
  'top_words.png':            { title: 'Top Words',                    desc: 'Top 15 most frequent words per subreddit' },
  'unique_words.png':         { title: 'Most Unique Words',            desc: 'Words that are most exclusive to each subreddit' },
  'similarity_heatmap.png':   { title: 'Subreddit Similarity',         desc: 'TF-IDF cosine similarity between subreddit corpora' },
  'post_text_length.png':     { title: 'Post Length Distribution',     desc: 'Distribution of post text lengths by subreddit' },
  'comment_length.png':       { title: 'Comment Length Distribution',  desc: 'Distribution of comment lengths by subreddit' },
  'score_distribution.png':   { title: 'Score Distribution',           desc: 'Post upvote score distribution per subreddit' },
  'score_vs_length.png':      { title: 'Score vs Text Length',         desc: 'Does longer text mean more upvotes?' },
  'comment_time_patterns.png':{ title: 'Comment times',                desc: 'Hourly comment activity per subreddit' },
  'night_owl.png':            { title: 'Night Owl Index',              desc: '% of posts published between 11pm–5am UTC' },
  'topic_distribution.png':   { title: 'Topic Distribution',           desc: 'BERTopic topics discovered per subreddit' },
  'vocab_richness.png':       { title: 'Vocabulary Richness',          desc: 'Unique word count and lexical diversity per subreddit' },
  'comment_stats.png':        { title: 'Comment Stats',                desc: 'Average comments per post and score vs comment count' },
}

const CATEGORIES = {
  'Text & Vocabulary': ['wordclouds.png', 'top_words.png', 'unique_words.png', 'vocab_richness.png'],
  'Engagement':        ['score_distribution.png', 'score_vs_length.png', 'comment_stats.png'],
  'Temporal':          ['comment_time_patterns.png', 'night_owl.png'],
  'NLP / ML':          ['topic_distribution.png', 'similarity_heatmap.png'],
  'Length':            ['post_text_length.png', 'comment_length.png'],
}

export default function EDADashboard() {
  const [selected, setSelected] = useState('wordclouds.png')
  const [category, setCategory] = useState('Text & Vocabulary')

  const currentPlots = CATEGORIES[category] || []
  const meta = PLOT_META[selected] || { title: selected, desc: '' }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--accent)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
          14 visualisations · Exploratory Data Analysis
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
          EDA Dashboard
        </h1>
        <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
          Exploratory analysis of linguistic patterns across 10 subreddits.
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Sidebar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', position: 'sticky', top: '72px' }}>
          {Object.entries(CATEGORIES).map(([cat, plots]) => (
            <div key={cat}>
              <div
                onClick={() => { setCategory(cat); setSelected(plots[0]) }}
                style={{
                  padding: '0.7rem 1rem', cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 500,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  background: category === cat ? 'var(--surface2)' : 'transparent',
                  color: category === cat ? 'var(--accent)' : 'var(--muted)',
                  borderLeft: category === cat ? '2px solid var(--accent)' : '2px solid transparent',
                }}
              >
                {cat}
              </div>
              {category === cat && plots.map(plot => (
                <div
                  key={plot}
                  onClick={() => setSelected(plot)}
                  style={{
                    padding: '0.5rem 1rem 0.5rem 1.5rem', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem', transition: 'all 0.15s',
                    background: selected === plot ? '#1f1f1f' : 'transparent',
                    color: selected === plot ? 'var(--text)' : 'var(--muted)',
                    borderLeft: selected === plot ? '2px solid var(--accent)' : '2px solid transparent',
                  }}
                >
                  {PLOT_META[plot]?.title || plot}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Main content */}
        <motion.div key={selected} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                {meta.title}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'var(--muted)' }}>
                {meta.desc}
              </div>
            </div>
            <img
              src={api.plotUrl(selected)}
              alt={meta.title}
              style={{ width: '100%', display: 'block' }}
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
        </motion.div>

      </div>
    </div>
  )
}
