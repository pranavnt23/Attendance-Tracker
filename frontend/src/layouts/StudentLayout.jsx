import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Calendar, 
  History, 
  User, 
  LogOut,
  LayoutGrid
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/common/ThemeToggle';

const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Subjectwise', path: '/attendance', icon: CalendarDays },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Calendar', path: '/calendar', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const mobileNavigationItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Today', path: '/timetable', icon: Calendar },
    { name: 'Hub', path: '/modules', icon: LayoutGrid },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. Sidebar - Desktop Only */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        {/* Brand/Logo Area */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-md shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.3 8.359 1.5 1.5 3-3m-6.7 8.39a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Attendance Portal
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-slate-900/50 dark:to-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center font-display text-sm shadow-sm">
              {user?.student_name ? user.student_name.split(' ').map(n=>n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{user?.student_name || 'Loading...'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate capitalize">{user?.role === 'attendance_rep' ? 'Rep / Student' : (user?.register_no || '')}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase px-4 mb-2.5 tracking-widest">Portal</div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 via-indigo-500/8 to-violet-500/10 text-indigo-600 dark:text-indigo-400 border-l-[3px] border-indigo-500 font-extrabold shadow-sm dark:shadow-indigo-500/5'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:text-slate-950 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {user?.role === 'attendance_rep' && (
            <button
              onClick={() => navigate('/rep/dashboard')}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer mb-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2.25 2.25L15 9m-3-4.5A2.25 2.25 0 1 0 12 4.5m0 0a2.25 2.25 0 1 0 0 4.5M12 4.5V3m0 1.5V3m6.364 2.636-.707.707M6.343 6.343l-.707.707M21 12h-1.5M4.5 12H3m15.364 6.364-.707-.707M6.343 17.657l-.707-.707" />
              </svg>
              Rep Portal
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* 2. Header and Main Section - Dynamic Container */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3.5 bg-white/75 dark:bg-slate-900/75 backdrop-blur-lg border-b border-slate-200/80 dark:border-slate-800/80">
          
          {/* Brand/Logo for mobile */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-secondary text-white shadow-sm shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.3 8.359 1.5 1.5 3-3m-6.7 8.39a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-sm bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                Attendance Portal
              </span>
              {user?.student_name && (
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
                  {user.student_name.split(' ')[0]}
                </p>
              )}
            </div>
          </div>

          <div className="hidden md:block text-xs text-slate-400 dark:text-slate-500 font-medium">
            Welcome back! Tracking classes for <span className="font-semibold text-slate-600 dark:text-slate-300">{user?.class_name || 'your class'}</span>
          </div>

          {/* Right Header Panel */}
          <div className="flex items-center gap-3">
            {user?.role === 'attendance_rep' && (
              <button 
                onClick={() => navigate('/rep/dashboard')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-all duration-200 active:scale-95 cursor-pointer"
              >
                Rep Portal →
              </button>
            )}
            
            <ThemeToggle />

            {/* Profile trigger */}
            <button
              onClick={() => navigate('/profile')}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-semibold flex items-center justify-center font-display text-sm hover:ring-2 hover:ring-indigo-500/50 dark:hover:ring-indigo-400/50 hover:scale-105 transition-all duration-200 cursor-pointer shadow-sm"
              title="View Profile"
            >
              {user?.student_name ? user.student_name[0].toUpperCase() : 'S'}
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* 3. Bottom Navigation - Mobile Only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 flex justify-around pt-2 px-2 shadow-lg shadow-black/5 pb-safe">
        {mobileNavigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1.5 px-5 rounded-2xl text-[10px] font-bold transition-all duration-200 active:scale-95 relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-indigo-500/12 dark:bg-indigo-500/15 scale-110' : 'scale-100'}`}>
                    <Icon className={`w-5 h-5 transition-all duration-200 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                  </div>
                  <span className={`mt-0.5 transition-all duration-200 ${isActive ? 'font-extrabold' : ''}`}>{item.name}</span>
                  {/* Active pill indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" style={{ animation: 'pillSlideIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default StudentLayout;
