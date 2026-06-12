import { createClient } from '@supabase/supabase-js'
import { applyPreviewAuth } from '@/lib/preview-auth'
import { applyDemoAuth } from '@/lib/demo-session'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Demo session (prod-safe) wraps the dev-only preview bypass; both no-op when
// inactive, so real Supabase auth is untouched.
export const supabase = applyDemoAuth(
  applyPreviewAuth(createClient(supabaseUrl, supabaseAnonKey))
)
