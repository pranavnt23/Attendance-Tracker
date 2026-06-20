import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import AttendanceCard from '../../components/cards/AttendanceCard';
import AttendanceSummary from '../../components/attendance/AttendanceSummary';
import Loader from '../../components/common/Loader';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { formatDateString, getDayName, formatReadableDate } from '../../utils/dateUtils';
import { Calendar, CheckCircle, XCircle, Clock, BookOpen } from 'lucide-react';
import ActualTimetable from '../../components/timetable/ActualTimetable';

const Dashboard = () => {
  const { user, isAuthenticating } = useAuth();
  const { useOverallStats, useSubjectWiseStats, useActualTimetable } = useAttendance();

  const todayStr = formatDateString(new Date());

  const overallQuery = useOverallStats();
  const subjectQuery = useSubjectWiseStats();
  const todayClassesQuery = useActualTimetable(todayStr);

  const isLoading = isAuthenticating || overallQuery.isLoading || subjectQuery.isLoading || todayClassesQuery.isLoading;

  if (isLoading) {
    return <Loader message="Compiling your attendance records..." size="large" />;
  }

  const overall = overallQuery.data || {
    conducted_hours: 0,
    present_hours: 0,
    absent_hours: 0,
    od_hours: 0,
    attendance_percentage: 100.0,
  };

  const subjects = subjectQuery.data || [];
  const todayClasses = todayClassesQuery.data || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title={user?.student_name ? `Hello, ${user.student_name}` : 'Hello'}
        description={`Here is your attendance log for the current semester (${formatReadableDate(new Date())}).`}
      />

      {/* Main stats block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall dial card */}
        <div className="lg:col-span-2">
          <AttendanceCard 
            percentage={overall.attendance_percentage}
            conducted={overall.conducted_hours}
            present={overall.present_hours}
            absent={overall.absent_hours}
            od={overall.od_hours}
          />
        </div>

        {/* Mini stats cards grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            title="Present Hours"
            value={`${overall.present_hours} hrs`}
            color="emerald"
            icon={CheckCircle}
            subtext="Attended lectures"
          />
          <StatCard 
            title="Absent Hours"
            value={`${overall.absent_hours} hrs`}
            color="rose"
            icon={XCircle}
            subtext="Missed lectures"
          />
          <StatCard 
            title="Official Duty"
            value={`${overall.od_hours} hrs`}
            color="amber"
            icon={Calendar}
            subtext="Authorized duty count"
          />
          <StatCard 
            title="Overall Percentage"
            value={`${overall.attendance_percentage}%`}
            color={overall.attendance_percentage >= 75 ? 'emerald' : 'rose'}
            icon={BookOpen}
            subtext={overall.attendance_percentage >= 75 ? 'Shortage cleared' : 'Below 75% limit'}
          />
        </div>

      </div>

      {/* Today's Schedule & Subject wise lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Today's classes schedule list */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            Today's Classes
          </h3>
          <div className="max-h-[420px] overflow-y-auto pr-1">
            <ActualTimetable slots={todayClasses} />
          </div>
        </div>

        {/* Subject wise Summary table */}
        <div className="lg:col-span-2">
          <AttendanceSummary subjectWiseRecords={subjects} />
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
