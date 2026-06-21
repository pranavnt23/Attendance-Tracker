import React from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import studentService from '../../services/studentService';
import { User, Mail, Shield, BookOpen, GraduationCap, Calendar, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Fetch student profile metadata
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: studentService.getProfile,
  });

  if (isLoading) {
    return <Loader message="Loading profile settings..." size="large" />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Profile Settings"
        description="View your institute account details and academic credentials."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* User Card Left Panel */}
        <div className="glass-panel border rounded-3xl p-6 text-center space-y-4 flex flex-col justify-center items-center shadow-sm bg-white dark:bg-slate-900">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white font-extrabold flex items-center justify-center font-display text-4xl shadow-md">
            {profile?.student_name ? profile.student_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
              {profile?.student_name}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider mt-1">
              {profile?.role === 'attendance_rep' ? 'Attendance Representative' : 'Student'}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-450 text-xs font-bold transition-colors flex items-center justify-center gap-2 border-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Info Right Panel */}
        <div className="md:col-span-2 glass-panel border rounded-3xl p-6 shadow-sm space-y-6 bg-white dark:bg-slate-900">
          <h4 className="text-md font-display font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            Academic Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {/* Register No */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Register Number</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.register_no}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">{profile?.email}</p>
              </div>
            </div>

            {/* Class name */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Class / Section</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.class_name}</p>
              </div>
            </div>

            {/* Current Semester */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Current Semester</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Semester {profile?.semester}</p>
              </div>
            </div>

            {/* Department */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Department</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.department_name}</p>
              </div>
            </div>

            {/* Course */}
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-850 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Course / Degree</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{profile?.course_name}</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
