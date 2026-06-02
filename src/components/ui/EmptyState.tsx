import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description?: string;
  /** Primary action (button or link). */
  action?: ReactNode;
  className?: string;
}

/**
 * Centered empty state from the Pencil design system: muted icon in a
 * circle, title, description, and an optional primary action.
 */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 p-8 text-center', className)}>
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </span>
      )}
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mx-auto max-w-[320px] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export default EmptyState;
