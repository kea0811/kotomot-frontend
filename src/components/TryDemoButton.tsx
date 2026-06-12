import { useState } from 'react'
import { ArrowRight, Loader2, Play } from 'lucide-react'
import { startDemo } from '@/lib/demo-session'

interface Props {
  variant?: 'primary' | 'outline' | 'link'
  className?: string
  children?: React.ReactNode
}

/**
 * Starts an isolated demo session and drops the visitor into the dashboard.
 * A full reload guarantees the supabase client picks up the demo token from
 * the first render.
 */
export default function TryDemoButton({ variant = 'primary', className = '', children }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const launch = async () => {
    setLoading(true)
    setError(null)
    try {
      await startDemo()
      window.location.href = '/dashboard'
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start the demo.')
      setLoading(false)
    }
  }

  const base = 'inline-flex items-center gap-2 transition-all disabled:opacity-70'
  const styles: Record<NonNullable<Props['variant']>, string> = {
    primary:
      'h-11 rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground shadow-sm hover:bg-brand/90 active:scale-[0.99]',
    outline:
      'h-11 rounded-lg border border-border bg-background px-5 text-sm font-medium hover:bg-accent',
    link: 'text-sm font-medium text-brand hover:opacity-80',
  }

  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={launch}
        disabled={loading}
        className={`${base} ${styles[variant]} ${className}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : variant !== 'link' ? (
          <Play className="h-4 w-4" />
        ) : null}
        {children ?? (loading ? 'Starting demo…' : 'Try the live demo')}
        {variant === 'link' && !loading && <ArrowRight className="h-4 w-4" />}
      </button>
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </span>
  )
}
