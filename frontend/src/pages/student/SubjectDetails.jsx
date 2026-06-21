import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle, Calendar, GraduationCap, Clock } from 'lucide-react';

import studentService from '../../services/studentService';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatShortDate } from '../../utils/dateUtils';

const SubjectDetails = () => {
  const { subjectId } = useParams();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      <div className="glass-panel border rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto">
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
    (h) => h.subject_name.toLowerCase() === stats.subject_name.toLowerCase()
  );

  // Parse date string in local timezone to avoid UTC shifting issues
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(dateStr);
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  };

  // Apply Date Range Filter
  const filteredHistory = subjectHistory.filter((log) => {
    if (!log.date) return true;
    const logDate = parseLocalDate(log.date);

    if (startDate) {
      const start = parseLocalDate(startDate);
      if (logDate < start) return false;
    }

    if (endDate) {
      const end = parseLocalDate(endDate);
      if (logDate > end) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header back button */}
      <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-6 -mt-6 md:-mt-8 -mx-6 md:-mx-8 px-6 md:px-8 transition-colors">
        <Link 
          to="/attendance" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Attendance
        </Link>
      </div>

      {/* Page Title */}
      <div>
        <PageHeader 
          title={stats.subject_name}
          description={`Subject Code: ${stats.subject_code}`}
        />
      </div>

      {/* Stats Cards grid (Conducted hours removed, only percentage & P/A/OD counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Attendance Percentage"
          value={`${stats.attendance_percentage}%`}
          color={stats.attendance_percentage >= 75 ? 'emerald' : 'rose'}
          icon={GraduationCap}
          subtext={stats.attendance_percentage >= 75 ? 'Meets threshold' : 'Attendance shortage'}
        />
        <StatCard 
          title="Present Count"
          value={`${stats.present_hours} hrs`}
          color="emerald"
          icon={CheckCircle}
          subtext="Attended classes"
        />
        <StatCard 
          title="Absent Count"
          value={`${stats.absent_hours} hrs`}
          color="rose"
          icon={XCircle}
          subtext="Missed lectures"
        />
        <StatCard 
          title="On Duty (OD)"
          value={`${stats.od_hours} hrs`}
          color="amber"
          icon={Calendar}
          subtext="Counts as absent for percentage"
        />
      </div>

      {/* Log history list */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white">
            Class Log History
          </h3>
          
          {/* Date Filter Inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-0 focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer w-28"
              />
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-0 focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer w-28"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="px-3 py-1.5 text-[10px] font-extrabold text-rose-500 hover:text-white bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500 dark:hover:bg-rose-600 border border-rose-500/25 dark:border-rose-500/35 rounded-xl cursor-pointer transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        
        <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden bg-white dark:bg-slate-900 p-6">
          {filteredHistory.length === 0 ? (
            <p className="py-8 text-center text-slate-450 dark:text-slate-500 font-medium italic">
              {subjectHistory.length === 0 
                ? "No logs recorded for this subject yet."
                : "No logs match the selected date range."
              }
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredHistory.map((log, idx) => (
                <div 
                  key={idx}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatShortDate(log.date)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
                      Slot {log.slot_no} • {log.day}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {log.status === 'OD' && log.od_reason && (
                      <span className="text-[10px] text-slate-455 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg max-w-[180px] truncate">
                        Reason: {log.od_reason}
                      </span>
                    )}
                    <StatusBadge status={log.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectDetails;
