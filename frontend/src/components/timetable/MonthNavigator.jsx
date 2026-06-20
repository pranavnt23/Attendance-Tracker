import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthDays, formatDateString } from '../../utils/dateUtils';
import { ATTENDANCE_STATUS } from '../../utils/constants';

const MonthNavigator = ({ pivotDate, onDateChange, historyRecords = [], onDateSelect, fullSize = false }) => {
  const calendarDays = getMonthDays(pivotDate);
  const selectedDateStr = formatDateString(pivotDate);

  const handlePrevMonth = () => {
    const prev = new Date(pivotDate);
    prev.setMonth(pivotDate.getMonth() - 1);
    onDateChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(pivotDate);
    next.setMonth(pivotDate.getMonth() + 1);
    onDateChange(next);
  };

  // Group history records by date for fast lookups
  const recordsMap = historyRecords.reduce((acc, rec) => {
    const dStr = rec.date; // backend returns YYYY-MM-DD
    if (!acc[dStr]) acc[dStr] = [];
    acc[dStr].push(rec);
    return acc;
  }, {});

  const getStatusSummaryForDate = (dateStr) => {
    const dayRecords = recordsMap[dateStr] || [];
    if (dayRecords.length === 0) return null;
    
    // Determine overall day status
    // If there is any absent, mark it warning/red. If all present, green. If some OD, yellow.
    const statuses = dayRecords.map(r => r.status);
    if (statuses.includes('A')) return ATTENDANCE_STATUS.ABSENT;
    if (statuses.includes('OD')) return ATTENDANCE_STATUS.OD;
    return ATTENDANCE_STATUS.PRESENT;
  };

  const monthLabel = pivotDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDaysHeader = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="glass-panel border rounded-3xl p-6 shadow-sm animate-fade-in">
      
      {/* Month Selector */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous Month"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h3 className="font-display font-extrabold text-md text-slate-800 dark:text-white">
          {monthLabel}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          aria-label="Next Month"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week days Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {weekDaysHeader.map(d => (
          <span key={d} className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarDays.map((cell) => {
          const dateStr = formatDateString(cell.date);
          const isSelected = dateStr === selectedDateStr;
          const status = getStatusSummaryForDate(dateStr);
          const dayNum = cell.date.getDate();

          let statusDotColor = '';
          if (status === ATTENDANCE_STATUS.PRESENT) {
            statusDotColor = 'bg-emerald-500';
          } else if (status === ATTENDANCE_STATUS.ABSENT) {
            statusDotColor = 'bg-rose-500';
          } else if (status === ATTENDANCE_STATUS.OD) {
            statusDotColor = 'bg-amber-500';
          }

          return (
            <button
              key={cell.key}
              onClick={() => {
                onDateSelect?.(cell.date);
              }}
              className={`w-full rounded-xl border flex flex-col items-center justify-between py-1.5 px-2 transition-all duration-200 relative ${
                fullSize ? 'h-20 sm:h-24' : 'h-12'
              } ${
                !cell.isCurrentMonth 
                  ? 'bg-slate-50/50 dark:bg-slate-900/10 text-slate-300 dark:text-slate-700 border-transparent pointer-events-none' 
                  : isSelected
                    ? 'bg-indigo-600 border-indigo-650 text-white font-bold scale-105 shadow-md shadow-indigo-500/20 z-10'
                    : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-300 border-slate-200/50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className={`text-xs font-display ${fullSize ? 'font-extrabold text-sm self-start mb-1' : ''}`}>
                {dayNum}
              </span>
              
              {/* Status Indicator for Full Size Calendar */}
              {fullSize && status && (
                <div className="w-full mt-auto">
                  {status === ATTENDANCE_STATUS.PRESENT && (
                    <span className="block text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-0.5 rounded text-center border border-emerald-500/20">
                      Present
                    </span>
                  )}
                  {status === ATTENDANCE_STATUS.ABSENT && (
                    <span className="block text-[9px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 py-0.5 rounded text-center border border-rose-500/20">
                      Absent
                    </span>
                  )}
                  {status === ATTENDANCE_STATUS.OD && (
                    <span className="block text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 py-0.5 rounded text-center border border-amber-500/20">
                      OD
                    </span>
                  )}
                </div>
              )}

              {/* Status Indicator Dot for Navigator Calendar */}
              {!fullSize && statusDotColor && (
                <span className={`w-2 h-2 rounded-full mb-1 animate-pulse ${statusDotColor}`} />
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default MonthNavigator;
