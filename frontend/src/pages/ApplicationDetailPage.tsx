import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  FileText,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  getApplication,
  updateApplication,
  deleteApplication,
} from '../api/applications';
import { addResumeLearning, downloadResumeFile } from '../api/resumes';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ConfirmDialog } from '../components/ui/Modal';
import { PageLoader, ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import {
  STATUSES,
  CURRENT_ROUNDS,
  STATUS_LABELS,
  CURRENT_ROUND_LABELS,
  RESUME_TYPE_LABELS,
  SOURCE_LABELS,
} from '../lib/constants';
import { formatDate } from '../lib/utils';
import { getErrorMessage } from '../lib/errors';
import type { Application, ApplicationStatus, CurrentRound } from '../types';

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [learning, setLearning] = useState('');
  const [savingLearning, setSavingLearning] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getApplication(id);
      setApplication(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this application.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatusChange = async (status: ApplicationStatus) => {
    if (!id || !application) return;
    setUpdating(true);
    try {
      const updated = await updateApplication(id, { status });
      setApplication(updated);
      showToast('Status updated');
    } catch (err) {
      showToast(
        getErrorMessage(err, 'Could not update the status. Please try again.'),
        'error',
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleRoundChange = async (currentRound: CurrentRound) => {
    if (!id || !application) return;
    setUpdating(true);
    try {
      const updated = await updateApplication(id, { currentRound });
      setApplication(updated);
      showToast('Current round updated');
    } catch (err) {
      showToast(
        getErrorMessage(err, 'Could not update the current round. Please try again.'),
        'error',
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteApplication(id);
      showToast('Application deleted');
      navigate('/applications');
    } catch (err) {
      showToast(
        getErrorMessage(err, 'Could not delete this application. Please try again.'),
        'error',
      );
      setDeleting(false);
    }
  };

  const handleAddLearning = async () => {
    if (!application?.resumeId || !learning.trim()) {
      showToast('Write what this resume got wrong or missed.', 'error');
      return;
    }
    setSavingLearning(true);
    try {
      await addResumeLearning(application.resumeId, {
        content: learning.trim(),
        applicationId: application.id,
      });
      setLearning('');
      showToast('Learning saved on this resume');
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not save learning.'), 'error');
    } finally {
      setSavingLearning(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!application) return null;

  const detailRows = [
    { label: 'Company', value: application.company },
    { label: 'Role', value: application.role },
    { label: 'Resume Type', value: RESUME_TYPE_LABELS[application.resumeType] },
    {
      label: 'Resume used',
      value: application.resume?.name ?? 'Not attached',
    },
    { label: 'Applied Date', value: formatDate(application.appliedAt) },
    { label: 'Source', value: application.source ? SOURCE_LABELS[application.source] : '—' },
    { label: 'Referral', value: application.referral ?? '—' },
    { label: 'Follow-up Date', value: formatDate(application.followUpDate) },
    { label: 'Recruiter Name', value: application.recruiterName ?? '—' },
    { label: 'Recruiter Contact', value: application.recruiterContact ?? '—' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/applications"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">
            {application.company}
          </h1>
          <p className="text-sm text-slate-500">{application.role}</p>
        </div>
        <StatusBadge status={application.status} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to={`/applications/${id}/edit`}>
          <Button variant="secondary" size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
        {application.resume && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadResumeFile(application.resume!.id).catch((err) =>
                showToast(
                  getErrorMessage(err, 'Could not download that resume.'),
                  'error',
                ),
              )
            }
          >
            <Download className="h-4 w-4" />
            Download resume
          </Button>
        )}
        {application.jobUrl && (
          <a href={application.jobUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm">
              <ExternalLink className="h-4 w-4" />
              Open Job URL
            </Button>
          </a>
        )}
        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-surface p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {detailRows.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {label}
                </dt>
                <dd className="mt-1 text-sm text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          {application.notes && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Notes
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {application.notes}
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Resume learning
            </h3>
            {application.resume ? (
              <>
                <p className="text-sm text-slate-600">
                  Used{' '}
                  <Link
                    to={`/resumes/${application.resume.id}`}
                    className="font-medium text-blue-600 hover:text-blue-700"
                  >
                    {application.resume.name}
                  </Link>
                  . If this one was rejected, capture what to fix on that
                  resume.
                </p>
                <Textarea
                  value={learning}
                  onChange={(e) => setLearning(e.target.value)}
                  placeholder="e.g. Not enough backend metrics; DSA section looked weak..."
                  rows={3}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddLearning}
                  disabled={savingLearning}
                >
                  {savingLearning ? 'Saving...' : 'Save learning to resume'}
                </Button>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                No stored resume attached.{' '}
                <Link to="/resumes" className="text-blue-600 hover:text-blue-700">
                  Upload one
                </Link>{' '}
                and edit this application to link it.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-surface p-5 space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume for this company
            </h2>
            {application.resume ? (
              <>
                <p className="text-sm font-medium text-slate-900">
                  {application.resume.name}
                </p>
                <p className="text-xs text-slate-500">
                  {application.resume.fileName} ·{' '}
                  {RESUME_TYPE_LABELS[application.resume.resumeType]}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      downloadResumeFile(application.resume!.id).catch((err) =>
                        showToast(
                          getErrorMessage(err, 'Could not download that resume.'),
                          'error',
                        ),
                      )
                    }
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                  <Link to={`/resumes/${application.resume.id}`}>
                    <Button size="sm" variant="ghost">
                      Open resume
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">
                None attached.{' '}
                <Link
                  to={`/applications/${application.id}/edit`}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit
                </Link>{' '}
                to upload the file you sent them.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-surface p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Quick Actions
            </h2>
            <Select
              label="Change Status"
              value={application.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as ApplicationStatus)
              }
              disabled={updating}
              options={STATUSES.map((s) => ({
                value: s,
                label: STATUS_LABELS[s],
              }))}
            />
            <Select
              label="Change Current Round"
              value={application.currentRound}
              onChange={(e) =>
                handleRoundChange(e.target.value as CurrentRound)
              }
              disabled={updating}
              options={CURRENT_ROUNDS.map((r) => ({
                value: r,
                label: CURRENT_ROUND_LABELS[r],
              }))}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-surface p-5 text-xs text-slate-400">
            <p>Created: {formatDate(application.createdAt)}</p>
            <p className="mt-1">Updated: {formatDate(application.updatedAt)}</p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Application"
        message={`Are you sure you want to delete the application for ${application.company}? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
