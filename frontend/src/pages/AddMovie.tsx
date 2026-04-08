import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { createMovie, type MovieURL } from '../lib/api'
import styles from './addmovie.module.css'

export default function AddMovie() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [rating, setRating] = useState(7)
  const [notes, setNotes] = useState('')
  const [watchedAt, setWatchedAt] = useState(() => new Date().toISOString().split('T')[0])
  const [urls, setUrls] = useState<MovieURL[]>([{ label: '', url: '' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addUrlRow() {
    setUrls(u => [...u, { label: '', url: '' }])
  }

  function removeUrlRow(i: number) {
    setUrls(u => u.filter((_, idx) => idx !== i))
  }

  function updateUrl(i: number, field: keyof MovieURL, value: string) {
    setUrls(u => u.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cleanUrls = urls.filter(u => u.url.trim())
      await createMovie({
        title: title.trim(),
        rating,
        notes: notes.trim() || undefined,
        urls: cleanUrls,
        watched_at: new Date(watchedAt).toISOString(),
      })
      navigate('/movies')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to add movie')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLogo}>🎬</span>
          <h1 className={styles.headerTitle}>Watch Sky</h1>
        </div>
        <Link to="/movies" className={styles.backBtn}>← Back</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.formTitle}>Add Movie</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={styles.input}
                placeholder="Movie title"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Rating: <span className={styles.ratingValue}>{rating}/10</span></label>
              <input
                type="range"
                min={1}
                max={10}
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.sliderTicks}>
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <span key={n} className={styles.tick}>{n}</span>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Watched On</label>
              <input
                type="date"
                value={watchedAt}
                onChange={e => setWatchedAt(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={styles.textarea}
                placeholder="Your thoughts…"
                rows={3}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Links</label>
              {urls.map((row, i) => (
                <div key={i} className={styles.urlRow}>
                  <input
                    type="text"
                    value={row.label}
                    onChange={e => updateUrl(i, 'label', e.target.value)}
                    className={styles.urlLabel}
                    placeholder="Label (e.g. IMDb)"
                  />
                  <input
                    type="url"
                    value={row.url}
                    onChange={e => updateUrl(i, 'url', e.target.value)}
                    className={styles.urlInput}
                    placeholder="https://…"
                  />
                  {urls.length > 1 && (
                    <button type="button" onClick={() => removeUrlRow(i)} className={styles.removeUrl}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addUrlRow} className={styles.addUrlBtn}>+ Add link</button>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.actions}>
              <Link to="/movies" className={styles.cancelBtn}>Cancel</Link>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Saving…' : 'Save Movie'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
