import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Application configuration
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-surface p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">About</h2>
          <p className="mt-2 text-sm text-slate-600">
            Job Tracker is a personal application for tracking software
            engineering job applications. Access is protected by a single
            password configured on the server.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-sm font-semibold text-slate-900">API</h2>
          <p className="mt-2 text-sm text-slate-600">
            Backend API:{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
              {import.meta.env.VITE_API_URL ?? '/api'}
            </code>
          </p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-sm font-semibold text-slate-900">Session</h2>
          <p className="mt-2 text-sm text-slate-600 mb-3">
            Sign out of your current session on this device.
          </p>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
