import { useEffect, useState } from 'react';
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  getDashboardStats,
  getStatusBreakdown,
  getResumeTypeBreakdown,
  getApplicationTrend,
  getFollowUps,
} from '../api/dashboard';
import { PageLoader, ErrorState } from '../components/ui/States';
import { FollowUpList } from '../components/followups/FollowUpList';
import {
  STATUS_LABELS,
  RESUME_TYPE_LABELS,
  CHART_COLORS,
} from '../lib/constants';
import { getErrorMessage } from '../lib/errors';
import type {
  DashboardStats,
  StatusBreakdownItem,
  ResumeTypeBreakdownItem,
  ApplicationTrendItem,
  FollowUpsResponse,
} from '../types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-surface p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdownItem[]>(
    [],
  );
  const [resumeBreakdown, setResumeBreakdown] = useState<
    ResumeTypeBreakdownItem[]
  >([]);
  const [trend, setTrend] = useState<ApplicationTrendItem[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, status, resume, t, f] = await Promise.all([
        getDashboardStats(),
        getStatusBreakdown(),
        getResumeTypeBreakdown(),
        getApplicationTrend(),
        getFollowUps(),
      ]);
      setStats(s);
      setStatusBreakdown(status);
      setResumeBreakdown(resume);
      setTrend(t);
      setFollowUps(f);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load the dashboard. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!stats || !followUps) return null;

  const statusChartData = statusBreakdown.map((item) => ({
    name: STATUS_LABELS[item.status],
    value: item.count,
  }));

  const resumeChartData = resumeBreakdown.map((item) => ({
    name: RESUME_TYPE_LABELS[item.resumeType],
    count: item.count,
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your job search progress
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Applications"
          value={stats.totalApplications}
          icon={Briefcase}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="This Week"
          value={stats.applicationsThisWeek}
          icon={TrendingUp}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="OAs"
          value={stats.oas}
          icon={Clock}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          label="Interviews"
          value={stats.interviews}
          icon={Calendar}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          label="Offers"
          value={stats.offers}
          icon={CheckCircle}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Rejections"
          value={stats.rejections}
          icon={XCircle}
          color="bg-red-50 text-red-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Status Breakdown
          </h3>
          {statusChartData.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {statusChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-surface p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Applications by Resume Type
          </h3>
          {resumeChartData.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={resumeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-surface p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Applications Over Time
        </h3>
        {trend.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Upcoming Follow-ups
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FollowUpList
            title="Due Today"
            applications={followUps.dueToday}
            variant="today"
            emptyMessage="No follow-ups due today"
          />
          <FollowUpList
            title="Overdue"
            applications={followUps.overdue}
            variant="overdue"
            emptyMessage="No overdue follow-ups"
          />
          <FollowUpList
            title="Upcoming"
            applications={followUps.upcoming}
            emptyMessage="No upcoming follow-ups"
          />
        </div>
      </div>
    </div>
  );
}
