import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Trash2 } from 'lucide-react';
import {
  deleteResume,
  getResumes,
  uploadResume,
} from '../api/resumes';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { ConfirmDialog } from '../components/ui/Modal';
import { EmptyState, ErrorState, PageLoader } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { RESUME_TYPE_LABELS, RESUME_TYPES } from '../lib/constants';
import { formatDate, formatFileSize } from '../lib/utils';
import { getErrorMessage } from '../lib/errors';
import type { Resume, ResumeType } from '../types';

export function ResumesPage() {
  const { showToast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [resumeType, setResumeType] = useState<ResumeType>('BACKEND_SDE');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setResumes(await getResumes());
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load resumes.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('Choose a PDF or Word file to upload.', 'error');
      return;
    }
    if (!name.trim()) {
      showToast('Give this resume a name.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name.trim());
      formData.append('resumeType', resumeType);
      if (notes.trim()) formData.append('notes', notes.trim());
      await uploadResume(formData);
      showToast('Resume saved');
      setName('');
      setNotes('');
      setFile(null);
      await load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not upload resume.'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteResume(deleteId);
      showToast('Resume deleted');
      setDeleteId(null);
      await load();
    } catch (err) {
      showToast(getErrorMessage(err, 'Could not delete resume.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resumes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Store the versions you apply with, then capture what you learned after
          a rejection.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Upload resume
        </h2>
        <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Backend SDE — March 2026"
            required
          />
          <Select
            label="Resume type"
            value={resumeType}
            onChange={(e) => setResumeType(e.target.value as ResumeType)}
            options={RESUME_TYPES.map((type) => ({
              value: type,
              label: RESUME_TYPE_LABELS[type],
            }))}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">
              File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            />
            <p className="text-xs text-slate-400">PDF or Word, up to 5 MB</p>
          </div>
          <Textarea
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What this version emphasizes..."
            rows={3}
          />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Save resume'}
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : resumes.length === 0 ? (
        <EmptyState
          title="No resumes yet"
          description="Upload a version so you can attach it when you apply."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <Link
                      to={`/resumes/${resume.id}`}
                      className="font-semibold text-slate-900 hover:text-blue-700"
                    >
                      {resume.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {RESUME_TYPE_LABELS[resume.resumeType]} ·{' '}
                      {formatFileSize(resume.fileSize)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDeleteId(resume.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Delete resume"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Used on {resume._count?.applications ?? 0} application
                {(resume._count?.applications ?? 0) === 1 ? '' : 's'} ·{' '}
                {resume._count?.learnings ?? 0} learning
                {(resume._count?.learnings ?? 0) === 1 ? '' : 's'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Added {formatDate(resume.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete resume"
        message="This file will be removed. Applications that used it will keep their resume type, but the file link will be cleared. Learnings on this resume will also be deleted."
        loading={deleting}
      />
    </div>
  );
}
