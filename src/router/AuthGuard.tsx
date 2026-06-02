import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

// Dev-only preview bypass for visual/UI work (screenshots).
// Hard-gated to `vite dev` AND an explicit env flag, so it is impossible
// to enable in a production build. Pages render with empty states because
// API calls still require a real Supabase token.
const PREVIEW_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_PREVIEW === '1'

export default function AuthGuard() {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    if (PREVIEW_BYPASS) {
      setAuthenticated(true)
      setLoading(false)
      return
    }

    let mounted = true

    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (mounted) {
        setAuthenticated(!!session)
        setLoading(false)
      }
    }

    checkSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthenticated(!!session)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
