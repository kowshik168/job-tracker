import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Trash2 } from 'lucide-react';
import {
  addResumeLearning,
  deleteResume,
  deleteResumeLearning,
  downloadResumeFile,
  getResume,
  updateResume,
} from '../api/resumes';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { ConfirmDialog } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ErrorState, PageLoader } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { RESUME_TYPE_LABELS, RESUME_TYPES } from '../lib/constants';
import { formatDate, formatFileSize } from '../lib/utils';
import { getErrorMessage } from '../lib/errors';
import type { Resume, ResumeType } from '../types';

export function ResumeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [learning, setLearning] = useState('');
  const [learningApplicationId, setLearningApplicationId] = useState('');
  const [addingLearning, setAddingLearning] = useState(false);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setResume(await getResume(id));
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load this resume.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !resume) return;
    setSaving(true);
    try {
      const updated = await updateResume(id, {
        name: resume.name,
        resumeType: resume.resumeType,
        notes: resume.notes ?? '',
      });
      setResume({ ...resume, ...updated });
      showToast('Resume details saved');
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not save resume.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLearning = async (e: FormEvent) => {
    e.preventDefault();
    if (!id || !learning.trim()) {
      showToast('Write what you learned from this resume.', 'error');
      return;
    }
    setAddingLearning(true);
    try {
      await addResumeLearning(id, {
        content: learning.trim(),
        applicationId: learningApplicationId || undefined,
      });
      setLearning('');
      setLearningApplicationId('');
      showToast('Learning saved');
      await load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not save learning.'), 'error');
    } finally {
      setAddingLearning(false);
    }
  };

  const handleDeleteLearning = async (learningId: string) => {
    if (!id) return;
    try {
      await deleteResumeLearning(id, learningId);
      showToast('Learning removed');
      await load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not delete learning.'), 'error');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteResume(id);
      showToast('Resume deleted');
      navigate('/resumes');
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not delete resume.'), 'error');
      setDeleting(false);
    }
  };

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!resume) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/resumes"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{resume.name}</h1>
          <p className="text-sm text-slate-500">
            {RESUME_TYPE_LABELS[resume.resumeType]} · {resume.fileName} ·{' '}
            {formatFileSize(resume.fileSize)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            downloadResumeFile(resume.id).catch((err) =>
              showToast(getErrorMessage(err, 'Could not download file.'), 'error'),
            )
          }
        >
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-xl border border-slate-200 bg-surface p-6 space-y-4"
      >
        <h2 className="text-sm font-semibold text-slate-900">Details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={resume.name}
            onChange={(e) => setResume({ ...resume, name: e.target.value })}
            required
          />
          <Select
            label="Resume type"
            value={resume.resumeType}
            onChange={(e) =>
              setResume({ ...resume, resumeType: e.target.value as ResumeType })
            }
            options={RESUME_TYPES.map((type) => ({
              value: type,
              label: RESUME_TYPE_LABELS[type],
            }))}
          />
        </div>
        <Textarea
          label="Notes"
          value={resume.notes ?? ''}
          onChange={(e) => setResume({ ...resume, notes: e.target.value })}
          placeholder="What this version is for..."
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save details'}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-200 bg-surface p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Learnings from rejections
        </h2>
        <p className="text-sm text-slate-500">
          After a reject, write what this resume got wrong so the next version
          is stronger.
        </p>
        <form onSubmit={handleAddLearning} className="space-y-3">
          <Textarea
            label="What did you learn?"
            value={learning}
            onChange={(e) => setLearning(e.target.value)}
            placeholder="e.g. Backend projects were buried; need metrics on Kafka work..."
            rows={3}
          />
          <Select
            label="Linked application (optional)"
            value={learningApplicationId}
            onChange={(e) => setLearningApplicationId(e.target.value)}
            placeholder="Not linked"
            options={(resume.applications ?? []).map((app) => ({
              value: app.id,
              label: `${app.company} — ${app.role}`,
            }))}
          />
          <Button type="submit" size="sm" disabled={addingLearning}>
            {addingLearning ? 'Saving...' : 'Add learning'}
          </Button>
        </form>

        {(resume.learnings ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">No learnings yet.</p>
        ) : (
          <ul className="space-y-3">
            {resume.learnings?.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-slate-800 whitespace-pre-wrap">
                    {item.content}
                  </p>
                  <button
                    onClick={() => handleDeleteLearning(item.id)}
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Delete learning"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(item.createdAt)}
                  {item.application
                    ? ` · ${item.application.company}`
                    : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-surface p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Applications using this resume
        </h2>
        {(resume.applications ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">Not attached to any applications yet.</p>
        ) : (
          <ul className="space-y-2">
            {resume.applications?.map((app) => (
              <li key={app.id}>
                <Link
                  to={`/applications/${app.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {app.company}
                    </p>
                    <p className="text-xs text-slate-500">
                      {app.role} · {formatDate(app.appliedAt)}
                    </p>
                  </div>
                  <StatusBadge status={app.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete resume"
        message="This file and its learnings will be deleted. Linked applications will keep their resume type only."
        loading={deleting}
      />
    </div>
  );
}
