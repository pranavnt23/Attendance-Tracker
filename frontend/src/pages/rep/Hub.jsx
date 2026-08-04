import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { 
  PlusCircle, 
  ListTodo, 
  Search, 
  BarChart3, 
  GraduationCap,
  Users,
  UserCheck
} from 'lucide-react';

const RepHub = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const adminModules = [
    {
      name: 'Mark Attendance',
      description: 'Record student attendance logs for today\'s slot sessions.',
      path: '/rep/mark',
      icon: PlusCircle,
      color: 'indigo'
    },
    {
      name: 'Logged Sessions',
      description: 'Review, audit, or update already recorded session registers.',
      path: '/rep/sessions',
      icon: ListTodo,
      color: 'indigo'
    },
    {
      name: 'Manage OD List',
      description: 'Approve, reject, or update student Official Duty (OD) requests.',
      path: '/rep/od-list',
      icon: UserCheck,
      color: 'indigo'
    },
    {
      name: 'Student Lookup',
      description: 'Search student details and inspect individual logs.',
      path: '/rep/lookup',
      icon: Search,
      color: 'indigo'
    },
    {
      name: 'Reports & Shortage',
      description: 'Generate reports and identify students with shortage.',
      path: '/rep/reports',
      icon: BarChart3,
      color: 'indigo'
    },
    {
      name: 'Manage Class',
      description: 'Add students (single/bulk), manage faculty lists, and promote class representatives.',
      path: '/rep/manage',
      icon: Users,
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-8">
      <PageHeader
        title="Rep Controls Hub"
        description="Access class records, mark sessions, and download shortage sheets."
      />

      {/* Switch to Student Portal banner */}
      <button
        onClick={() => navigate('/dashboard')}
        className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-semibold transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold">Switch to Student Portal</p>
            <p className="text-xs opacity-80 font-normal mt-0.5">View your personal attendance percentages & history</p>
          </div>
        </div>
        <span className="text-sm group-hover:translate-x-1 transition-transform">Go to Student Portal →</span>
      </button>

      {/* Admin Modules Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Class Administration
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {adminModules.map((mod) => {
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
    </div>
  );
};

export default RepHub;
