import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Bell,
  Settings,
  Menu,
  X,
  Plus,
  LogOut,
  FileText,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/applications', label: 'Applications', icon: Briefcase },
  { to: '/resumes', label: 'Resumes', icon: FileText },
  { to: '/follow-ups', label: 'Follow-ups', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <>
      <div className="flex items-center gap-2 px-4 py-6 border-b border-slate-200">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-sm">
          JT
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">Job Tracker</p>
          <p className="text-xs text-slate-500">Application Manager</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-2">
        <NavLink to="/applications/new" onClick={() => setMobileOpen(false)}>
          <Button className="w-full" size="sm">
            <Plus className="h-4 w-4" />
            Add Application
          </Button>
        </NavLink>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-600"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-40 rounded-lg bg-surface p-2 shadow-md border border-slate-200 lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-surface border-r border-slate-200 transition-transform lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
        {navContent}
      </aside>
    </>
  );
}
