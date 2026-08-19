import { useNavigate } from 'react-router-dom';
import { createApplication } from '../api/applications';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../lib/errors';
import type { CreateApplicationInput } from '../types';

export function NewApplicationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (data: CreateApplicationInput) => {
    try {
      await createApplication(data);
      showToast('Application added successfully');
      navigate('/applications');
    } catch (err) {
      showToast(
        getErrorMessage(err, 'Could not add the application. Please try again.'),
        'error',
      );
      throw err;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Add Application</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track a new job application
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-surface p-6">
        <ApplicationForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/applications')}
          submitLabel="Add Application"
        />
      </div>
    </div>
  );
}
