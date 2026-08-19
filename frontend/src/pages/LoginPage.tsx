import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getErrorMessage } from '../lib/errors';

export function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from
    ?.pathname ?? '/';

  const [password, setPassword] = useState('');
  const [error, setError] = useState(() => {
    const notice = sessionStorage.getItem('job_tracker_auth_notice');
    if (notice) sessionStorage.removeItem('job_tracker_auth_notice');
    return notice ?? '';
  });
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to={from} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = password.trim();

    if (!trimmed) {
      setError('Please enter your password.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await login(trimmed);
    } catch (err) {
      setError(
        getErrorMessage(err, 'The password you entered is incorrect.'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white mb-4">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Job Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your applications
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter your password"
              autoFocus
            />

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
