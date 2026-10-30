import React from 'react';
import {
  Briefcase,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  Sparkles,
  Info,
} from 'lucide-react';
import { useCareer } from '../context/CareerContext';
import { getDeadlineUrgency, isInterviewUpcoming, formatDateTime } from '../utils/dateUtils';
import { JobApplication } from '../types';

interface KPISummaryProps {
  onSelectApplication?: (app: JobApplication) => void;
  onFilterUrgent?: () => void;
}

export const KPISummary: React.FC<KPISummaryProps> = ({ onSelectApplication }) => {
  const { applications, hasDemoData, clearDemoApplications } = useCareer();

  const total = applications.length;
  const inPipeline = applications.filter((a) =>
    ['Applied', 'Online Assessment', 'Interview'].includes(a.status)
  ).length;

  const urgentDeadlines = applications.filter((a) => {
    if (['Offer', 'Rejected'].includes(a.status)) return false;
    const urgency = getDeadlineUrgency(a.deadlineDate);
    return urgency && urgency.isUrgent && !urgency.isExpired;
  });

  const offers = applications.filter((a) => a.status === 'Offer').length;
  const offerRate = total > 0 ? Math.round((offers / total) * 100) : 0;

  // Find nearest upcoming interview
  const upcomingInterviews = applications
    .filter((a) => a.interviewDateTime)
    .map((a) => ({ app: a, urgency: isInterviewUpcoming(a.interviewDateTime) }))
    .filter((item) => item.urgency && item.urgency.isUpcoming)
    .sort((a, b) => {
      const timeA = new Date(a.app.interviewDateTime!).getTime();
      const timeB = new Date(b.app.interviewDateTime!).getTime();
      return timeA - timeB;
    });

  const nextInterview = upcomingInterviews[0];

  return (
    <div className="space-y-4 mb-6">
      {/* Demo Data Notice */}
      {hasDemoData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-blue-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Sample Demo Mode:</strong> You are viewing pre-loaded demo applications for a B.Tech CS candidate. Your additions are automatically saved in local storage.
            </span>
          </div>
          <button
            onClick={clearDemoApplications}
            className="font-semibold text-blue-700 hover:text-blue-900 underline whitespace-nowrap shrink-0 text-xs"
          >
            Remove Sample Data
          </button>
        </div>
      )}

      {/* Urgent Interview / Assessment Banner */}
      {nextInterview && (
        <div className="bg-purple-900 text-white rounded-lg p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border border-purple-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-700/80 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-purple-300">
                  Upcoming Interview Alert
                </span>
                <span className="text-xs bg-purple-800 text-purple-100 px-2 py-0.5 rounded font-mono">
                  {nextInterview.urgency?.label}
                </span>
              </div>
              <p className="text-sm font-medium mt-0.5">
                <strong>{nextInterview.app.company}</strong> — {nextInterview.app.role} scheduled for{' '}
                <span className="font-mono text-purple-200">
                  {formatDateTime(nextInterview.app.interviewDateTime)}
                </span>
              </p>
            </div>
          </div>
          {onSelectApplication && (
            <button
              onClick={() => onSelectApplication(nextInterview.app)}
              className="text-xs bg-purple-800 hover:bg-purple-700 text-white font-medium px-3 py-1.5 rounded transition-colors whitespace-nowrap shrink-0"
            >
              View Prep Notes
            </button>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Tracked</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {total}
            </span>
            <span className="text-xs text-slate-500">jobs &amp; internships</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Active pipeline:</span>
            <strong className="text-slate-700 font-mono">{inPipeline}</strong>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Interviews &amp; OAs</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-purple-700 font-mono tabular-nums">
              {applications.filter((a) => ['Online Assessment', 'Interview'].includes(a.status)).length}
            </span>
            <span className="text-xs text-slate-500">active rounds</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Next up:</span>
            <strong className="text-slate-700 truncate max-w-[140px]">
              {nextInterview ? nextInterview.app.company : 'None scheduled'}
            </strong>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Urgent Deadlines</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono tabular-nums">
              {urgentDeadlines.length}
            </span>
            <span className="text-xs text-slate-500">due &le; 3 days</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {urgentDeadlines.length > 0 ? (
              <span className="text-amber-700 font-medium truncate block">
                {urgentDeadlines[0].company}: due soon
              </span>
            ) : (
              <span className="text-slate-500">No urgent deadlines</span>
            )}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Offers &amp; Rate</span>
            <Award className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 font-mono tabular-nums">
              {offers}
            </span>
            <span className="text-xs text-slate-500">({offerRate}%)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Rejected:</span>
            <strong className="text-slate-600 font-mono">
              {applications.filter((a) => a.status === 'Rejected').length}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
