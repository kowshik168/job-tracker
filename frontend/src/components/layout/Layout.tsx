import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-canvas">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-canvas">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:pl-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
