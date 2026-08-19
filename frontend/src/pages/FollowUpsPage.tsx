import { useEffect, useState } from 'react';
import { getFollowUps } from '../api/dashboard';
import { FollowUpRow } from '../components/followups/FollowUpList';
import { PageLoader, ErrorState, EmptyState } from '../components/ui/States';
import { getErrorMessage } from '../lib/errors';
import type { FollowUpsResponse } from '../types';

export function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFollowUps();
      setFollowUps(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load follow-ups. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!followUps) return null;

  const total =
    followUps.overdue.length +
    followUps.dueToday.length +
    followUps.upcoming.length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Follow-ups</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track and manage your application follow-ups
        </p>
      </div>

      {total === 0 ? (
        <EmptyState
          title="No follow-ups scheduled"
          description="Add follow-up dates to your applications to track them here."
        />
      ) : (
        <>
          {followUps.overdue.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                Overdue
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                  {followUps.overdue.length}
                </span>
              </h2>
              <div className="space-y-2">
                {followUps.overdue.map((app) => (
                  <FollowUpRow key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}

          {followUps.dueToday.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
                Due Today
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {followUps.dueToday.length}
                </span>
              </h2>
              <div className="space-y-2">
                {followUps.dueToday.map((app) => (
                  <FollowUpRow key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}

          {followUps.upcoming.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                Upcoming
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {followUps.upcoming.length}
                </span>
              </h2>
              <div className="space-y-2">
                {followUps.upcoming.map((app) => (
                  <FollowUpRow key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
