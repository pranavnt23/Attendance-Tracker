import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Clock, Users, ArrowRight, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { formatShortDate } from '../../utils/dateUtils';
import attendanceService from '../../services/attendanceService';

const SessionCard = ({ session }) => {
  const queryClient = useQueryClient();
  const { session_id, session_date, slot_no, subject_name, faculty_name, attendance_count } = session;

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to remove the session for ${subject_name}?`)) {
      await attendanceService.deleteSessionFromCache(session_id);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    }
  };

  return (
    <div className="glass-panel border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between animate-fade-in">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
            Slot {slot_no}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            {formatShortDate(session_date)}
          </span>
        </div>

        <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
          {subject_name}
        </h3>

        <div className="space-y-2 mt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <User className="w-4 h-4 text-slate-400" />
            <span className="truncate">{faculty_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{attendance_count} Students Present</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to={`/rep/edit-attendance/${session_id}`}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Edit Records
          </Link>
          <button
            onClick={handleDelete}
            className="text-xs font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-450 dark:hover:text-rose-450 transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0"
            title="Delete Session"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <Link
          to={`/rep/sessions/${session_id}`}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default SessionCard;
