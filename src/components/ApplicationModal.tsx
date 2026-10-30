import React, { useState, useEffect } from 'react';
import { X, Building2, Briefcase, MapPin, Calendar, Clock, Link2, DollarSign, FileText } from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types';
import { useCareer } from '../context/CareerContext';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationToEdit?: JobApplication | null;
  defaultStatus?: ApplicationStatus;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'Online Assessment',
  'Interview',
  'Offer',
  'Rejected',
];

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  applicationToEdit,
  defaultStatus = 'Applied',
}) => {
  const { addApplication, updateApplication, resumeVersions } = useCareer();

  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>(defaultStatus);
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [deadlineDate, setDeadlineDate] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [interviewDateTime, setInterviewDateTime] = useState('');
  const [salary, setSalary] = useState('');
  const [resumeVersionId, setResumeVersionId] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ company?: string; role?: string }>({});

  useEffect(() => {
    if (applicationToEdit) {
      setCompany(applicationToEdit.company);
      setRole(applicationToEdit.role);
      setLocation(applicationToEdit.location || '');
      setStatus(applicationToEdit.status);
      setApplicationDate(applicationToEdit.applicationDate || new Date().toISOString().split('T')[0]);
      setDeadlineDate(applicationToEdit.deadlineDate || '');
      setApplicationUrl(applicationToEdit.applicationUrl || '');
      setInterviewDateTime(applicationToEdit.interviewDateTime || '');
      setSalary(applicationToEdit.salary || '');
      setResumeVersionId(applicationToEdit.resumeVersionId || '');
      setNotes(applicationToEdit.notes || '');
    } else {
      setCompany('');
      setRole('');
      setLocation('');
      setStatus(defaultStatus);
      setApplicationDate(new Date().toISOString().split('T')[0]);
      setDeadlineDate('');
      setApplicationUrl('');
      setInterviewDateTime('');
      setSalary('');
      setResumeVersionId(resumeVersions[0]?.id || '');
      setNotes('');
    }
    setErrors({});
  }, [applicationToEdit, defaultStatus, isOpen, resumeVersions]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { company?: string; role?: string } = {};

    if (!company.trim()) {
      newErrors.company = 'Company name is required';
    }
    if (!role.trim()) {
      newErrors.role = 'Job role is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || 'Remote',
      status,
      applicationDate,
      deadlineDate: deadlineDate || undefined,
      applicationUrl: applicationUrl.trim() || undefined,
      interviewDateTime: interviewDateTime || undefined,
      salary: salary.trim() || undefined,
      resumeVersionId: resumeVersionId || undefined,
      notes: notes.trim(),
    };

    if (applicationToEdit) {
      updateApplication(applicationToEdit.id, payload);
    } else {
      addApplication(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8">
        {/* Modal Header */}
        <div className="bg-[#0B192C] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold font-display">
              {applicationToEdit ? 'Edit Job Application' : 'Track New Job Application'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Company & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Google, Microsoft, Stripe"
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (errors.company) setErrors((prev) => ({ ...prev, company: undefined }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.company ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.company && (
                <p className="text-xs text-rose-600 mt-1">{errors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Job Role / Position *
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. SWE Intern, Graduate Engineer"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
                  }}
                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.role ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {errors.role && (
                <p className="text-xs text-rose-600 mt-1">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Row 2: Location & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Remote, Seattle WA, Bengaluru"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Application Status Stage
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Application Date & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Application Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={applicationDate}
                  onChange={(e) => setApplicationDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Application Deadline (Optional)
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Interview Schedule & Resume Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Interview / OA Date &amp; Time
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="datetime-local"
                  value={interviewDateTime}
                  onChange={(e) => setInterviewDateTime(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-purple-900"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Triggers dashboard alerts and countdowns.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Resume Version Used
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={resumeVersionId}
                  onChange={(e) => setResumeVersionId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default Profile</option>
                  {resumeVersions.map((res) => (
                    <option key={res.id} value={res.id}>
                      {res.name} ({res.targetDomain})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 5: Job Link & Compensation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Job Posting URL
              </label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://company.com/careers/..."
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Stipend / CTC / Salary
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. $55/hr or ₹22 LPA"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Personal Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Personal Notes &amp; Preparation Reminders
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Referral by alumni, round 1 prep topics, behavioral STAR questions to emphasize..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              {applicationToEdit ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
