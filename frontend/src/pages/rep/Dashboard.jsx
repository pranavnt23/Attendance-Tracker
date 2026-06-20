import React from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/cards/StatCard';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import reportService from '../../services/reportService';
import attendanceService from '../../services/attendanceService';
import studentService from '../../services/studentService';
import { Users, AlertTriangle, ListCollapse, PlusSquare, Search, BarChart3 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch shortage report to see low attendance count
  const shortageQuery = useQuery({
    queryKey: ['reports', 'shortage', user?.class_id],
    queryFn: () => reportService.getShortageReport(user.class_id, 75.0),
    enabled: !!user?.class_id,
  });

  // 2. Fetch class students list
  const studentsQuery = useQuery({
    queryKey: ['students', 'class', user?.class_id],
    queryFn: () => studentService.getClassStudents(user.class_id),
    enabled: !!user?.class_id,
  });

  // 3. Fetch session list count
  const sessionsQuery = useQuery({
    queryKey: ['sessions', 'list'],
    queryFn: () => attendanceService.getSessionsList(),
  });

  const isLoading = shortageQuery.isLoading || studentsQuery.isLoading || sessionsQuery.isLoading;

  if (isLoading) {
    return <Loader message="Loading representative overview..." size="large" />;
  }

  const shortageList = shortageQuery.data?.students_shortage || [];
  const students = studentsQuery.data || [];
  const sessions = sessionsQuery.data || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader 
        title="Representative Dashboard"
        description="Review class-wide aggregates, shortages, and administrative controls."
        actions={
          <button
            onClick={() => navigate('/rep/mark')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md hover:bg-indigo-700 hover:shadow-indigo-500/25 transition-all"
          >
            <PlusSquare className="w-4 h-4" />
            Mark Today's Attendance
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Total Class Strength"
          value={`${students.length} Students`}
          color="indigo"
          icon={Users}
          subtext="Enrolled student strength"
        />
        <StatCard 
          title="Attendance Shortage (Below 75%)"
          value={`${shortageList.length} Students`}
          color={shortageList.length > 0 ? 'rose' : 'emerald'}
          icon={AlertTriangle}
          subtext="Require attention"
        />
        <StatCard 
          title="Sessions Logged"
          value={`${sessions.length} Classes`}
          color="amber"
          icon={ListCollapse}
          subtext="Total conducted sessions"
        />
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shortage warning roster */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Low Attendance Watchlist
            </h3>
            <Link to="/rep/reports" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
              View Detailed Report →
            </Link>
          </div>

          <div className="glass-panel border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900/20 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Roll No</th>
                    <th className="py-3.5 px-6">Student Name</th>
                    <th className="py-3.5 px-6 text-center">Conducted</th>
                    <th className="py-3.5 px-6 text-right">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {shortageList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 px-6 text-center text-slate-400 font-medium bg-emerald-500/[0.01]">
                        ✨ Awesome! All students have cleared the 75% attendance threshold.
                      </td>
                    </tr>
                  ) : (
                    shortageList.slice(0, 5).map((student) => (
                      <tr 
                        key={student.student_id}
                        className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="py-4 px-6 font-display font-semibold text-slate-500 dark:text-slate-400">
                          {student.register_no}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {student.student_name}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-500">
                          {student.conducted_hours} hrs
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                            student.attendance_percentage < 50
                              ? 'text-rose-600 dark:text-rose-400 border-rose-200/50 bg-rose-500/5'
                              : 'text-amber-600 dark:text-amber-400 border-amber-200/50 bg-amber-500/5'
                          }`}>
                            {student.attendance_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rep Operations Quick Navigator */}
        <div className="space-y-4">
          <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white">
            Administrative Shortcuts
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            
            {/* Mark Attendance Shortcut */}
            <Link 
              to="/rep/mark"
              className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 dark:border-slate-850 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900 hover:shadow-md hover:scale-[1.01] transition-all flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <PlusSquare className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white">Mark Attendance</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Conduct and submit logs for new timetabled sessions.</p>
              </div>
            </Link>

            {/* Student Search Shortcut */}
            <Link 
              to="/rep/lookup"
              className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 dark:border-slate-850 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900 hover:shadow-md hover:scale-[1.01] transition-all flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white">Student Lookup</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Search student rosters and check detailed logs.</p>
              </div>
            </Link>

            {/* Reports Shortcut */}
            <Link 
              to="/rep/reports"
              className="p-5 rounded-2xl border border-slate-200 hover:border-indigo-400 dark:border-slate-850 dark:hover:border-indigo-500/60 bg-white dark:bg-slate-900 hover:shadow-md hover:scale-[1.01] transition-all flex items-start gap-4"
            >
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-slate-950 dark:text-white">Reports & Charts</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Review shortage aggregates and class-wide reports.</p>
              </div>
            </Link>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
