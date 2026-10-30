import React from 'react';
import {
  Sparkles,
  ExternalLink,
  Calendar,
  Clock,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  FileText,
  MapPin,
  Edit2,
  Trash2,
  Plus,
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '../types';
import { useCareer } from '../context/CareerContext';
import { formatReadableDate, getDeadlineUrgency, formatDateTime } from '../utils/dateUtils';

interface KanbanBoardProps {
  onEditApplication: (app: JobApplication) => void;
  onDeleteApplication: (app: JobApplication) => void;
  onAnalyzeApplication: (app: JobApplication) => void;
  onAddNewToStatus: (status: ApplicationStatus) => void;
}

const COLUMNS: { status: ApplicationStatus; label: string; color: string; border: string; bg: string }[] = [
  {
    status: 'Wishlist',
    label: 'Wishlist / To Apply',
    color: 'text-slate-700',
    border: 'border-slate-300',
    bg: 'bg-slate-100',
  },
  {
    status: 'Applied',
    label: 'Applied',
    color: 'text-blue-700',
    border: 'border-blue-300',
    bg: 'bg-blue-50',
  },
  {
    status: 'Online Assessment',
    label: 'OA / Coding Test',
    color: 'text-amber-700',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
  },
  {
    status: 'Interview',
    label: 'Interviewing',
    color: 'text-purple-700',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
  },
  {
    status: 'Offer',
    label: 'Offers Received',
    color: 'text-emerald-700',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
  },
  {
    status: 'Rejected',
    label: 'Archived / Rejected',
    color: 'text-rose-700',
    border: 'border-rose-300',
    bg: 'bg-rose-50',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onEditApplication,
  onDeleteApplication,
  onAnalyzeApplication,
  onAddNewToStatus,
}) => {
  const { applications, updateStatus, resumeVersions } = useCareer();

  const getResumeName = (id?: string) => {
    if (!id) return null;
    const r = resumeVersions.find((ver) => ver.id === id);
    return r ? r.name : null;
  };

  const getStatusIndex = (current: ApplicationStatus) => {
    return COLUMNS.findIndex((c) => c.status === current);
  };

  const moveStatus = (app: JobApplication, direction: 'prev' | 'next') => {
    const idx = getStatusIndex(app.status);
    if (direction === 'next' && idx < COLUMNS.length - 1) {
      updateStatus(app.id, COLUMNS[idx + 1].status);
    } else if (direction === 'prev' && idx > 0) {
      updateStatus(app.id, COLUMNS[idx - 1].status);
    }
  };

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-4 min-w-[1280px]">
        {COLUMNS.map((col, colIndex) => {
          const colApps = applications.filter((app) => app.status === col.status);

          return (
            <div
              key={col.status}
              className="flex-1 flex flex-col bg-slate-50/80 rounded-xl border border-slate-200/90 p-3 min-w-[280px] max-w-[340px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-700">
                    {colApps.length}
                  </span>
                </div>
                <button
                  onClick={() => onAddNewToStatus(col.status)}
                  title={`Add to ${col.label}`}
                  className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cards List */}
              <div className="flex-1 space-y-3 min-h-[300px]">
                {colApps.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center">
                    <span>No applications here</span>
                    <button
                      onClick={() => onAddNewToStatus(col.status)}
                      className="mt-1.5 text-blue-600 hover:underline font-medium"
                    >
                      + Add an application
                    </button>
                  </div>
                ) : (
                  colApps.map((app) => {
                    const urgency = getDeadlineUrgency(app.deadlineDate);
                    const resumeName = getResumeName(app.resumeVersionId);

                    return (
                      <div
                        key={app.id}
                        className="bg-white rounded-lg border border-slate-200/80 p-3.5 shadow-sm hover:shadow transition-all group relative"
                      >
                        {/* Company & Role */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-slate-900 text-sm font-display leading-tight group-hover:text-blue-600 transition-colors">
                                {app.company}
                              </h4>
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
                                  title="Open job link"
                                  className="text-slate-400 hover:text-blue-600"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-slate-700 font-medium mt-0.5 line-clamp-1">
                              {app.role}
                            </p>
                          </div>
                        </div>

                        {/* Location & Metadata */}
                        <div className="mt-2 text-xs text-slate-500 space-y-1">
                          {app.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{app.location}</span>
                            </div>
                          )}

                          {app.salary && (
                            <div className="text-[11px] font-mono text-slate-600 font-medium">
                              💰 {app.salary}
                            </div>
                          )}

                          {/* Interview schedule badge */}
                          {app.interviewDateTime && (
                            <div className="bg-purple-50 text-purple-800 border border-purple-200 rounded px-2 py-1 text-[11px] font-medium flex items-center gap-1.5 mt-1.5">
                              <Calendar className="w-3 h-3 text-purple-600 shrink-0" />
                              <span className="truncate">
                                {formatDateTime(app.interviewDateTime)}
                              </span>
                            </div>
                          )}

                          {/* Deadline badge */}
                          {urgency && (
                            <div
                              className={`rounded px-2 py-0.5 text-[11px] font-medium flex items-center gap-1.5 mt-1 ${
                                urgency.isExpired
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : urgency.isUrgent
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200 font-semibold'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <Clock className="w-3 h-3 shrink-0" />
                              <span className="truncate">{urgency.label}</span>
                            </div>
                          )}
                        </div>

                        {/* Notes snippet */}
                        {app.notes && (
                          <p className="mt-2 text-[11px] text-slate-500 line-clamp-2 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                            "{app.notes}"
                          </p>
                        )}

                        {/* Resume version badge */}
                        {resumeName && (
                          <div className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-600">
                            <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">Resume: {resumeName}</span>
                          </div>
                        )}

                        {/* Card Footer: Quick Actions & Stage Movers */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                          {/* Stage Mover */}
                          <div className="flex items-center gap-1">
                            <button
                              disabled={colIndex === 0}
                              onClick={() => moveStatus(app, 'prev')}
                              title="Move to previous stage"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                              Stage
                            </span>
                            <button
                              disabled={colIndex === COLUMNS.length - 1}
                              onClick={() => moveStatus(app, 'next')}
                              title="Move to next stage"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Actions: AI Analyze, Edit, Delete */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onAnalyzeApplication(app)}
                              title="AI Match & Tailor Resume"
                              className="flex items-center gap-1 px-1.5 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                            >
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              <span>AI</span>
                            </button>
                            <button
                              onClick={() => onEditApplication(app)}
                              title="Edit application"
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteApplication(app)}
                              title="Delete application"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
