import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { fetchMovies, deleteMovie, type Movie } from '../lib/api'
import styles from './movies.module.css'

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.rating}>
      {'★'.repeat(rating)}{'☆'.repeat(10 - rating)}
      <span className={styles.ratingNum}>{rating}/10</span>
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Movies() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchMovies()
      .then(setMovies)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this movie?')) return
    setDeleting(id)
    try {
      await deleteMovie(id)
      setMovies(m => m.filter(x => x.id !== id))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerLogo}>🎬</span>
          <h1 className={styles.headerTitle}>Watch Sky</h1>
        </div>
        <div className={styles.headerRight}>
          <Link to="/movies/add" className={styles.addBtn}>+ Add Movie</Link>
          <button onClick={handleSignOut} className={styles.signOutBtn}>Sign out</button>
        </div>
      </header>

      <main className={styles.main}>
        {loading && <p className={styles.center}>Loading movies…</p>}
        {error && <p className={styles.errorMsg}>{error}</p>}

        {!loading && movies.length === 0 && (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>🎥</p>
            <p className={styles.emptyTitle}>No movies yet</p>
            <p className={styles.emptyText}>Start tracking what you've watched.</p>
            <Link to="/movies/add" className={styles.addBtn}>+ Add your first movie</Link>
          </div>
        )}

        <div className={styles.grid}>
          {movies.map(movie => (
            <div key={movie.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.movieTitle}>{movie.title}</h2>
                <button
                  onClick={() => handleDelete(movie.id)}
                  className={styles.deleteBtn}
                  disabled={deleting === movie.id}
                  title="Delete"
                >
                  {deleting === movie.id ? '…' : '×'}
                </button>
              </div>

              <StarRating rating={movie.rating} />

              <p className={styles.watchedDate}>Watched {formatDate(movie.watched_at)}</p>

              {movie.notes && <p className={styles.notes}>{movie.notes}</p>}

              {movie.urls && movie.urls.length > 0 && (
                <div className={styles.urls}>
                  {movie.urls.map((u, i) => (
                    <a
                      key={i}
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.urlChip}
                    >
                      {u.label || u.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
