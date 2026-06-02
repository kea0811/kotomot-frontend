import { cn } from '@/lib/utils';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  className?: string;
  /** Track height in px (default 6, matching Pencil). */
  height?: number;
}

/** Thin rounded progress track with a brand-colored fill. */
export function ProgressBar({ value, className, height = 6 }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-muted', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="rounded-full bg-brand transition-all"
        style={{ width: `${pct}%`, height }}
      />
    </div>
  );
}

export default ProgressBar;
