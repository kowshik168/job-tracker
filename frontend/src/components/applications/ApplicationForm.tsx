import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import {
  RESUME_TYPES,
  SOURCES,
  STATUSES,
  CURRENT_ROUNDS,
  RESUME_TYPE_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  CURRENT_ROUND_LABELS,
} from '../../lib/constants';
import { toDateInputValue } from '../../lib/utils';
import { getResumes } from '../../api/resumes';
import type {
  Application,
  ApplicationStatus,
  CreateApplicationInput,
  CurrentRound,
  Resume,
  ResumeType,
} from '../../types';

interface ApplicationFormProps {
  initial?: Application;
  onSubmit: (data: CreateApplicationInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ApplicationForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Application',
}: ApplicationFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [company, setCompany] = useState(initial?.company ?? '');
  const [role, setRole] = useState(initial?.role ?? '');
  const [jobUrl, setJobUrl] = useState(initial?.jobUrl ?? '');
  const [appliedAt, setAppliedAt] = useState(
    toDateInputValue(initial?.appliedAt) || new Date().toISOString().split('T')[0],
  );
  const [source, setSource] = useState(initial?.source ?? '');
  const [referral, setReferral] = useState(initial?.referral ?? '');
  const [resumeType, setResumeType] = useState(initial?.resumeType ?? '');
  const [resumeId, setResumeId] = useState(initial?.resumeId ?? initial?.resume?.id ?? '');
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [status, setStatus] = useState<ApplicationStatus>(
    initial?.status ?? 'APPLIED',
  );
  const [currentRound, setCurrentRound] = useState<CurrentRound>(
    initial?.currentRound ?? 'NONE',
  );
  const [recruiterName, setRecruiterName] = useState(initial?.recruiterName ?? '');
  const [recruiterContact, setRecruiterContact] = useState(
    initial?.recruiterContact ?? '',
  );
  const [followUpDate, setFollowUpDate] = useState(
    toDateInputValue(initial?.followUpDate),
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');

  useEffect(() => {
    getResumes()
      .then(setResumes)
      .catch(() => setResumes([]));
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!company.trim()) newErrors.company = 'Company is required';
    if (!role.trim()) newErrors.role = 'Role is required';
    if (!appliedAt) newErrors.appliedAt = 'Applied date is required';
    if (!resumeType) newErrors.resumeType = 'Resume type is required';
    if (!status) newErrors.status = 'Status is required';
    if (jobUrl && !/^https?:\/\/.+/.test(jobUrl)) {
      newErrors.jobUrl = 'Must be a valid URL';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data: CreateApplicationInput = {
        company: company.trim(),
        role: role.trim(),
        appliedAt,
        resumeType: resumeType as CreateApplicationInput['resumeType'],
        resumeId: resumeId || undefined,
        status: status as CreateApplicationInput['status'],
        currentRound: currentRound as CreateApplicationInput['currentRound'],
        jobUrl: jobUrl.trim() || undefined,
        source: (source || undefined) as CreateApplicationInput['source'],
        referral: referral.trim() || undefined,
        recruiterName: recruiterName.trim() || undefined,
        recruiterContact: recruiterContact.trim() || undefined,
        followUpDate: followUpDate || undefined,
        notes: notes.trim() || undefined,
      };
      await onSubmit(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Input
          label="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          error={errors.company}
          required
          placeholder="e.g. Google"
        />
        <Input
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          error={errors.role}
          required
          placeholder="e.g. Software Engineer"
        />
        <Input
          label="Applied Date"
          type="date"
          value={appliedAt}
          onChange={(e) => setAppliedAt(e.target.value)}
          error={errors.appliedAt}
          required
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
          error={errors.status}
          required
          options={STATUSES.map((s) => ({
            value: s,
            label: STATUS_LABELS[s],
          }))}
        />
        <Select
          label="Stored resume"
          value={resumeId}
          onChange={(e) => {
            const nextId = e.target.value;
            setResumeId(nextId);
            const selected = resumes.find((r) => r.id === nextId);
            if (selected) setResumeType(selected.resumeType);
          }}
          placeholder="None — type only"
          options={resumes.map((r) => ({
            value: r.id,
            label: `${r.name} (${RESUME_TYPE_LABELS[r.resumeType]})`,
          }))}
        />
        <Select
          label="Resume Type"
          value={resumeType}
          onChange={(e) => setResumeType(e.target.value as ResumeType)}
          error={errors.resumeType}
          required
          placeholder="Select resume type"
          options={RESUME_TYPES.map((r) => ({
            value: r,
            label: RESUME_TYPE_LABELS[r],
          }))}
        />
        {resumes.length === 0 && (
          <p className="sm:col-span-2 -mt-3 text-xs text-slate-500">
            No stored resumes yet.{' '}
            <Link to="/resumes" className="text-blue-600 hover:text-blue-700">
              Upload one
            </Link>{' '}
            to attach the exact file you applied with.
          </p>
        )}
        <Select
          label="Current Round"
          value={currentRound}
          onChange={(e) => setCurrentRound(e.target.value as CurrentRound)}
          options={CURRENT_ROUNDS.map((r) => ({
            value: r,
            label: CURRENT_ROUND_LABELS[r],
          }))}
        />
        <Input
          label="Job URL"
          type="url"
          value={jobUrl}
          onChange={(e) => setJobUrl(e.target.value)}
          error={errors.jobUrl}
          placeholder="https://..."
        />
        <Select
          label="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="Select source"
          options={SOURCES.map((s) => ({
            value: s,
            label: SOURCE_LABELS[s],
          }))}
        />
        <Input
          label="Referral"
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
          placeholder="Referrer name"
        />
        <Input
          label="Follow-up Date"
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
        />
        <Input
          label="Recruiter Name"
          value={recruiterName}
          onChange={(e) => setRecruiterName(e.target.value)}
        />
        <Input
          label="Recruiter Contact"
          value={recruiterContact}
          onChange={(e) => setRecruiterContact(e.target.value)}
          placeholder="email or phone"
        />
      </div>

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Interview notes, feedback, next steps..."
        rows={4}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
