import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { formatDateString, formatReadableDate } from '../../utils/dateUtils';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import ActualTimetable from '../../components/timetable/ActualTimetable';

const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const Dashboard = () => {
  const { user, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const { useSubjectWiseStats, useActualTimetable, useLastUpdatedDate } = useAttendance();

  const todayStr = formatDateString(new Date());
  const subjectQuery = useSubjectWiseStats();
  const todayClassesQuery = useActualTimetable(todayStr);
  const lastUpdatedQuery = useLastUpdatedDate();

  const isLoading = isAuthenticating || subjectQuery.isLoading || todayClassesQuery.isLoading || lastUpdatedQuery.isLoading;

  if (isLoading) {
    return <Loader message="Compiling your attendance records..." size="large" />;
  }

  const subjects = subjectQuery.data || [];
  const todayClasses = todayClassesQuery.data || [];
  const lastUpdatedData = lastUpdatedQuery.data;

  // Calculate totals from subject-wise logs to display on the quick logs cards
  const totalPresent = subjects.reduce((sum, s) => sum + (s.present_hours || 0), 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + (s.absent_hours || 0), 0);
  const totalOD = subjects.reduce((sum, s) => sum + (s.od_hours || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Page Header */}
      <PageHeader 
        title={user?.student_name ? `Hello, ${user.student_name}` : 'Hello'}
        description={`Here is your attendance tracker overview for today (${formatReadableDate(new Date())}).`}
      />

      {/* Attendance Update Status Sentence */}
      <div className="text-sm text-slate-600 dark:text-slate-400 -mt-6 bg-indigo-500/5 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/80 px-4 py-3 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span>
            {lastUpdatedData?.last_updated_date ? (
              <>
                Attendance is updated until{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatReadableDate(parseDateString(lastUpdatedData.last_updated_date))}
                </strong>
                {lastUpdatedData.last_updated_slot !== null && (
                  <>
                    {"   "}(
                    <strong className="font-bold text-slate-900 dark:text-white">
                      Slot {lastUpdatedData.last_updated_slot}
                    </strong>
                    )
                  </>
                )}.
              </>
            ) : (
              <span className="italic text-slate-500">No attendance updates recorded yet.</span>
            )}
          </span>
        </div>
      </div>


      {/* Interactive Quick Logs Entry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Present Logs Card */}
        <button
          onClick={() => navigate('/drill-down/P')}
          className="glass-panel border rounded-3xl p-5 text-left flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-500/40 hover:scale-[1.01] transition-all bg-white dark:bg-slate-900 group cursor-pointer w-full"
        >
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
              Present Hours
            </span>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
              {totalPresent} hrs
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1.5">
              Attended lectures log
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/10 group-hover:scale-105 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
        </button>

        {/* Absent Logs Card */}
        <button
          onClick={() => navigate('/drill-down/A')}
          className="glass-panel border rounded-3xl p-5 text-left flex items-center justify-between shadow-sm hover:shadow-md hover:border-rose-500/40 hover:scale-[1.01] transition-all bg-white dark:bg-slate-900 group cursor-pointer w-full"
        >
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
              Absent Hours
            </span>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
              {totalAbsent} hrs
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1.5">
              Missed lectures log
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-450 flex items-center justify-center shrink-0 border border-rose-500/10 group-hover:scale-105 transition-transform">
            <XCircle className="w-6 h-6" />
          </div>
        </button>

        {/* OD Logs Card */}
        <button
          onClick={() => navigate('/drill-down/OD')}
          className="glass-panel border rounded-3xl p-5 text-left flex items-center justify-between shadow-sm hover:shadow-md hover:border-amber-500/40 hover:scale-[1.01] transition-all bg-white dark:bg-slate-900 group cursor-pointer w-full"
        >
          <div className="overflow-hidden">
            <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
              On Duty (OD)
            </span>
            <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
              {totalOD} hrs
            </p>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1.5">
              Authorized duty log
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/10 group-hover:scale-105 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
        </button>

      </div>

      {/* Today's scheduled classes */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-500" />
          Today's Classes
        </h3>
        <div className="w-full">
          <ActualTimetable slots={todayClasses} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
