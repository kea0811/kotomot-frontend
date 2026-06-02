import type { ElementType, ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** lucide icon shown in the brand-tinted chip */
  icon?: ElementType;
  /** optional trend indicator */
  trend?: { direction: 'up' | 'down'; text: string };
  /** optional progress bar under the value (0–100) */
  progress?: number;
  /** override the value color (e.g. warning for pending counts) */
  valueClassName?: string;
  className?: string;
}

/**
 * Stat tile from the Pencil design system: brand-tinted icon chip,
 * large value, muted label, optional trend or progress bar.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  progress,
  valueClassName,
  className,
}: StatCardProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
            <Icon className="h-5 w-5 text-brand" />
          </span>
        )}
      </div>

      <p className={cn('mt-3 text-2xl font-semibold tracking-tight text-foreground', valueClassName)}>
        {value}
      </p>

      {typeof progress === 'number' && <ProgressBar value={progress} className="mt-2" />}

      {trend && (
        <div
          className={cn(
            'mt-2 flex items-center gap-1 text-xs font-medium',
            trend.direction === 'up' ? 'text-success' : 'text-destructive'
          )}
        >
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          {trend.text}
        </div>
      )}
    </div>
  );
}

export default StatCard;
