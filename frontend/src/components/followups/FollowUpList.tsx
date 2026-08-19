import { Link } from 'react-router-dom';
import { cn, formatDate, isOverdue, isToday } from '../../lib/utils';
import { StatusBadge } from '../ui/StatusBadge';
import type { Application } from '../../types';
import { AlertTriangle, Calendar } from 'lucide-react';

interface FollowUpListProps {
  title: string;
  applications: Application[];
  variant?: 'default' | 'overdue' | 'today';
  emptyMessage?: string;
}

export function FollowUpList({
  title,
  applications,
  variant = 'default',
  emptyMessage = 'None',
}: FollowUpListProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-surface p-5">
      <h3
        className={cn(
          'text-sm font-semibold mb-3 flex items-center gap-2',
          variant === 'overdue' && 'text-red-700',
          variant === 'today' && 'text-amber-700',
          variant === 'default' && 'text-slate-900',
        )}
      >
        {variant === 'overdue' && <AlertTriangle className="h-4 w-4" />}
        {variant === 'today' && <Calendar className="h-4 w-4" />}
        {title}
        <span className="ml-auto text-xs font-normal text-slate-500">
          {applications.length}
        </span>
      </h3>

      {applications.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                to={`/applications/${app.id}`}
                className={cn(
                  'block rounded-lg border px-3 py-2.5 transition-colors hover:bg-slate-50',
                  variant === 'overdue'
                    ? 'border-red-200 bg-red-50/50'
                    : variant === 'today'
                      ? 'border-amber-200 bg-amber-50/50'
                      : 'border-slate-100',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {app.company}
                    </p>
                    <p className="text-xs text-slate-500">{app.role}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <p
                  className={cn(
                    'mt-1 text-xs',
                    variant === 'overdue' ? 'text-red-600 font-medium' : 'text-slate-500',
                  )}
                >
                  Follow-up: {formatDate(app.followUpDate)}
                  {variant === 'overdue' && ' (Overdue)'}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function FollowUpRow({ app }: { app: Application }) {
  const overdue = isOverdue(app.followUpDate);
  const today = isToday(app.followUpDate);

  return (
    <Link
      to={`/applications/${app.id}`}
      className={cn(
        'flex items-center justify-between rounded-lg border px-4 py-3 transition-colors hover:bg-slate-50',
        overdue && 'border-red-200 bg-red-50/30',
        today && !overdue && 'border-amber-200 bg-amber-50/30',
        !overdue && !today && 'border-slate-100',
      )}
    >
      <div>
        <p className="text-sm font-medium text-slate-900">{app.company}</p>
        <p className="text-xs text-slate-500">{app.role}</p>
      </div>
      <div className="text-right">
        <StatusBadge status={app.status} />
        <p
          className={cn(
            'mt-1 text-xs',
            overdue ? 'text-red-600 font-semibold' : 'text-slate-500',
          )}
        >
          {formatDate(app.followUpDate)}
          {overdue && ' · Overdue'}
          {today && !overdue && ' · Today'}
        </p>
      </div>
    </Link>
  );
}
