import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';
import studentService from '../../services/studentService';
import { Users, ListCollapse, Search, BarChart3, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Fetch class students list
  const studentsQuery = useQuery({
    queryKey: ['students', 'class', user?.class_id],
    queryFn: () => studentService.getClassStudents(user.class_id),
    enabled: !!user?.class_id,
  });

  // Fetch session list count
  const sessionsQuery = useQuery({
    queryKey: ['sessions', 'list'],
    queryFn: () => attendanceService.getSessionsList(),
  });

  const isLoading = studentsQuery.isLoading || sessionsQuery.isLoading;

  if (isLoading) {
    return <Loader message="Loading representative overview..." size="large" />;
  }

  const students = studentsQuery.data || [];
  const sessions = sessionsQuery.data || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <PageHeader
        title="Representative Dashboard"
        description="Review class strength, recorded sessions, and access administrative logs."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <StatCard
          title="Total Class Strength"
          value={`${students.length} Students`}
          color="indigo"
          icon={Users}
          subtext="Enrolled class size"
        />

        <StatCard
          title="Sessions Logged"
          value={`${sessions.length} Classes`}
          color="amber"
          icon={ListCollapse}
          subtext="Total conducted sessions"
        />
      </div>

      {/* Shortcuts */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white">
          Administrative Shortcuts
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

          {/* Manage OD List */}
          <Link
            to="/rep/od-list"
            className="p-5 rounded-3xl border border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col gap-4 no-underline group"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0 w-fit group-hover:scale-105 transition-transform border border-amber-500/10">
              <UserCheck className="w-5 h-5" />
            </div>

            <div>
              <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white group-hover:text-indigo-600 transition-colors">
                Manage OD List
              </h4>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Maintain On Duty (OD) roster for automatic attendance marking.
              </p>
            </div>
          </Link>

          {/* Student Lookup */}
          <Link
            to="/rep/lookup"
            className="p-5 rounded-3xl border border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col gap-4 no-underline group"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 w-fit group-hover:scale-105 transition-transform border border-indigo-500/10">
              <Search className="w-5 h-5" />
            </div>

            <div>
              <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white group-hover:text-indigo-600 transition-colors">
                Student Lookup
              </h4>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Search student rosters and check detailed attendance records.
              </p>
            </div>
          </Link>

          {/* Reports & Analytics */}
          <Link
            to="/rep/reports"
            className="p-5 rounded-3xl border border-slate-200 hover:border-indigo-400 dark:border-slate-800 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900 hover:shadow-md hover:scale-[1.01] transition-all flex flex-col gap-4 no-underline group"
          >
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 w-fit group-hover:scale-105 transition-transform border border-indigo-500/10">
              <BarChart3 className="w-5 h-5" />
            </div>

            <div>
              <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white group-hover:text-indigo-600 transition-colors">
                Reports & Analytics
              </h4>

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Review shortage reports and class-wide attendance analytics.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
};


export default Dashboard;