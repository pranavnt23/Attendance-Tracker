import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award } from 'lucide-react';

const SubjectCard = ({ subject }) => {
  const { subject_id, subject_code, subject_name, attendance_percentage = 100 } = subject;

  // Determine badge colors based on percentage thresholds
  let percentageColor = 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800';
  let indicatorBar = 'bg-indigo-600 dark:bg-indigo-400';
  
  if (attendance_percentage < 50) {
    percentageColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    indicatorBar = 'bg-rose-500';
  } else if (attendance_percentage < 75) {
    percentageColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    indicatorBar = 'bg-amber-500';
  } else if (attendance_percentage >= 75) {
    percentageColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    indicatorBar = 'bg-emerald-500';
  }

  return (
    <Link
      to={`/subjects/${subject_id}`}
      className="glass-panel border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group animate-fade-in"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wider">
            {subject_code}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-sm font-bold border ${percentageColor}`}>
            {attendance_percentage}%
          </span>
        </div>

        <h3 className="text-md font-display font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors line-clamp-2">
          {subject_name}
        </h3>
      </div>

      <div className="mt-6">
        {/* Simple Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-4">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${indicatorBar}`}
            style={{ width: `${Math.min(100, Math.max(0, attendance_percentage))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold pt-2 border-t border-slate-50 dark:border-slate-800">
          <span>View Detailed Log</span>
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard;
