import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/movies')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>🎬</div>
        <h1 className={styles.title}>Watch Sky</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className={styles.switchText}>
          Don't have an account? <Link to="/signup" className={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
