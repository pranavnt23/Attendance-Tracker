import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StaticTimetable from '../../components/timetable/StaticTimetable';
import ActualTimetable from '../../components/timetable/ActualTimetable';
import ActualWeeklyTimetable from '../../components/timetable/ActualWeeklyTimetable';
import WeekNavigator from '../../components/timetable/WeekNavigator';
import MonthNavigator from '../../components/timetable/MonthNavigator';
import AttendanceFilters from '../../components/attendance/AttendanceFilters';
import Loader from '../../components/common/Loader';
import { useAttendance } from '../../hooks/useAttendance';
import { Calendar, Layers } from 'lucide-react';
import { formatDateString, getWeekRangeString } from '../../utils/dateUtils';

const Timetable = () => {
  const [activeTab, setActiveTab] = useState('actual'); // 'static' | 'actual'
  const [actualViewMode, setActualViewMode] = useState('daily'); // 'daily' | 'weekly' | 'monthly'
  const [pivotDate, setPivotDate] = useState(new Date());
  const [isMonthView, setIsMonthView] = useState(false);
  const [filters, setFilters] = useState({
    date: '',
    subject: '',
    slot: '',
    status: ''
  });

  const { useStaticTimetable, useActualTimetable, useHistory } = useAttendance();

  // Queries
  const staticQuery = useStaticTimetable(activeTab === 'static');
  
  // Pivot date query for actual list
  const selectedDateStr = formatDateString(pivotDate);
  const actualQuery = useActualTimetable(selectedDateStr, activeTab === 'actual');

  // Attendance history query (for calendar dot indicators)
  const historyQuery = useHistory(activeTab === 'actual');

  const handleDateChange = (date) => {
    setPivotDate(date);
    // If they filtered a single date, sync it
    setFilters(prev => ({ ...prev, date: formatDateString(date) }));
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (newFilters.date) {
      setPivotDate(new Date(newFilters.date));
    }
  };

  // Resolve which slot list to filter
  let renderedSlots = actualQuery.data || [];

  // Frontend filter implementation
  if (filters.subject) {
    renderedSlots = renderedSlots.filter(s => 
      s.subject_name.toLowerCase().includes(filters.subject.toLowerCase())
    );
  }
  if (filters.slot) {
    renderedSlots = renderedSlots.filter(s => s.slot_no === parseInt(filters.slot));
  }
  if (filters.status) {
    renderedSlots = renderedSlots.filter(s => s.attendance_status === filters.status);
  }

  return (
    <div className="space-y-6">
      
      {/* Header and top tab selectors */}
      <PageHeader 
        title="Class Timetable"
        description="View your weekly scheduled hours and trace actual daily substitution overrides."
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
            <button
              onClick={() => setActiveTab('actual')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'actual'
                  ? 'bg-white dark:bg-slate-900 text-brand-primary dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Actual Schedule
            </button>
            <button
              onClick={() => setActiveTab('static')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'static'
                  ? 'bg-white dark:bg-slate-900 text-brand-primary dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              Static Grid
            </button>
          </div>
        }
      />

      {/* Main Grid Panels */}
      {activeTab === 'static' ? (
        staticQuery.isLoading ? (
          <Loader message="Loading weekly timetable grid..." size="large" />
        ) : (
          <StaticTimetable timetableData={staticQuery.data} />
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Controls Strip (Left Sidebar on Large Screens) - Hidden in Monthly View to give the calendar full space */}
          {actualViewMode !== 'monthly' && (
            <div className="space-y-6 lg:col-span-1">
              <div className="flex items-center justify-between border-b border-slate-200/30 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Navigation Mode</span>
                <button 
                  onClick={() => setIsMonthView(!isMonthView)}
                  className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {isMonthView ? 'Switch to Week View' : 'Switch to Month View'}
                </button>
              </div>
              
              {isMonthView ? (
                <MonthNavigator 
                  pivotDate={pivotDate}
                  onDateChange={setPivotDate}
                  onDateSelect={handleDateChange}
                  historyRecords={historyQuery.data || []}
                />
              ) : (
                <WeekNavigator 
                  pivotDate={pivotDate}
                  onDateChange={handleDateChange}
                />
              )}
            </div>
          )}

          {/* Actual Log (Right panel on Large screens) - Spans full width when Monthly View is selected */}
          <div className={`${actualViewMode === 'monthly' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
            
            {/* View Switcher & Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/40 dark:border-slate-800/40 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-display font-extrabold text-slate-850 dark:text-white">
                  {actualViewMode === 'daily' && `Classes for ${pivotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}`}
                  {actualViewMode === 'weekly' && `Weekly Actual Schedule (${getWeekRangeString(pivotDate)})`}
                  {actualViewMode === 'monthly' && `Monthly Attendance Grid`}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {actualViewMode === 'daily' && `${renderedSlots.length} sessions found`}
                  {actualViewMode === 'weekly' && 'Calendar view of conducted hours'}
                  {actualViewMode === 'monthly' && 'Select a date on the calendar to trace details below'}
                </p>
              </div>

              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner w-fit">
                <button
                  onClick={() => setActualViewMode('daily')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    actualViewMode === 'daily'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setActualViewMode('weekly')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    actualViewMode === 'weekly'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setActualViewMode('monthly')}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    actualViewMode === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Filters - only applicable in Daily View */}
            {actualViewMode === 'daily' && (
              <AttendanceFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                showStatusFilter={true}
              />
            )}

            {/* Render selected view mode */}
            {actualViewMode === 'daily' && (
              actualQuery.isLoading ? (
                <Loader message="Loading scheduled classes..." size="large" />
              ) : (
                <ActualTimetable slots={renderedSlots} />
              )
            )}

            {actualViewMode === 'weekly' && (
              <ActualWeeklyTimetable pivotDate={pivotDate} />
            )}

            {actualViewMode === 'monthly' && (
              <div className="space-y-6">
                <MonthNavigator 
                  pivotDate={pivotDate}
                  onDateChange={setPivotDate}
                  onDateSelect={handleDateChange}
                  historyRecords={historyQuery.data || []}
                  fullSize={true}
                />
                
                {/* Details list for selected day shown directly below calendar */}
                <div className="space-y-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-display font-extrabold text-slate-800 dark:text-slate-200">
                      Schedule Details for {pivotDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h4>
                    <span className="text-xs text-slate-400 dark:text-slate-400 font-semibold">
                      {renderedSlots.length} sessions found
                    </span>
                  </div>
                  {actualQuery.isLoading ? (
                    <Loader message="Loading day details..." size="medium" />
                  ) : (
                    <ActualTimetable slots={renderedSlots} />
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default Timetable;
