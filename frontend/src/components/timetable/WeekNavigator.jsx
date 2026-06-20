import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWeekDays, getWeekRangeString, formatDateString } from '../../utils/dateUtils';

const WeekNavigator = ({ pivotDate, onDateChange }) => {
  const weekDays = getWeekDays(pivotDate);
  const selectedDateStr = formatDateString(pivotDate);

  const handlePrevWeek = () => {
    const prev = new Date(pivotDate);
    prev.setDate(pivotDate.getDate() - 7);
    onDateChange(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(pivotDate);
    next.setDate(pivotDate.getDate() + 7);
    onDateChange(next);
  };

  const handleDaySelect = (date) => {
    onDateChange(date);
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      
      {/* Navigator controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevWeek}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          aria-label="Previous Week"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <span className="font-display font-bold text-sm text-slate-700 dark:text-slate-300">
          {getWeekRangeString(pivotDate)}
        </span>

        <button
          onClick={handleNextWeek}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          aria-label="Next Week"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Week day strip */}
      <div className="grid grid-cols-6 gap-2">
        {weekDays.map((day) => {
          const dateStr = formatDateString(day);
          const isSelected = dateStr === selectedDateStr;
          const dayNameShort = day.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = day.getDate();

          return (
            <button
              key={dateStr}
              onClick={() => handleDaySelect(day)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl border transition-all duration-200 ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 font-bold scale-[1.03]'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 mb-0.5">{dayNameShort}</span>
              <span className="text-md font-display font-extrabold">{dayNum}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default WeekNavigator;
