import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Calendar, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { useAttendance } from '../../hooks/useAttendance';
import { formatShortDate } from '../../utils/dateUtils';

const DrillDown = () => {
  const { status } = useParams();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(null);

  const { useSubjectWiseStats, useHistory } = useAttendance();
  const subjectsQuery = useSubjectWiseStats();
  const historyQuery = useHistory();

  const isLoading = subjectsQuery.isLoading || historyQuery.isLoading;

  if (isLoading) {
    return <Loader message="Loading drill-down details..." size="large" />;
  }

  const subjects = subjectsQuery.data || [];
  const history = historyQuery.data || [];

  // Map status values to UI strings and styles
  const statusMeta = {
    P: {
      label: 'Present Sessions',
      color: 'emerald',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle
    },
    A: {
      label: 'Absent Sessions',
      color: 'rose',
      bgLight: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-100 dark:border-rose-900/50',
      text: 'text-rose-600 dark:text-rose-400',
      icon: XCircle
    },
    OD: {
      label: 'On Duty (OD) Sessions',
      color: 'amber',
      bgLight: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-100 dark:border-amber-900/50',
      text: 'text-amber-600 dark:text-amber-400',
      icon: Calendar
    }
  };

  const currentMeta = statusMeta[status] || statusMeta.P;
  const StatusIcon = currentMeta.icon;

  // View 1: Subject Selection Page
  if (!selectedSubject) {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4 border-0 bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <PageHeader
            title={currentMeta.label}
            description="Select a subject below to audit logged class dates and reasons."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const count = history.filter(
              (h) =>
                h.subject_name.toLowerCase() === sub.subject_name.toLowerCase() &&
                h.status === status
            ).length;

            return (
              <button
                key={sub.subject_id}
                onClick={() => setSelectedSubject(sub)}
                className="glass-panel border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-350 dark:hover:border-slate-700 hover:scale-[1.01] transition-all duration-300 text-left flex flex-col justify-between group cursor-pointer bg-white dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      {sub.subject_code}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${currentMeta.bgLight} ${currentMeta.border} ${currentMeta.text}`}
                    >
                      {count} {count === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                  <h3 className="text-md font-display font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    {sub.subject_name}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-4 mt-6 border-t border-slate-50 dark:border-slate-800/60">
                  <span>View Session Logs</span>
                  <StatusIcon className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // View 2: History Dates for Selected Subject
  const filteredLogs = history.filter(
    (h) =>
      h.subject_name.toLowerCase() === selectedSubject.subject_name.toLowerCase() &&
      h.status === status
  );

  return (
    <div className="space-y-6">
      <div>
        <button
          onClick={() => setSelectedSubject(null)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4 border-0 bg-transparent cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Subject Selection
        </button>
        <PageHeader
          title={selectedSubject.subject_name}
          description={`Showing logged ${currentMeta.label.toLowerCase()} for Subject Code: ${selectedSubject.subject_code}`}
        />
      </div>

      <div className="glass-panel border rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <StatusIcon className={`w-5 h-5 ${currentMeta.text}`} />
          <h3 className="text-sm font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
            Logged Session History
          </h3>
        </div>

        {filteredLogs.length === 0 ? (
          <EmptyState
            icon={StatusIcon}
            title="No Records Found"
            description={`Good news! You have no ${currentMeta.label.toLowerCase().replace('sessions', 'logs')} for this subject.`}
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log, index) => (
              <div
                key={index}
                className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatShortDate(log.date)}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Slot {log.slot_no} • {log.day}
                  </p>
                </div>

                {status === 'OD' && (
                  <div className="px-3.5 py-2 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-xs text-slate-600 dark:text-slate-400 sm:max-w-xs">
                    <span className="font-bold text-amber-600 dark:text-amber-500 block mb-0.5 text-[10px] uppercase tracking-wider">
                      Duty Reason
                    </span>
                    {log.od_reason || 'Attending college seminar/hackathon event.'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrillDown;
