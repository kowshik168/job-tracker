import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, X } from 'lucide-react';
import { getApplications } from '../api/applications';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PageLoader, EmptyState, ErrorState } from '../components/ui/States';
import {
  RESUME_TYPES,
  SOURCES,
  STATUSES,
  RESUME_TYPE_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  CURRENT_ROUND_LABELS,
} from '../lib/constants';
import { formatDate } from '../lib/utils';
import { getErrorMessage } from '../lib/errors';
import type { Application, ApplicationQueryParams } from '../types';

export function ApplicationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const resumeType = searchParams.get('resumeType') ?? '';
  const source = searchParams.get('source') ?? '';
  const sortBy = (searchParams.get('sortBy') ?? 'appliedAt') as 'appliedAt' | 'followUpDate';
  const sortOrder = (searchParams.get('sortOrder') ?? 'desc') as 'asc' | 'desc';
  const page = Number(searchParams.get('page') ?? '1');

  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ApplicationQueryParams = {
        page,
        limit: 15,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (status) params.status = status as ApplicationQueryParams['status'];
      if (resumeType) params.resumeType = resumeType as ApplicationQueryParams['resumeType'];
      if (source) params.source = source as ApplicationQueryParams['source'];

      const result = await getApplications(params);
      setApplications(result.data);
      setTotal(result.meta.total);
      setTotalPages(result.meta.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load applications. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [search, status, resumeType, source, sortBy, sortOrder, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput, page: '1' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = search || status || resumeType || source;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Applications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {total} application{total !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <Link to="/applications/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-surface p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by company or role..."
              className="w-full rounded-lg border border-slate-200 bg-raised pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value, page: '1' })}
            placeholder="All statuses"
            options={STATUSES.map((s) => ({
              value: s,
              label: STATUS_LABELS[s],
            }))}
          />
          <Select
            value={resumeType}
            onChange={(e) =>
              updateParams({ resumeType: e.target.value, page: '1' })
            }
            placeholder="All resume types"
            options={RESUME_TYPES.map((r) => ({
              value: r,
              label: RESUME_TYPE_LABELS[r],
            }))}
          />
          <Select
            value={source}
            onChange={(e) => updateParams({ source: e.target.value, page: '1' })}
            placeholder="All sources"
            options={SOURCES.map((s) => ({
              value: s,
              label: SOURCE_LABELS[s],
            }))}
          />
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-');
              updateParams({ sortBy: sb, sortOrder: so, page: '1' });
            }}
            options={[
              { value: 'appliedAt-desc', label: 'Applied: Newest first' },
              { value: 'appliedAt-asc', label: 'Applied: Oldest first' },
              { value: 'followUpDate-asc', label: 'Follow-up: Soonest first' },
              { value: 'followUpDate-desc', label: 'Follow-up: Latest first' },
            ]}
          />
          {hasFilters && (
            <Button variant="ghost" onClick={clearFilters} className="justify-center">
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          description={
            hasFilters
              ? 'Try adjusting your filters or search query.'
              : 'Start tracking your job search by adding your first application.'
          }
          action={
            !hasFilters && (
              <Link to="/applications/new">
                <Button>Add Application</Button>
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 hidden md:table-cell">
                      Resume
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Applied
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 hidden lg:table-cell">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 hidden xl:table-cell">
                      Round
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-600 hidden sm:table-cell">
                      Follow-up
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={`/applications/${app.id}`}
                          className="font-medium text-blue-600 hover:text-blue-700"
                        >
                          {app.company}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{app.role}</td>
                      <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                        {app.resume?.name ?? RESUME_TYPE_LABELS[app.resumeType]}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {formatDate(app.appliedAt)}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                        {app.source ? SOURCE_LABELS[app.source] : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden xl:table-cell">
                        {CURRENT_ROUND_LABELS[app.currentRound]}
                      </td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell whitespace-nowrap">
                        {formatDate(app.followUpDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => updateParams({ page: String(page - 1) })}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => updateParams({ page: String(page + 1) })}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
