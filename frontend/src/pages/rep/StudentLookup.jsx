import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/cards/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import reportService from '../../services/reportService';
import studentService from '../../services/studentService';
import { Search, User, ChevronRight, CheckCircle, XCircle, Calendar, ArrowLeft, Clock, GraduationCap } from 'lucide-react';
import { formatShortDate } from '../../utils/dateUtils';

const StudentLookup = () => {
  const { user } = useAuth();
  
  // Sidebar Search states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Student & Detail View states
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  // Drill-down by status states
  const [lookupDrillDownStatus, setLookupDrillDownStatus] = useState(null); // null | 'P' | 'A' | 'OD'
  const [lookupSelectedSubject, setLookupSelectedSubject] = useState(null);

  // Direct subject selection detail state
  const [directSelectedSubject, setDirectSelectedSubject] = useState(null);

  // Date Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  // 1. Fetch Class students list
  const classReportQuery = useQuery({
    queryKey: ['students', 'class', user?.class_id],
    queryFn: () => studentService.getClassStudents(user.class_id),
    enabled: !!user?.class_id,
  });

  // 2. Fetch Selected Student's Subject-Wise Attendance
  const studentSubjectsQuery = useQuery({
    queryKey: ['rep', 'student', 'subjects', selectedStudent?.student_id],
    queryFn: () => studentService.getRepStudentSubjectWise(selectedStudent.student_id),
    enabled: !!selectedStudent?.student_id,
  });

  // 3. Fetch Selected Student's Attendance History
  const studentHistoryQuery = useQuery({
    queryKey: ['rep', 'student', 'history', selectedStudent?.student_id],
    queryFn: () => studentService.getRepStudentHistory(selectedStudent.student_id),
    enabled: !!selectedStudent?.student_id,
  });

  const isLoadingClass = classReportQuery.isLoading;
  const isDetailsLoading = studentSubjectsQuery.isLoading || studentHistoryQuery.isLoading;

  const studentsList = classReportQuery.data || [];

  // Filter students roster list by search query (no overall percentage filters)
  const filteredStudents = searchQuery.trim() === ''
    ? studentsList
    : studentsList.filter(
        s => s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             s.register_no.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setLookupDrillDownStatus(null);
    setLookupSelectedSubject(null);
    setDirectSelectedSubject(null);
    setStartDate('');
    setEndDate('');
  };

  const clearStudentSelection = () => {
    setSelectedStudent(null);
    setLookupDrillDownStatus(null);
    setLookupSelectedSubject(null);
    setDirectSelectedSubject(null);
    setStartDate('');
    setEndDate('');
  };

  const statusMeta = {
    P: {
      label: 'Present Sessions',
      color: 'emerald',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-100 dark:border-emerald-900/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      icon: CheckCircle
    },
    A: {
      label: 'Absent Sessions',
      color: 'rose',
      bgLight: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-100 dark:border-rose-900/50',
      text: 'text-rose-600 dark:text-rose-455',
      icon: XCircle
    },
    OD: {
      label: 'On Duty (OD) Sessions',
      color: 'amber',
      bgLight: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-100 dark:border-amber-900/50',
      text: 'text-amber-600 dark:text-amber-400',
      icon: Calendar
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Student Lookup"
        description="Search for student profiles to view their subject attendance and logs."
      />

      {isLoadingClass ? (
        <Loader message="Loading student roster directory..." size="large" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left panel: Search and list */}
          <div className={`lg:col-span-1 space-y-4 ${selectedStudent ? 'hidden lg:block' : 'block'}`}>
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Search Directory
            </h3>

            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Name or Roll No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 border-0 bg-transparent cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Matching Results list (only Roll No & Name, no overall percentage badge!) */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <p className="text-xs text-slate-455 dark:text-slate-500 text-center py-4 italic">
                  No matching student records found.
                </p>
              ) : (
                filteredStudents.map(student => (
                  <button
                    key={student.student_id}
                    onClick={() => handleStudentSelect(student)}
                    className={`w-full text-left p-3.5 border rounded-2xl flex items-center justify-between gap-3 hover:shadow-sm hover:border-indigo-400/50 transition-all cursor-pointer ${
                      selectedStudent?.student_id === student.student_id
                        ? 'bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-brand-primary text-brand-primary font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-bold text-slate-400 truncate">{student.register_no}</p>
                      <p className="text-xs font-semibold truncate mt-0.5">{student.student_name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right panel: Details & Drill-downs */}
          <div className={`lg:col-span-3 space-y-6 ${selectedStudent ? 'block' : 'hidden lg:block'}`}>
            {!selectedStudent ? (
              <EmptyState 
                icon={User}
                title="Select Student"
                description="Select a student from the directory roster on the left to trace logs."
              />
            ) : isDetailsLoading ? (
              <Loader message="Retrieving student profile details..." size="large" />
            ) : directSelectedSubject ? (
              // View D: Direct Subject Detail Drilldown (clicked from subject-wise list)
              <div className="space-y-6 animate-fade-in">
                  <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-4 -mt-6 md:-mt-8 -mx-6 md:-mx-8 px-6 md:px-8 transition-colors">
                    <button
                      onClick={() => setDirectSelectedSubject(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Student Details
                    </button>
                  </div>

                <div className="glass-panel border rounded-3xl p-6 shadow-sm bg-white dark:bg-slate-900 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{directSelectedSubject.subject_code}</span>
                  <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                    {directSelectedSubject.subject_name}
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard 
                    title="Attendance Percentage"
                    value={`${directSelectedSubject.attendance_percentage}%`}
                    color={directSelectedSubject.attendance_percentage >= 75 ? 'emerald' : 'rose'}
                    icon={GraduationCap}
                  />
                  <StatCard 
                    title="Present Count"
                    value={`${directSelectedSubject.present_hours} hrs`}
                    color="emerald"
                    icon={CheckCircle}
                  />
                  <StatCard 
                    title="Absent Count"
                    value={`${directSelectedSubject.absent_hours} hrs`}
                    color="rose"
                    icon={XCircle}
                  />
                  <StatCard 
                    title="On Duty (OD)"
                    value={`${directSelectedSubject.od_hours} hrs`}
                    color="amber"
                    icon={Calendar}
                  />
                </div>

                {/* History Date logs for direct subject view */}
                <div className="glass-panel border rounded-3xl p-6 shadow-sm bg-white dark:bg-slate-900 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-3">
                    <h4 className="text-sm font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                      Subject Class Logs
                    </h4>
                    
                    {/* Date Filter Inputs */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[11px] shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">From</span>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-transparent border-0 focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer w-28"
                        />
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[11px] shadow-sm">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To</span>
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
                          className="px-2.5 py-1.5 text-[9px] font-extrabold text-rose-500 hover:text-white bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500 dark:hover:bg-rose-600 border border-rose-500/25 dark:border-rose-500/35 rounded-xl cursor-pointer transition-all duration-200"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const subLogs = (studentHistoryQuery.data || []).filter(
                      log => log.subject_name.toLowerCase() === directSelectedSubject.subject_name.toLowerCase()
                    );

                    if (subLogs.length === 0) {
                      return (
                        <p className="py-8 text-center text-slate-400 font-medium italic">
                          No logs recorded for this subject yet.
                        </p>
                      );
                    }

                    // Apply date filtering
                    const filteredSubLogs = subLogs.filter(log => {
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

                    if (filteredSubLogs.length === 0) {
                      return (
                        <p className="py-8 text-center text-slate-400 font-medium italic">
                          No logs match the selected date range.
                        </p>
                      );
                    }

                    return (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredSubLogs.map((log, index) => (
                          <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-955 dark:text-white">{formatShortDate(log.date)}</p>
                              <p className="text-[10px] text-slate-450 dark:text-slate-550 font-semibold mt-0.5">Slot {log.slot_no} • {log.day}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {log.status === 'OD' && log.od_reason && (
                                <span className="text-[10px] text-slate-450 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                  Reason: {log.od_reason}
                                </span>
                              )}
                              <StatusBadge status={log.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : lookupDrillDownStatus ? (
              // View C: Clicked status drill-down
              !lookupSelectedSubject ? (
                // Step 1: Subject Selection for clicked status
                <div className="space-y-6 animate-fade-in">
                  <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-4 -mt-6 md:-mt-8 -mx-6 md:-mx-8 px-6 md:px-8 transition-colors">
                    <button
                      onClick={() => setLookupDrillDownStatus(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Student Details
                    </button>
                  </div>

                  <div className="glass-panel border rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {statusMeta[lookupDrillDownStatus]?.label}
                    </h3>
                    <p className="text-xs text-slate-400">Select a subject below to view logged dates.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(studentSubjectsQuery.data || []).map((sub) => {
                      const count = (studentHistoryQuery.data || []).filter(
                        h => h.subject_name.toLowerCase() === sub.subject_name.toLowerCase() &&
                             h.status === lookupDrillDownStatus
                      ).length;

                      const meta = statusMeta[lookupDrillDownStatus];
                      const Icon = meta.icon;

                      return (
                        <button
                          key={sub.subject_id}
                          onClick={() => setLookupSelectedSubject(sub)}
                          className="glass-panel border rounded-3xl p-5 text-left flex flex-col justify-between group cursor-pointer bg-white dark:bg-slate-900 hover:border-slate-350 hover:scale-[1.01] transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-[10px] font-bold text-slate-400 tracking-wider">{sub.subject_code}</span>
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${meta.bgLight} ${meta.border} ${meta.text}`}>
                                {count} {count === 1 ? 'session' : 'sessions'}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">{sub.subject_name}</h4>
                          </div>

                          <div className="flex items-center justify-between text-xs text-indigo-650 font-bold pt-4 mt-4 border-t border-slate-50 dark:border-slate-800">
                            <span>View Dates</span>
                            <Icon className={`w-4 h-4 ${meta.text}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Step 2: History dates for clicked status & selected subject
                <div className="space-y-6 animate-fade-in">
                  <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-4 -mt-6 md:-mt-8 -mx-6 md:-mx-8 px-6 md:px-8 transition-colors">
                    <button
                      onClick={() => setLookupSelectedSubject(null)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Subject Selection
                    </button>
                  </div>

                  <div className="glass-panel border rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-sm space-y-1">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{lookupSelectedSubject.subject_code}</span>
                    <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                      {lookupSelectedSubject.subject_name}
                    </h3>
                  </div>                  {/* Log list for status & subject */}
                  <div className="glass-panel border rounded-3xl p-6 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850 pb-3">
                      <h4 className="text-sm font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider">
                        Conducted Logs ({statusMeta[lookupDrillDownStatus]?.label})
                      </h4>
                      
                      {/* Date Filter Inputs */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[11px] shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">From</span>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-0 focus:outline-none text-slate-800 dark:text-slate-100 cursor-pointer w-28"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[11px] shadow-sm">
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To</span>
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
                            className="px-2.5 py-1.5 text-[9px] font-extrabold text-rose-500 hover:text-white bg-rose-500/10 dark:bg-rose-500/20 hover:bg-rose-500 dark:hover:bg-rose-600 border border-rose-500/25 dark:border-rose-500/35 rounded-xl cursor-pointer transition-all duration-200"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {(() => {
                      const logs = (studentHistoryQuery.data || []).filter(
                        h => h.subject_name.toLowerCase() === lookupSelectedSubject.subject_name.toLowerCase() &&
                             h.status === lookupDrillDownStatus
                      );

                      if (logs.length === 0) {
                        return (
                          <p className="py-8 text-center text-slate-400 font-medium italic">
                            No logs logged under this status.
                          </p>
                        );
                      }

                      // Apply date filtering
                      const filteredLogs = logs.filter(log => {
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

                      if (filteredLogs.length === 0) {
                        return (
                          <p className="py-8 text-center text-slate-400 font-medium italic">
                            No logs match the selected date range.
                          </p>
                        );
                      }

                      return (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredLogs.map((log, index) => (
                            <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                              <div>
                                <p className="text-sm font-semibold text-slate-950 dark:text-white">{formatShortDate(log.date)}</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Slot {log.slot_no} • {log.day}</p>
                              </div>
                              {lookupDrillDownStatus === 'OD' && log.od_reason && (
                                <span className="text-[10px] text-slate-455 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                  Reason: {log.od_reason}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )
            ) : (() => {
              const subjects = studentSubjectsQuery.data || [];
              const totalPresent = subjects.reduce((sum, s) => sum + (s.present_hours || 0), 0);
              const totalAbsent = subjects.reduce((sum, s) => sum + (s.absent_hours || 0), 0);
              const totalOD = subjects.reduce((sum, s) => sum + (s.od_hours || 0), 0);

              return (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Close Profile lookup button */}
                  <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-md py-3 border-b border-slate-200/60 dark:border-slate-800/60 mb-4 -mt-6 md:-mt-8 -mx-6 md:-mx-8 px-6 md:px-8 transition-colors">
                    <button
                      onClick={clearStudentSelection}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors border-0 bg-transparent cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Close Profile Lookup
                    </button>
                  </div>

                  {/* Profile Meta Info Header */}
                  <div className="glass-panel border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-slate-900">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white font-extrabold flex items-center justify-center font-display text-2xl">
                      {selectedStudent.student_name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left flex-1 min-w-0">
                      <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white truncate">
                        {selectedStudent.student_name}
                      </h3>
                      <p className="text-sm text-slate-550 dark:text-slate-450 mt-1">
                        Register No: <span className="font-semibold text-slate-800 dark:text-slate-350">{selectedStudent.register_no}</span>
                      </p>
                    </div>
                  </div>

                  {/* Clickable Overall Counts Stats Cards (No overall percentage box) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      onClick={() => setLookupDrillDownStatus('P')}
                      className="glass-panel border rounded-3xl p-5 text-left flex items-center justify-between shadow-sm hover:shadow-md hover:border-emerald-500/40 hover:scale-[1.01] transition-all bg-white dark:bg-slate-900 group cursor-pointer w-full"
                    >
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
                          Present Hours
                        </span>
                        <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
                          {totalPresent} hrs
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1.5">
                          Attended lectures log
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 flex items-center justify-center shrink-0 border border-emerald-500/10">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </button>

                    <button
                      onClick={() => setLookupDrillDownStatus('A')}
                      className="glass-panel border rounded-3xl p-5 text-left flex items-center justify-between shadow-sm hover:shadow-md hover:border-rose-500/40 hover:scale-[1.01] transition-all bg-white dark:bg-slate-900 group cursor-pointer w-full"
                    >
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
                          Absent Hours
                        </span>
                        <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
                          {totalAbsent} hrs
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1.5">
                          Missed lectures log
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-455 flex items-center justify-center shrink-0 border border-rose-500/10">
                        <XCircle className="w-6 h-6" />
                      </div>
                    </button>

                    <button
                      onClick={() => setLookupDrillDownStatus('OD')}
                      className="glass-panel border rounded-3xl p-5 text-left flex items-center justify-between shadow-sm hover:shadow-md hover:border-amber-500/40 hover:scale-[1.01] transition-all bg-white dark:bg-slate-900 group cursor-pointer w-full"
                    >
                      <div className="overflow-hidden">
                        <span className="text-[10px] font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider block">
                          On Duty (OD)
                        </span>
                        <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
                          {totalOD} hrs
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-1.5">
                          Authorized duty count
                        </span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/10">
                        <Calendar className="w-6 h-6" />
                      </div>
                    </button>
                  </div>

                  {/* List of subjects and percentages (Subjectwise details) */}
                  <div className="glass-panel border rounded-3xl p-6 shadow-sm bg-white dark:bg-slate-900 space-y-4">
                    <h4 className="text-sm font-bold text-slate-455 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-850 pb-2">
                      Subject-Wise Attendance
                    </h4>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subjects.map((sub) => (
                        <button
                          key={sub.subject_id}
                          onClick={() => setDirectSelectedSubject(sub)}
                          className="w-full text-left py-4 flex items-center justify-between gap-4 group cursor-pointer border-0 bg-transparent hover:bg-slate-50/30 dark:hover:bg-slate-950/10 px-2 rounded-xl transition-colors"
                        >
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-bold text-slate-450 tracking-wider uppercase">{sub.subject_code}</p>
                            <h5 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                              {sub.subject_name}
                            </h5>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                              sub.attendance_percentage >= 75
                                ? 'text-emerald-600 border-emerald-250 bg-emerald-500/5'
                                : 'text-rose-600 border-rose-250 bg-rose-500/5'
                            }`}>
                              {sub.attendance_percentage}%
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()
            }
          </div>

        </div>
      )}

    </div>
  );
};

export default StudentLookup;
