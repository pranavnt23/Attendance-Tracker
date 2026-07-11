import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import StudentLayout from '../layouts/StudentLayout';
import AttendanceRepLayout from '../layouts/AttendanceRepLayout';

// Guard Routes
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import VerifyOtp from '../pages/auth/VerifyOtp';
import ResetPassword from '../pages/auth/ResetPassword';

// Student Pages
import StudentDashboard from '../pages/student/Dashboard';
import StudentAttendance from '../pages/student/Attendance';
import StudentSubjectDetails from '../pages/student/SubjectDetails';
import StudentTimetable from '../pages/student/Timetable';
import StudentAttendanceHistory from '../pages/student/AttendanceHistory';
import StudentProfile from '../pages/student/Profile';
import StudentDrillDown from '../pages/student/DrillDown';
import StudentHub from '../pages/student/Hub';

// Representative Pages
import RepDashboard from '../pages/rep/Dashboard';
import RepMarkAttendance from '../pages/rep/MarkAttendance';
import RepSessionList from '../pages/rep/SessionList';
import RepSessionDetails from '../pages/rep/SessionDetails';
import RepEditAttendance from '../pages/rep/EditAttendance';
import RepStudentLookup from '../pages/rep/StudentLookup';
import RepReports from '../pages/rep/Reports';
import RepHub from '../pages/rep/Hub';
import RepManageClass from '../pages/rep/ManageClass';

import { ROLES } from '../utils/constants';
import { useAuthStore } from '../store/authStore';

const AppRoutes = () => {
  const { isAuthenticated, me } = useAuthStore();

  return (
    <Routes>
      {/* Public/Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Routes (Requires Authentication) */}
      <Route element={<ProtectedRoute />}>
        
        {/* Core Student Routes */}
        <Route element={<StudentLayout />}>
          {/* Default landing redirects based on role or goes to Student Dashboard */}
          <Route 
            path="/" 
            element={<Navigate to={me?.role === ROLES.REP ? '/rep/dashboard' : '/dashboard'} replace />} 
          />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/attendance" element={<StudentAttendance />} />
          <Route path="/subjects/:subjectId" element={<StudentSubjectDetails />} />
          <Route path="/timetable" element={<StudentTimetable />} />
          <Route path="/calendar" element={<StudentAttendanceHistory />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/drill-down/:status" element={<StudentDrillDown />} />
          <Route path="/modules" element={<StudentHub />} />
        </Route>

        {/* Representative Routes */}
        <Route element={<RoleRoute requiredRole={ROLES.REP} />}>
          <Route element={<AttendanceRepLayout />}>
            <Route path="/rep/dashboard" element={<RepDashboard />} />
            <Route path="/rep/mark" element={<RepMarkAttendance />} />
            <Route path="/rep/sessions" element={<RepSessionList />} />
            <Route path="/rep/sessions/:sessionId" element={<RepSessionDetails />} />
            <Route path="/rep/edit-attendance/:sessionId" element={<RepEditAttendance />} />
            <Route path="/rep/lookup" element={<RepStudentLookup />} />
            <Route path="/rep/reports" element={<RepReports />} />
            <Route path="/rep/manage" element={<RepManageClass />} />
            <Route path="/rep/modules" element={<RepHub />} />
          </Route>
        </Route>

      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
