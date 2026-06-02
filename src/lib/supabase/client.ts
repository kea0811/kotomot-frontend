import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { applyPreviewAuth } from '@/lib/preview-auth'

export function createClient() {
  const supabase = createSupabaseClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  )
  return applyPreviewAuth(supabase)
}
