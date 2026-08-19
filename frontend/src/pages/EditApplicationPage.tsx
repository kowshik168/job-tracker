import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApplication, updateApplication } from '../api/applications';
import { ApplicationForm } from '../components/applications/ApplicationForm';
import { PageLoader, ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../lib/errors';
import type { Application, CreateApplicationInput } from '../types';

export function EditApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getApplication(id)
      .then(setApplication)
      .catch((err) =>
        setError(getErrorMessage(err, 'Could not load this application.')),
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data: CreateApplicationInput) => {
    if (!id) return;
    try {
      await updateApplication(id, data);
      showToast('Application updated successfully');
      navigate(`/applications/${id}`);
    } catch (err) {
      showToast(
        getErrorMessage(err, 'Could not save your changes. Please try again.'),
        'error',
      );
      throw err;
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} />;
  if (!application) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Application</h1>
        <p className="mt-1 text-sm text-slate-500">
          {application.company} — {application.role}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-surface p-6">
        <ApplicationForm
          initial={application}
          onSubmit={(data) => handleSubmit(data)}
          onCancel={() => navigate(`/applications/${id}`)}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}
