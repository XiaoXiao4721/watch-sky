import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import styles from './auth.module.css'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
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
        <p className={styles.subtitle}>Create your account</p>
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
              minLength={6}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className={styles.switchText}>
          Already have an account? <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
