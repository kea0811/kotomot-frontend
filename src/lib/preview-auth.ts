import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Dev-only preview bypass.
 * Hard-gated to `vite dev` AND an explicit env flag, so it can never be
 * enabled in a production build.
 */
export const PREVIEW_BYPASS =
  import.meta.env.DEV && import.meta.env.VITE_PREVIEW === '1'

const fakeUser = {
  id: '00000000-0000-0000-0000-000000000000',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'preview@koto.dev',
  user_metadata: { name: 'Preview User' },
  app_metadata: {},
  created_at: new Date(0).toISOString(),
}

const fakeSession = {
  access_token: 'preview-token',
  refresh_token: 'preview-refresh',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: 9999999999,
  user: fakeUser,
}

/**
 * When the preview bypass is active, override only the auth *read* methods
 * so the app's scattered `getUser()` / `getSession()` checks pass and pages
 * render. Network/data calls still hit the real backend (and may 401, which
 * we render as empty states). No-op outside the dev preview.
 */
export function applyPreviewAuth(client: SupabaseClient): SupabaseClient {
  if (!PREVIEW_BYPASS) return client

  const auth = client.auth as unknown as Record<string, unknown>
  auth.getUser = async () => ({ data: { user: fakeUser }, error: null })
  auth.getSession = async () => ({ data: { session: fakeSession }, error: null })
  auth.onAuthStateChange = (cb: (event: string, session: unknown) => void) => {
    // fire once so listeners settle, then hand back an unsubscribe stub
    queueMicrotask(() => cb('SIGNED_IN', fakeSession))
    return { data: { subscription: { unsubscribe() {} } } }
  }

  return client
}
