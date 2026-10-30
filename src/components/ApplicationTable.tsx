import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  FileText,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types';
import { useCareer } from '../context/CareerContext';
import { formatReadableDate, getDeadlineUrgency, formatDateTime } from '../utils/dateUtils';

interface ApplicationTableProps {
  onEditApplication: (app: JobApplication) => void;
  onDeleteApplication: (app: JobApplication) => void;
  onAnalyzeApplication: (app: JobApplication) => void;
  onOpenNewModal: () => void;
}

const ALL_STATUSES: ApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'Online Assessment',
  'Interview',
  'Offer',
  'Rejected',
];

export const ApplicationTable: React.FC<ApplicationTableProps> = ({
  onEditApplication,
  onDeleteApplication,
  onAnalyzeApplication,
  onOpenNewModal,
}) => {
  const { applications, updateStatus, resumeVersions } = useCareer();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'appDate' | 'deadline' | 'company' | 'status'>('appDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const getResumeName = (id?: string) => {
    if (!id) return null;
    const r = resumeVersions.find((ver) => ver.id === id);
    return r ? r.name : null;
  };

  const filteredAndSortedApps = useMemo(() => {
    return applications
      .filter((app) => {
        // Status filter
        if (selectedStatus !== 'ALL' && app.status !== selectedStatus) {
          return false;
        }
        // Search query
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          app.company.toLowerCase().includes(q) ||
          app.role.toLowerCase().includes(q) ||
          app.location.toLowerCase().includes(q) ||
          app.notes.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'appDate') {
          comp = new Date(a.applicationDate).getTime() - new Date(b.applicationDate).getTime();
        } else if (sortBy === 'deadline') {
          const deadA = a.deadlineDate ? new Date(a.deadlineDate).getTime() : Infinity;
          const deadB = b.deadlineDate ? new Date(b.deadlineDate).getTime() : Infinity;
          comp = deadA - deadB;
        } else if (sortBy === 'company') {
          comp = a.company.localeCompare(b.company);
        } else if (sortBy === 'status') {
          comp = a.status.localeCompare(b.status);
        }
        return sortOrder === 'desc' ? -comp : comp;
      });
  }, [applications, searchQuery, selectedStatus, sortBy, sortOrder]);

  const toggleSort = (field: 'appDate' | 'deadline' | 'company' | 'status') => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'Offer':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Interview':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Online Assessment':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Applied':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Wishlist':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, role, location, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="ALL">All Statuses ({applications.length})</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st} ({applications.filter((a) => a.status === st).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-') as [any, any];
                setSortBy(f);
                setSortOrder(o);
              }}
              className="bg-transparent focus:outline-none text-xs font-medium cursor-pointer"
            >
              <option value="appDate-desc">Applied: Newest First</option>
              <option value="appDate-asc">Applied: Oldest First</option>
              <option value="deadline-asc">Deadline: Soonest First</option>
              <option value="company-asc">Company: A to Z</option>
              <option value="status-asc">Status Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 text-xs font-semibold uppercase tracking-wider">
              <th
                onClick={() => toggleSort('company')}
                className="py-3 px-4 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Company &amp; Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">Location</th>
              <th
                onClick={() => toggleSort('status')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status Stage</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => toggleSort('appDate')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200/60 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Applied / Deadline</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3">Interview Schedule</th>
              <th className="py-3 px-3">Resume Version</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {filteredAndSortedApps.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-medium text-slate-700">No applications match your criteria</p>
                    <p className="text-xs text-slate-400">
                      Try clearing search or filters to see all your applications.
                    </p>
                    <button
                      onClick={onOpenNewModal}
                      className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      + Create Application
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAndSortedApps.map((app) => {
                const urgency = getDeadlineUrgency(app.deadlineDate);
                const resumeName = getResumeName(app.resumeVersionId);

                return (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 transition-colors group text-slate-800"
                  >
                    {/* Company & Role */}
                    <td className="py-3.5 px-4 font-medium">
                      <div className="flex items-start gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {app.company}
                            </span>
                            {app.isDemo && (
                              <span className="text-[10px] font-mono text-slate-400 border border-slate-200 rounded px-1">
                                Demo
                              </span>
                            )}
                            {app.applicationUrl && (
                              <a
                                href={app.applicationUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Open job posting"
                                className="text-slate-400 hover:text-blue-600 inline-block"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <span className="text-xs text-slate-600 block mt-0.5">{app.role}</span>
                          {app.notes && (
                            <span className="text-[11px] text-slate-400 block line-clamp-1 italic mt-0.5">
                              {app.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3 text-xs text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{app.location || 'Remote'}</span>
                      </div>
                      {app.salary && (
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          {app.salary}
                        </div>
                      )}
                    </td>

                    {/* Status dropdown */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                        className={`text-xs font-semibold rounded-md px-2.5 py-1 border transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white text-slate-900 font-normal">
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Applied Date & Deadline */}
                    <td className="py-3.5 px-3 text-xs whitespace-nowrap">
                      <div className="font-mono text-slate-700">
                        {formatReadableDate(app.applicationDate)}
                      </div>
                      {app.deadlineDate ? (
                        <div className="mt-1">
                          {urgency && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium font-mono ${
                                urgency.isExpired
                                  ? 'text-rose-600'
                                  : urgency.isUrgent
                                  ? 'text-amber-700 font-bold'
                                  : 'text-slate-500'
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {urgency.label}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">No deadline</span>
                      )}
                    </td>

                    {/* Interview Schedule */}
                    <td className="py-3.5 px-3 text-xs whitespace-nowrap">
                      {app.interviewDateTime ? (
                        <div className="flex items-center gap-1.5 text-purple-700 font-medium font-mono bg-purple-50 px-2 py-1 rounded border border-purple-200">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatDateTime(app.interviewDateTime)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Resume Version */}
                    <td className="py-3.5 px-3 text-xs text-slate-600 whitespace-nowrap">
                      {resumeName ? (
                        <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{resumeName}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">Default profile</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAnalyzeApplication(app)}
                          title="Run AI JD Gap Analysis"
                          className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span>AI Match</span>
                        </button>
                        <button
                          onClick={() => onEditApplication(app)}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteApplication(app)}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer Count */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
        <span>
          Showing <strong>{filteredAndSortedApps.length}</strong> of{' '}
          <strong>{applications.length}</strong> total applications
        </span>
        <button
          onClick={onOpenNewModal}
          className="text-blue-600 hover:text-blue-800 font-semibold"
        >
          + Add New Application
        </button>
      </div>
    </div>
  );
};
