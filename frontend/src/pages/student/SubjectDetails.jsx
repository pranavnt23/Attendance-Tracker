import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Calendar, GraduationCap } from 'lucide-react';

import studentService from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatShortDate } from '../../utils/dateUtils';

const SubjectDetails = () => {
  const { subjectId } = useParams();

  // 1. Fetch Subject Statistics Details
  const statsQuery = useQuery({
    queryKey: ['subject', 'details', subjectId],
    queryFn: () => studentService.getSubjectDetails(subjectId),
    enabled: !!subjectId,
  });

  // 2. Fetch History logs (to filter session logs for this specific subject)
  const historyQuery = useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: studentService.getAttendanceHistory,
  });

  const isLoading = statsQuery.isLoading || historyQuery.isLoading;

  if (isLoading) {
    return <Loader message="Loading subject details..." size="large" />;
  }

  if (statsQuery.isError || !statsQuery.data) {
    return (
      <div className="glass-panel border rounded-3xl p-8 text-center space-y-4">
        <p className="text-slate-500 font-semibold">Subject details could not be found.</p>
        <Link to="/attendance" className="text-sm font-bold text-indigo-600 hover:underline">
          Go back to Attendance list
        </Link>
      </div>
    );
  }

  const stats = statsQuery.data;
  const history = historyQuery.data || [];

  // Filter history logs for this subject
  const subjectHistory = history.filter(
    h => h.subject_name.toLowerCase() === stats.subject_name.toLowerCase()
  );

  return (
    <div className="space-y-8">
      {/* Header back button */}
      <div>
        <Link 
          to="/attendance" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Attendance
        </Link>
        <PageHeader 
          title={stats.subject_name}
          description={`Subject Code: ${stats.subject_code}`}
        />
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard 
          title="Attendance Percentage"
          value={`${stats.attendance_percentage}%`}
          color={stats.attendance_percentage >= 75 ? 'emerald' : 'rose'}
          icon={GraduationCap}
          subtext={stats.attendance_percentage >= 75 ? 'Meets threshold' : 'Attendance shortage'}
        />
        <StatCard 
          title="Conducted Hours"
          value={`${stats.conducted_hours} hrs`}
          color="indigo"
          icon={Calendar}
          subtext="Total classes held"
        />
        <StatCard 
          title="Present Hours"
          value={`${stats.present_hours} hrs`}
          color="emerald"
          icon={CheckCircle}
          subtext="Attended classes"
        />
        <StatCard 
          title="Absent Hours"
          value={`${stats.absent_hours} hrs`}
          color="rose"
          icon={XCircle}
          subtext="Unexcused absence"
        />
        <StatCard 
          title="Official Duty (OD)"
          value={`${stats.od_hours} hrs`}
          color="amber"
          icon={Calendar}
          subtext="Counts as absent for percentage"
        />
      </div>

      {/* Log history list */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white">
          Class Log History
        </h3>
        
        <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Day</th>
                  <th className="py-3.5 px-6 text-center">Slot Number</th>
                  <th className="py-3.5 px-6 text-right">Recorded Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 px-6 text-center text-slate-400 font-medium">
                      No logs recorded for this subject yet.
                    </td>
                  </tr>
                ) : (
                  subjectHistory.map((log, idx) => (
                    <tr 
                      key={idx}
                      className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors"
                    >
                      <td className="py-4 px-6 font-display font-semibold text-slate-900 dark:text-white">
                        {formatShortDate(log.date)}
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-550 dark:text-slate-400">
                        {log.day}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-600 dark:text-slate-300">
                        Slot {log.slot_no}
                      </td>
                      <td className="py-3 px-6 text-right">
                        <StatusBadge status={log.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;
