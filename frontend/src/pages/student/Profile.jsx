import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import studentService from '../../services/studentService';
import authService from '../../services/authService';
import { User, Mail, Shield, BookOpen, GraduationCap, Calendar, Lock, LogOut, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isResetting, setIsResetting] = useState(false);

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

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsResetting(true);
    try {
      const resp = await authService.resetPassword(profile.register_no, newPassword);
      if (resp.success) {
        setPasswordSuccess('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess('');
        }, 2000);
      } else {
        setPasswordError(resp.message || 'Failed to update password.');
      }
    } catch (e) {
      setPasswordError(e.response?.data?.detail || 'Something went wrong.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Profile Settings"
        description="View your institute account details and change security configurations."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* User Card Left Panel */}
        <div className="glass-panel border rounded-3xl p-6 text-center space-y-4 flex flex-col justify-center items-center shadow-sm">
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

          <div className="w-full pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Info Right Panel */}
        <div className="md:col-span-2 glass-panel border rounded-3xl p-6 shadow-sm space-y-6">
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
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">Semester  {profile?.semester}</p>
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

      {/* Password Reset Modal Overlay */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="glass-panel border rounded-3xl w-full max-w-md p-6 shadow-2xl animate-fade-in text-slate-850 dark:text-slate-200">
            <h3 className="text-lg font-display font-extrabold text-slate-950 dark:text-white mb-2">
              Update Password
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 mb-6">
              Establish a new secure password for register number <span className="font-semibold">{profile?.register_no}</span>
            </p>

            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center mb-4">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center mb-4 flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-200"
                  required
                  placeholder="••••••••"
                  disabled={isResetting}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-200"
                  required
                  placeholder="••••••••"
                  disabled={isResetting}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                  disabled={isResetting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
                  disabled={isResetting}
                >
                  {isResetting && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
