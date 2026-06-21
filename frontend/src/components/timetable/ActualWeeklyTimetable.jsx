import React from 'react';
import { useQueries } from '@tanstack/react-query';
import { Clock, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import timetableService from '../../services/timetableService';
import { getWeekDays, formatDateString, formatShortDate } from '../../utils/dateUtils';
import Loader from '../common/Loader';

const slotsDefinition = [
  { no: 1, start: "09:00", end: "09:55" },
  { no: 2, start: "09:55", end: "10:50" },
  { no: 3, start: "11:05", end: "12:00" },
  { no: 4, start: "12:00", end: "12:55" },
  { no: 5, start: "02:00", end: "02:55" },
  { no: 6, start: "02:55", end: "03:50" },
  { no: 7, start: "03:50", end: "04:45" }
];

const ActualWeeklyTimetable = ({ pivotDate, showSaturday = false }) => {
  const weekDays = getWeekDays(pivotDate);

  // Fetch actual timetable data for each day of the week in parallel
  const dayQueries = useQueries({
    queries: weekDays.map((day) => {
      const dateStr = formatDateString(day);
      return {
        queryKey: ['timetable', 'actual', dateStr],
        queryFn: () => timetableService.getActualTimetable(dateStr),
        staleTime: 5 * 60 * 1000, // cache for 5 minutes
      };
    })
  });

  const isLoading = dayQueries.some(q => q.isLoading);

  if (isLoading) {
    return <Loader message="Loading weekly actual schedule..." size="large" />;
  }

  const renderedWeekDays = showSaturday ? weekDays : weekDays.slice(0, 5);

  const getStatusColorClasses = (status) => {
    switch (status) {
      case 'P':
        return 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300 hover:scale-[1.01]';
      case 'OD':
        return 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300 hover:scale-[1.01]';
      case 'A':
        return 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300 hover:scale-[1.01]';
      default:
        return 'bg-slate-100/50 dark:bg-slate-800/10 border-slate-200 dark:border-slate-800/60 text-slate-400 dark:text-slate-500 border-dashed';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'P':
        return (
          <span className="flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/20 mt-1.5 w-max mx-auto">
            <CheckCircle className="w-2.5 h-2.5" /> Present
          </span>
        );
      case 'OD':
        return (
          <span className="flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase bg-amber-500/10 dark:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/20 mt-1.5 w-max mx-auto">
            <AlertCircle className="w-2.5 h-2.5" /> OD
          </span>
        );
      case 'A':
        return (
          <span className="flex items-center justify-center gap-1 text-[9px] font-extrabold uppercase bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/20 mt-1.5 w-max mx-auto">
            <XCircle className="w-2.5 h-2.5" /> Absent
          </span>
        );
      default:
        return (
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-650 block text-center mt-1">
            Unmarked
          </span>
        );
    }
  };

  return (
    <div className="glass-panel border rounded-3xl p-6 shadow-sm overflow-hidden animate-fade-in">
      {/* Desktop Weekly Calendar Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="py-4 px-3 w-28 text-left">
                <div className="bg-slate-900 text-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-800 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-center">
                  Day
                </div>
              </th>
              {slotsDefinition.map(s => (
                <th key={s.no} className="py-4 px-2 min-w-[170px] text-center">
                  <div className="bg-slate-900 text-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 dark:border-slate-700 flex flex-col items-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">Slot {s.no}</span>
                    <span className="text-xs font-extrabold tracking-tight mt-0.5">{s.start} - {s.end}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {renderedWeekDays.map((day, dayIdx) => {
              const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
              const dateLabel = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              const daySlots = dayQueries[dayIdx].data || [];

              return (
                <tr 
                  key={day.toISOString()} 
                  className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors"
                >
                  <td className="py-5 px-4 font-display font-bold text-sm text-slate-950 dark:text-white w-28 shrink-0">
                    <div>{dayName}</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{dateLabel}</div>
                  </td>
                  
                  {slotsDefinition.map((slotDef) => {
                    const slot = daySlots.find(s => s.slot_no === slotDef.no);
                    
                    if (!slot) {
                      return (
                        <td key={slotDef.no} className="py-3 px-2">
                          <div className="p-3 rounded-2xl bg-slate-100/30 dark:bg-slate-850/10 border border-dashed border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-center h-24 text-slate-350 dark:text-slate-700 text-[10px] font-bold text-center">
                            No Class
                          </div>
                        </td>
                      );
                    }

                    const isMarked = slot.attendance_status !== 'NOT_MARKED';
                    const colors = getStatusColorClasses(slot.attendance_status);

                    return (
                      <td key={slotDef.no} className="py-3 px-2">
                        <div className={`p-4 rounded-2xl border flex flex-col justify-center h-28 text-center transition-all duration-300 shadow-sm ${colors}`}>
                          {isMarked ? (
                            <>
                              <span className="text-[9px] font-extrabold tracking-wider opacity-85 uppercase block truncate max-w-full">
                                {slot.subject_code || "CLASS"}
                              </span>
                              <span className="text-xs font-extrabold font-display leading-tight mt-0.5 line-clamp-2 block">
                                {slot.subject_name}
                              </span>
                              {slot.faculty && (
                                <span className="text-[9px] font-bold opacity-80 mt-1 truncate max-w-full block">
                                  {slot.faculty}
                                </span>
                              )}
                              {getStatusLabel(slot.attendance_status)}
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full">
                              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-650 block text-center">
                                Pending / Unmarked
                              </span>
                              <span className="text-[8px] font-bold text-slate-350 dark:text-slate-700 block mt-0.5">
                                No Class Details
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActualWeeklyTimetable;
