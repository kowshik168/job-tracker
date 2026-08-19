import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAttention } from '../api/dashboard';
import { updateApplication } from '../api/applications';
import { AttentionCard } from '../components/attention/AttentionCard';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { STALE_AFTER_DAYS } from '../lib/constants';
import { getErrorMessage } from '../lib/errors';
import type { AttentionResponse } from '../types';

export function NeedsActionPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<AttentionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getAttention());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load applications that need action.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markNoResponse = async (id: string) => {
    setBusyId(id);
    try {
      await updateApplication(id, { noResponse: true });
      showToast('Marked as no response');
      setData(await getAttention());
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not update this application.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const clearSilence = async (id: string) => {
    setBusyId(id);
    try {
      await updateApplication(id, { noResponse: false });
      showToast('Moved back to needs action / active');
      setData(await getAttention());
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not update this application.'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const empty =
    data.needsAction.length === 0 && data.noResponse.length === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Needs action</h1>
        <p className="mt-1 text-sm text-slate-500">
          Open applications with no update for {STALE_AFTER_DAYS}+ days. Either
          you forgot to log a call, or the company never came back.
        </p>
      </div>

      {empty ? (
        <EmptyState
          title="Nothing waiting on you"
          description="When an application sits still for 15 days, it will show up here."
        />
      ) : (
        <>
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-amber-800">
              Quiet for {STALE_AFTER_DAYS}+ days
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                {data.needsAction.length}
              </span>
            </h2>
            {data.needsAction.length === 0 ? (
              <p className="text-sm text-slate-400">No stale applications.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {data.needsAction.map((app) => (
                  <AttentionCard
                    key={app.id}
                    application={app}
                    variant="stale"
                    busy={busyId === app.id}
                    onNoResponse={markNoResponse}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">
              No response
              <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                {data.noResponse.length}
              </span>
            </h2>
            <p className="text-sm text-slate-500">
              You confirmed these went silent. Update them if a recruiter
              eventually replies.
            </p>
            {data.noResponse.length === 0 ? (
              <p className="text-sm text-slate-400">None marked as no response.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {data.noResponse.map((app) => (
                  <AttentionCard
                    key={app.id}
                    application={app}
                    variant="silent"
                    busy={busyId === app.id}
                    onClearSilence={clearSilence}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <p className="text-xs text-slate-400">
        Offers and rejections are excluded.{' '}
        <Link to="/applications" className="text-blue-600 hover:text-blue-700">
          View all applications
        </Link>
      </p>
    </div>
  );
}
