import React from 'react';
import { Clock, User } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const ActualTimetable = ({ slots = [] }) => {
  if (slots.length === 0) {
    return (
      <div className="glass-panel border rounded-3xl p-8 text-center text-slate-500 dark:text-slate-400 font-medium">
        No classes scheduled or recorded for this date.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {slots.map((slot) => {
        // Map status
        const isMarked = slot.attendance_status !== 'NOT_MARKED';
        const displayStatus = isMarked ? slot.attendance_status : 'Not Conducted / Pending';

        return (
          <div 
            key={slot.slot_no}
            className={`glass-panel border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 ${
              isMarked
                ? slot.attendance_status === 'P' 
                  ? 'border-emerald-500/20 bg-emerald-500/[0.02]' 
                  : slot.attendance_status === 'A' 
                    ? 'border-rose-500/20 bg-rose-500/[0.02]' 
                    : slot.attendance_status === 'OD'
                      ? 'border-amber-500/20 bg-amber-500/[0.02]'
                      : ''
                : 'border-dashed border-slate-200/80 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/5'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Slot Number Label */}
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50 font-display">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Slot</span>
                <span className="text-lg font-bold leading-none mt-1">{slot.slot_no}</span>
              </div>

              <div>
                <h4 className={`text-md font-display font-bold ${
                  isMarked 
                    ? 'text-slate-900 dark:text-white' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {slot.subject_name || 'No Subject Assigned'}
                </h4>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {slot.start_time?.substring(0, 5)} - {slot.end_time?.substring(0, 5)}
                  </span>
                  {slot.faculty && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {slot.faculty}
                    </span>
                  )}
                  {!isMarked && (
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-slate-800/40 px-1.5 py-0.5 rounded">
                      Planned
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Panel */}
            <div className="flex items-center sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
              {isMarked ? (
                <StatusBadge status={slot.attendance_status} />
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-800 text-white dark:bg-slate-800 dark:text-white border border-slate-700 dark:border-slate-700 shadow-sm">
                  Unmarked
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActualTimetable;
