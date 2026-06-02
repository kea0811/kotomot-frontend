import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CircleCheck, Check, X, Loader2, User } from 'lucide-react';
import { apiClient, handleApiResponse } from '@/lib/utils/api-client';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { pageVariants, cardVariants } from '@/lib/motion';
import { approvalEvents } from '@/lib/events/approvalEvents';

interface Approval {
  id: string;
  key?: string;
  keyPath?: string;
  namespace?: string;
  language?: string;
  status?: string;
  oldValue?: string;
  newValue?: string;
  old_value?: string;
  new_value?: string;
  requestedBy?: string;
  requested_by?: string;
  requestedAt?: string;
  requested_at?: string;
  can_approve?: boolean;
}

/** Normalize the API's snake/camel field variants into one shape. */
function normalize(a: Approval) {
  return {
    id: a.id,
    keyPath: a.keyPath || a.key || 'Unknown key',
    namespace: a.namespace || '',
    language: a.language || '',
    oldValue: a.oldValue ?? a.old_value ?? '',
    newValue: a.newValue ?? a.new_value ?? '',
    requestedBy: a.requestedBy || a.requested_by || 'Someone',
    requestedAt: a.requestedAt || a.requested_at || '',
    canApprove: a.can_approve !== false,
  };
}

export default function UnifiedApprovals() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/approvals?filter=pending&role=approver');
      const data = await handleApiResponse(res);
      setApprovals(data.approvals || []);
    } catch (err) {
      console.error('Failed to fetch approvals:', err);
      setError(err instanceof Error ? err.message : 'Failed to load approvals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    setActing(id);
    // optimistic remove
    const prev = approvals;
    setApprovals((list) => list.filter((a) => a.id !== id));
    try {
      await apiClient.post(`/api/approvals/${id}/${action}`);
      approvalEvents.emit();
    } catch (err) {
      console.error(`Failed to ${action}:`, err);
      // roll back on failure
      setApprovals(prev);
      setError(`Failed to ${action} this request. Please try again.`);
    } finally {
      setActing(null);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 w-full"
    >
      <PageHeader title="Approvals" subtitle="Review and approve pending translations." />

      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : approvals.length === 0 ? (
        <div className="rounded-xl border border-border bg-card">
          <EmptyState
            icon={CircleCheck}
            title="No pending approvals"
            description="You're all caught up. New requests will appear here."
            className="py-16"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((raw) => {
            const a = normalize(raw);
            const busy = acting === a.id;
            return (
              <motion.div
                key={a.id}
                variants={cardVariants}
                className="rounded-xl border border-border bg-card p-4"
              >
                {/* Top: key info + status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate text-sm font-semibold text-foreground">{a.keyPath}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[a.namespace, a.language].filter(Boolean).join(' · ') || 'Translation'}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
                    Pending
                  </span>
                </div>

                {/* Diff: old → new */}
                <div className="mt-3 space-y-2">
                  {a.oldValue && (
                    <div className="rounded-md bg-destructive/10 px-3 py-2">
                      <p className="text-sm text-foreground line-through decoration-destructive/50">
                        {a.oldValue}
                      </p>
                    </div>
                  )}
                  <div className="rounded-md bg-success/10 px-3 py-2">
                    <p className="text-sm text-foreground">{a.newValue || '(empty)'}</p>
                  </div>
                </div>

                {/* Footer: reviewer + actions */}
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted">
                      <User className="h-3 w-3" />
                    </span>
                    Requested by {a.requestedBy}
                    {a.requestedAt && ` · ${a.requestedAt}`}
                  </div>
                  {a.canApprove && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => act(a.id, 'reject')}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="brand"
                        disabled={busy}
                        onClick={() => act(a.id, 'approve')}
                      >
                        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
