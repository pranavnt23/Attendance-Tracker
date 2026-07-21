import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Search, 
  BarChart3, 
  UserCheck,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';

const AttendanceRepLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Rep Dashboard', path: '/rep/dashboard', icon: LayoutDashboard },
    { name: 'Mark Attendance', path: '/rep/mark', icon: PlusCircle },
    { name: 'Sessions', path: '/rep/sessions', icon: ListTodo },
    { name: 'Manage OD List', path: '/rep/od-list', icon: UserCheck },
    { name: 'Student Lookup', path: '/rep/lookup', icon: Search },
    { name: 'Reports', path: '/rep/reports', icon: BarChart3 },
  ];


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. Sidebar - Desktop Only */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-slate-900 text-slate-200 border-r border-slate-800 shrink-0">
        
        {/* Brand Area */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-md shadow-indigo-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.3 8.359 1.5 1.5 3-3m-6.7 8.39a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg text-white">
            Rep Portal
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-semibold flex items-center justify-center font-display">
              {user?.student_name ? user.student_name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'RP'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.student_name || 'Loading...'}</p>
              <p className="text-xs text-indigo-400 font-semibold truncate">Attendance Rep</p>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-2 tracking-wider">Representative Controls</div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500 font-semibold shadow-inner'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            );
          })}

          <div className="h-px bg-slate-800 my-4"></div>
          <div className="text-[10px] font-bold text-slate-500 uppercase px-4 mb-2 tracking-wider">Navigation</div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200"
          >
            <GraduationCap className="w-5 h-5" />
            Student Dashboard
          </button>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:font-semibold transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Header and Main Section */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
          
          {/* Brand/Logo for mobile */}
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-md shadow-indigo-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.3 8.359 1.5 1.5 3-3m-6.7 8.39a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <span className="font-display font-bold text-md bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
              Rep Portal
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold">
            <span className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider text-[10px]">
              Administrative View
            </span>
            <span className="text-slate-400 dark:text-slate-500">
              Managing class: <span className="font-bold text-slate-700 dark:text-slate-300">{user?.class_name || 'your class'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
            >
              ← Student Dashboard
            </button>
            <ThemeToggle />

            {/* Profile trigger */}
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-850 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center font-display text-sm hover:ring-2 hover:ring-indigo-500/50 dark:hover:ring-indigo-400/50 transition-all duration-200"
              title="View Profile"
            >
              {user?.student_name ? user.student_name[0].toUpperCase() : 'S'}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* 3. Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex justify-around py-2 px-1 shadow-lg">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-indigo-500 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{item.name.replace('Rep ', '')}</span>
            </NavLink>
          );
        })}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium text-emerald-500 transition-all duration-150"
        >
          <GraduationCap className="w-5 h-5 mb-0.5" />
          <span>Student</span>
        </button>
      </nav>
    </div>
  );
};

export default AttendanceRepLayout;
