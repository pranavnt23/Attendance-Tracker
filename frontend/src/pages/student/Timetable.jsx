import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import StaticTimetable from '../../components/timetable/StaticTimetable';
import ActualWeeklyTimetable from '../../components/timetable/ActualWeeklyTimetable';
import WeekNavigator from '../../components/timetable/WeekNavigator';
import Loader from '../../components/common/Loader';
import { useAttendance } from '../../hooks/useAttendance';
import { Calendar, Layers } from 'lucide-react';
import { formatDateString, getWeekRangeString, getWeekDays } from '../../utils/dateUtils';

const Timetable = () => {
  const [activeTab, setActiveTab] = useState('actual'); // 'static' | 'actual'
  const [pivotDate, setPivotDate] = useState(new Date());

  const { useStaticTimetable, useActualTimetable } = useAttendance();

  // Queries
  const staticQuery = useStaticTimetable(activeTab === 'static');

  const weekDays = getWeekDays(pivotDate);
  const satDateStr = formatDateString(weekDays[5]);
  const satQuery = useActualTimetable(satDateStr, activeTab === 'actual');
  const showSaturday = satQuery.data?.some(slot => slot.subject_name && slot.subject_name.trim() !== "") || false;

  const isTabLoading = activeTab === 'static'
    ? (staticQuery.isLoading || staticQuery.isFetching)
    : (satQuery.isLoading || satQuery.isFetching);

  const handleDateChange = (date) => {
    setPivotDate(date);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header and top tab selectors */}
      <PageHeader 
        title="Class Timetable"
        description="View your weekly scheduled hours and trace actual conducted session logs."
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-205 shadow-inner">
            <button
              onClick={() => setActiveTab('actual')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all border-0 cursor-pointer ${
                activeTab === 'actual'
                  ? 'bg-white dark:bg-slate-900 text-brand-primary dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-750 bg-transparent'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Actual Schedule
            </button>
            <button
              onClick={() => setActiveTab('static')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all border-0 cursor-pointer ${
                activeTab === 'static'
                  ? 'bg-white dark:bg-slate-900 text-brand-primary dark:text-indigo-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-750 bg-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              Static Grid
            </button>
          </div>
        }
      />

      {/* Main Grid Panels */}
      {isTabLoading ? (
        <Loader message={`Loading weekly ${activeTab === 'static' ? 'static' : 'actual'} schedule...`} size="large" />
      ) : activeTab === 'static' ? (
        <StaticTimetable timetableData={staticQuery.data} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Controls Strip (Left Sidebar on Large Screens) */}
          <div className="space-y-4 lg:col-span-1">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Week Selection
            </span>
            <WeekNavigator 
              pivotDate={pivotDate}
              onDateChange={handleDateChange}
              showSaturday={showSaturday}
            />
          </div>

          {/* Actual Weekly Timetable Grid (Right Panel) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border-b border-slate-200/40 dark:border-slate-800/40 pb-3">
              <h3 className="text-md font-display font-extrabold text-slate-800 dark:text-white">
                Weekly Conducted Hours ({getWeekRangeString(pivotDate, showSaturday)})
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                Displays actual slots logged by your class representative
              </p>
            </div>

            <ActualWeeklyTimetable pivotDate={pivotDate} showSaturday={showSaturday} />
          </div>

        </div>
      )}

    </div>
  );
};

export default Timetable;
