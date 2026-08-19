import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { daysSince, formatDate } from '../../lib/utils';
import type { Application } from '../../types';

interface AttentionCardProps {
  application: Application;
  variant: 'stale' | 'silent';
  onNoResponse?: (id: string) => void;
  onClearSilence?: (id: string) => void;
  busy?: boolean;
}

export function AttentionCard({
  application,
  variant,
  onNoResponse,
  onClearSilence,
  busy,
}: AttentionCardProps) {
  const idleDays = daysSince(application.lastActivityAt);

  return (
    <div
      className={
        variant === 'stale'
          ? 'rounded-xl border border-amber-200 bg-amber-50/60 p-4'
          : 'rounded-xl border border-slate-200 bg-surface p-4'
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            to={`/applications/${application.id}`}
            className="font-semibold text-slate-900 hover:text-blue-700"
          >
            {application.company}
          </Link>
          <p className="text-sm text-slate-600">{application.role}</p>
          <p className="mt-1 text-xs text-slate-500">
            Applied {formatDate(application.appliedAt)} · Quiet for {idleDays}{' '}
            day{idleDays === 1 ? '' : 's'}
          </p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`/applications/${application.id}/edit`}>
          <Button size="sm" variant="secondary">
            I got a call / forgot to update
          </Button>
        </Link>
        {variant === 'stale' && onNoResponse && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onNoResponse(application.id)}
          >
            No response
          </Button>
        )}
        {variant === 'silent' && onClearSilence && (
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            onClick={() => onClearSilence(application.id)}
          >
            They replied — reopen
          </Button>
        )}
      </div>
    </div>
  );
}
