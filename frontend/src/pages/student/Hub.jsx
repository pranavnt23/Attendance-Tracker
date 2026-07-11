import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { 
  CalendarDays, 
  Calendar, 
  History, 
  User, 
  CheckCircle, 
  XCircle, 
  Award,
  GraduationCap
} from 'lucide-react';

const Hub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { useSubjectWiseStats } = useAttendance();
  const subjectQuery = useSubjectWiseStats();

  const subjects = subjectQuery.data || [];
  const totalPresent = subjects.reduce((sum, s) => sum + (s.present_hours || 0), 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + (s.absent_hours || 0), 0);
  const totalOD = subjects.reduce((sum, s) => sum + (s.od_hours || 0), 0);

  const coreModules = [
    {
      name: 'Subjectwise Stats',
      description: 'Course-by-course breakdown and progress metrics.',
      path: '/attendance',
      icon: CalendarDays,
      color: 'indigo'
    },
    {
      name: 'Weekly Timetable',
      description: 'Your scheduled lectures and classroom slots.',
      path: '/timetable',
      icon: Calendar,
      color: 'brand'
    },
    {
      name: 'Attendance Calendar',
      description: 'Audit and track daily history log records.',
      path: '/calendar',
      icon: History,
      color: 'indigo'
    },
    {
      name: 'My Profile',
      description: 'View register numbers, details, and settings.',
      path: '/profile',
      icon: User,
      color: 'slate'
    }
  ];

  const logModules = [
    {
      name: 'Present Hours Log',
      value: `${totalPresent} hrs`,
      description: 'Audit all attended sessions.',
      path: '/drill-down/P',
      icon: CheckCircle,
      color: 'emerald'
    },
    {
      name: 'Absent Hours Log',
      value: `${totalAbsent} hrs`,
      description: 'View missed lectures list.',
      path: '/drill-down/A',
      icon: XCircle,
      color: 'rose'
    },
    {
      name: 'On Duty (OD) Log',
      value: `${totalOD} hrs`,
      description: 'Check verified OD permissions.',
      path: '/drill-down/OD',
      icon: Award,
      color: 'amber'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-8">
      <PageHeader
        title="App Directory"
        description="Access all modules and details available on your student portal."
      />

      {/* Switch to Rep Panel banner if user is a Rep */}
      {user?.role === 'attendance_rep' && (
        <button
          onClick={() => navigate('/rep/dashboard')}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/15 border border-indigo-500/20 text-indigo-700 dark:text-indigo-400 font-semibold transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold">Access Representative Controls</p>
              <p className="text-xs opacity-80 font-normal mt-0.5">Switch to class management dashboard & reports</p>
            </div>
          </div>
          <span className="text-sm group-hover:translate-x-1 transition-transform">Go to Rep Panel →</span>
        </button>
      )}

      {/* Core Modules Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Main Features
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coreModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.path}
                onClick={() => navigate(mod.path)}
                className="p-5 text-left rounded-3xl border border-slate-200 hover:border-indigo-500/40 dark:border-slate-800 dark:hover:border-indigo-400/40 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex gap-4 w-full cursor-pointer group"
              >
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition-transform border border-indigo-500/10">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {mod.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {mod.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Logs list */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Hour-wise Audits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {logModules.map((mod) => {
            const Icon = mod.icon;
            let themeClass = "text-indigo-600 bg-indigo-500/10 border-indigo-500/10 hover:border-indigo-500/40";
            if (mod.color === 'emerald') themeClass = "text-emerald-600 bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/40";
            if (mod.color === 'rose') themeClass = "text-rose-600 bg-rose-500/10 border-rose-500/10 hover:border-rose-500/40";
            if (mod.color === 'amber') themeClass = "text-amber-600 bg-amber-500/10 border-amber-500/10 hover:border-amber-500/40";

            return (
              <button
                key={mod.path}
                onClick={() => navigate(mod.path)}
                className="p-5 text-left rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all flex items-center justify-between w-full cursor-pointer group"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-wider block">
                    {mod.name.replace(' Log', '')}
                  </span>
                  <p className="text-xl font-display font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {mod.value}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {mod.description}
                  </p>
                </div>
                <div className={`p-3 rounded-2xl shrink-0 group-hover:scale-105 transition-transform border ${themeClass}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Hub;
