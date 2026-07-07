import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import MonthNavigator from '../../components/timetable/MonthNavigator';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import { useAttendance } from '../../hooks/useAttendance';
import { formatDateString, formatReadableDate } from '../../utils/dateUtils';
import { CalendarDays, Clock, ShieldAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import studentService from '../../services/studentService';

const AttendanceHistory = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { useHistory } = useAttendance();
  const historyQuery = useHistory();

  // Fetch actual timetable slots for the selected date to display individual details
  const selectedDateStr = formatDateString(selectedDate);
  
  const isLoading = historyQuery.isLoading || historyQuery.isFetching;

  const history = historyQuery.data || [];
  const selectedSlots = history
    .filter(h => h.date === selectedDateStr)
    .sort((a, b) => a.slot_no - b.slot_no);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Attendance Calendar"
        description="Browse your monthly calendar logs to review Present, Absent, and On Duty (OD) sessions."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Calendar View */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-md font-display font-extrabold text-slate-700 dark:text-slate-350">
            Attendance Log Calendar
          </h3>
          {historyQuery.isLoading ? (
            <Loader message="Loading calendar records..." size="medium" />
          ) : (
            <MonthNavigator 
              pivotDate={selectedDate}
              onDateChange={setSelectedDate}
              onDateSelect={setSelectedDate}
              historyRecords={history}
            />
          )}
        </div>

        {/* Right Side: Day Breakdown Details */}
        <div className="space-y-4 lg:col-span-1">
          <h3 className="text-md font-display font-extrabold text-slate-700 dark:text-slate-350">
            Session Details
          </h3>

          <div className="glass-panel border rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                Selected Date
              </p>
              <h4 className="text-md font-display font-extrabold text-slate-900 dark:text-white mt-1">
                {formatReadableDate(selectedDate)}
              </h4>
            </div>

            {isLoading ? (
              <Loader message="Loading logs..." size="small" />
            ) : selectedSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
                <CalendarDays className="w-8 h-8 text-slate-350 dark:text-slate-600 mb-2" />
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  No attendance records logged for this date.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Logged Sessions ({selectedSlots.length})
                </p>
                
                <div className="space-y-3.5">
                  {selectedSlots.map((slot, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md mb-1.5">
                          Slot {slot.slot_no}
                        </span>
                        <h5 className="text-sm font-display font-bold text-slate-900 dark:text-white truncate">
                          {slot.subject_name}
                        </h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Conducted Class
                        </p>
                      </div>
                      
                      <div className="shrink-0 pt-0.5">
                        <StatusBadge status={slot.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Note banner */}
            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> On Duty (OD) is verified by staff but counts as absent for total percentage computations.
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default AttendanceHistory;
