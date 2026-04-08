import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Movies from './pages/Movies'
import AddMovie from './pages/AddMovie'

function ProtectedRoute({ user, children }: { user: User | null; children: React.ReactNode }) {
  if (user === undefined) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#94a3b8' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/movies" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/movies" replace /> : <Signup />} />
        <Route path="/movies" element={<ProtectedRoute user={user}><Movies /></ProtectedRoute>} />
        <Route path="/movies/add" element={<ProtectedRoute user={user}><AddMovie /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to={user ? '/movies' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
