import React from 'react';
import { Clock, User, AlertCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const statusConfig = {
  P: {
    border: 'border-emerald-200/60 dark:border-emerald-900/40',
    bg: 'bg-gradient-to-r from-emerald-500/[0.04] to-transparent',
    dot: 'bg-emerald-500',
  },
  A: {
    border: 'border-rose-200/60 dark:border-rose-900/40',
    bg: 'bg-gradient-to-r from-rose-500/[0.04] to-transparent',
    dot: 'bg-rose-500',
  },
  OD: {
    border: 'border-amber-200/60 dark:border-amber-900/40',
    bg: 'bg-gradient-to-r from-amber-500/[0.04] to-transparent',
    dot: 'bg-amber-500',
  },
};

const ActualTimetable = ({ slots = [], subjectWiseStats = [], activeTab = 'official' }) => {
  if (slots.length === 0) {
    return (
      <div className="glass-panel border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No classes today</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Nothing scheduled or recorded for today.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 animate-fade-in">
      {slots.map((slot) => {
        const isMarked = slot.attendance_status !== 'NOT_MARKED';
        const config = isMarked ? statusConfig[slot.attendance_status] : null;

        const subjectStat = subjectWiseStats.find(
          (sub) => sub.subject_name?.toLowerCase() === slot.subject_name?.toLowerCase()
        );
        const percentage = subjectStat
          ? activeTab === 'official'
            ? subjectStat.attendance_percentage
            : subjectStat.attendance_percentage_od
          : null;
        const hasShortage = percentage !== null && percentage < 75;

        return (
          <div
            key={slot.slot_no}
            className={`glass-panel rounded-2xl border transition-all duration-200 overflow-hidden ${
              config
                ? `${config.border} ${config.bg}`
                : 'border-dashed border-slate-200/80 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/5'
            }`}
          >
            <div className="flex items-stretch gap-0">
              {/* Left colored strip + slot number */}
              <div className={`flex flex-col items-center justify-center px-3 py-3 shrink-0 border-r ${
                config ? config.border : 'border-slate-200/60 dark:border-slate-800'
              } min-w-[52px]`}>
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none">
                  Slot
                </span>
                <span className="text-xl font-display font-extrabold text-slate-800 dark:text-white leading-none mt-0.5">
                  {slot.slot_no}
                </span>
                {/* Status dot */}
                {isMarked && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${config?.dot || 'bg-slate-400'}`} />
                )}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {/* Shortage badge */}
                    {hasShortage && (
                      <div className="flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider">
                          Low Attendance ({percentage}%)
                        </span>
                      </div>
                    )}
                    <h4
                      className={`text-sm font-display font-bold leading-snug line-clamp-1 ${
                        isMarked ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {slot.subject_name || 'No Subject Assigned'}
                    </h4>
                    {/* Time + faculty row */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      {slot.start_time && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                          <Clock className="w-3 h-3" />
                          {slot.start_time?.substring(0, 5)} – {slot.end_time?.substring(0, 5)}
                        </span>
                      )}
                      {slot.faculty && (
                        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate max-w-[140px]">
                          <User className="w-3 h-3 shrink-0" />
                          <span className="truncate">{slot.faculty}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="shrink-0 mt-0.5">
                    {isMarked ? (
                      <StatusBadge status={slot.attendance_status} />
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-xl text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActualTimetable;
