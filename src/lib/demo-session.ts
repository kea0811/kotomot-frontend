import type { SupabaseClient } from '@supabase/supabase-js'

const DEMO_KEY = 'kotomot_demo'
const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export interface DemoState {
  token: string
  user: {
    id: string
    email: string
    user_metadata: { name: string }
    demo: true
  }
  projectSlug?: string
  expiresAt?: string
}

export function getDemo(): DemoState | null {
  try {
    const raw = localStorage.getItem(DEMO_KEY)
    return raw ? (JSON.parse(raw) as DemoState) : null
  } catch {
    return null
  }
}

export function isDemo(): boolean {
  return !!getDemo()?.token
}

/** Mint a fresh, isolated demo session (a per-visitor sandbox). */
export async function startDemo(): Promise<DemoState> {
  const res = await fetch(`${API_BASE_URL}/auth/demo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error('Could not start the demo. Please try again.')
  const data = await res.json()
  const state: DemoState = {
    token: data.token,
    user: data.user,
    projectSlug: data.projectSlug,
    expiresAt: data.expiresAt,
  }
  localStorage.setItem(DEMO_KEY, JSON.stringify(state))
  return state
}

export function exitDemo(): void {
  try {
    localStorage.removeItem(DEMO_KEY)
  } catch {
    /* ignore */
  }
}

function demoSession(state: DemoState) {
  const expSec = Math.floor(
    new Date(state.expiresAt || Date.now() + 86_400_000).getTime() / 1000
  )
  return {
    access_token: state.token,
    refresh_token: state.token,
    token_type: 'bearer',
    expires_in: 86_400,
    expires_at: expSec,
    user: state.user,
  }
}

/**
 * When a demo session is active, override the auth *read* methods so AuthGuard
 * and the api-client see the demo user/token. Checked dynamically on every call
 * so the demo can be entered or exited at runtime. No-op when no demo is active.
 */
export function applyDemoAuth(client: SupabaseClient): SupabaseClient {
  const auth = client.auth as unknown as Record<string, any>
  const origGetUser = auth.getUser.bind(auth)
  const origGetSession = auth.getSession.bind(auth)
  const origOnAuthStateChange = auth.onAuthStateChange.bind(auth)

  auth.getUser = async (...args: unknown[]) => {
    const d = getDemo()
    if (d) return { data: { user: d.user }, error: null }
    return origGetUser(...args)
  }
  auth.getSession = async (...args: unknown[]) => {
    const d = getDemo()
    if (d) return { data: { session: demoSession(d) }, error: null }
    return origGetSession(...args)
  }
  auth.onAuthStateChange = (cb: (event: string, session: unknown) => void) => {
    const d = getDemo()
    if (d) {
      queueMicrotask(() => cb('SIGNED_IN', demoSession(d)))
      return { data: { subscription: { unsubscribe() {} } } }
    }
    return origOnAuthStateChange(cb)
  }

  return client
}
