import React from 'react';
import { Search, Calendar, Hash, BookOpen } from 'lucide-react';

const AttendanceFilters = ({
  filters = {},
  onFilterChange,
  subjects = [],
  slots = [],
  showStatusFilter = false,
}) => {
  const handleSelectChange = (key, val) => {
    onFilterChange?.({
      ...filters,
      [key]: val === 'all' ? '' : val
    });
  };

  const handleTextChange = (key, val) => {
    onFilterChange?.({
      ...filters,
      [key]: val
    });
  };

  return (
    <div className="glass-panel border rounded-3xl p-5 shadow-sm mb-6 flex flex-col md:flex-row md:items-center gap-4 animate-fade-in">
      <div className="text-sm font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5 shrink-0 uppercase tracking-wider">
        <Search className="w-4 h-4" />
        Filter List
      </div>

      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Date Filter */}
        <div className="relative">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={filters.date || ''}
            onChange={(e) => handleTextChange('date', e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Subject Filter */}
        <div className="relative">
          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          {subjects.length > 0 ? (
            <select
              value={filters.subject || 'all'}
              onChange={(e) => handleSelectChange('subject', e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl appearance-none focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-slate-800 dark:text-slate-200"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Subjects</option>
              {subjects.map(s => (
                <option key={s.subject_id} value={s.subject_name} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {s.subject_name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Search Subject..."
              value={filters.subject || ''}
              onChange={(e) => handleTextChange('subject', e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          )}
        </div>

        {/* Slot Filter */}
        <div className="relative">
          <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={filters.slot || 'all'}
            onChange={(e) => handleSelectChange('slot', e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl appearance-none focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-slate-800 dark:text-slate-200"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Slots</option>
            {slots.length > 0 ? (
              slots.map(sl => (
                <option key={sl.slot_id} value={sl.slot_no} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  Slot {sl.slot_no}
                </option>
              ))
            ) : (
              [1, 2, 3, 4, 5].map(s => (
                <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  Slot {s}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Faculty/Status Filter */}
        {showStatusFilter ? (
          <div className="relative">
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleSelectChange('status', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl appearance-none focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-slate-800 dark:text-slate-200"
            >
              <option value="all" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">All Statuses</option>
              <option value="P" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Present</option>
              <option value="A" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Absent</option>
              <option value="OD" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">On Duty</option>
            </select>
          </div>
        ) : (
          <div className="relative">
            <input
              type="text"
              placeholder="Search Faculty..."
              value={filters.faculty || ''}
              onChange={(e) => handleTextChange('faculty', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary dark:focus:border-brand-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        )}
      </div>

      {/* Reset Filters trigger */}
      <button
        onClick={() => onFilterChange?.({})}
        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors shrink-0"
      >
        Clear Filters
      </button>
    </div>
  );
};

export default AttendanceFilters;
