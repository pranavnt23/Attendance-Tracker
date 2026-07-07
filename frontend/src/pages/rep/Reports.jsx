import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import reportService from '../../services/reportService';
import studentService from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import { BookOpen, Users, Search, ChevronDown, ChevronUp } from 'lucide-react';

const Reports = () => {
  const { user } = useAuth();
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('all'); // 'all' | 'below_75' | 'above_75'
  
  // Roster row expansion state
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  // Subject report selection
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // 1. Fetch class subjects for dropdown
  const subjectsQuery = useQuery({
    queryKey: ['subjects', user?.class_id],
    queryFn: () => studentService.getSubjectsByClass(user.class_id),
    enabled: !!user?.class_id,
  });

  // 2. Fetch subject specific attendance report
  const subjectReportQuery = useQuery({
    queryKey: ['reports', 'subject', selectedSubjectId],
    queryFn: () => reportService.getSubjectAttendanceReport(selectedSubjectId),
    enabled: !!selectedSubjectId,
  });

  // Auto set initial subject selection
  React.useEffect(() => {
    if (subjectsQuery.data && subjectsQuery.data.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjectsQuery.data[0].subject_id);
    }
  }, [subjectsQuery.data, selectedSubjectId]);

  const rawData = subjectReportQuery.data?.students_attendance || [];
  const subjectsList = subjectsQuery.data || [];

  // Filter helper: filters by attendance status, search query
  const getFilteredData = (data) => {
    let result = [...data];

    // Apply Attendance filters (All, Below 75%, 75% and Above)
    if (attendanceFilter === 'below_75') {
      result = result.filter(s => s.attendance_percentage < 75.0);
    } else if (attendanceFilter === 'above_75') {
      result = result.filter(s => s.attendance_percentage >= 75.0);
    }

    // Apply Search Query filter (Roll No or Name)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        s => s.student_name.toLowerCase().includes(q) || s.register_no.toLowerCase().includes(q)
      );
    }

    return result;
  };

  const processedData = getFilteredData(rawData);

  // Toggle expanded details row
  const toggleRow = (studentId) => {
    setExpandedStudentId(expandedStudentId === studentId ? null : studentId);
  };

  const isTabLoading = subjectReportQuery.isLoading || subjectsQuery.isLoading;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      
      {/* Header */}
      <PageHeader 
        title="Reports & Analytics"
        description="Extract subject-wise attendance aggregates, search roll numbers, and view shortage watchlists."
      />

      {/* Subject Dropdown & Filters block */}
      <div className="glass-panel border rounded-3xl p-6 shadow-sm bg-white dark:bg-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Sleek dropdown selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Select Subject
          </span>
          <div className="relative flex-1 max-w-xs">
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                setExpandedStudentId(null);
              }}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-200 cursor-pointer appearance-none pr-8"
            >
              {subjectsList.map(s => (
                <option key={s.subject_id} value={s.subject_id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Instantly filter roster (All, Below 75%, 75%+) */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner w-fit md:ml-auto items-center">
          <button
            onClick={() => setAttendanceFilter('all')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border-0 cursor-pointer ${
              attendanceFilter === 'all' 
                ? 'bg-white dark:bg-slate-900 text-indigo-650 dark:text-indigo-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 bg-transparent'
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setAttendanceFilter('below_75')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border-0 cursor-pointer ${
              attendanceFilter === 'below_75' 
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-750 bg-transparent'
            }`}
          >
            Below 75% Shortage
          </button>
          <button
            onClick={() => setAttendanceFilter('above_75')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border-0 cursor-pointer ${
              attendanceFilter === 'above_75' 
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-750 bg-transparent'
            }`}
          >
            75% & Above Clear
          </button>
        </div>

      </div>

      {/* Real-time search field */}
      <div className="glass-panel border rounded-3xl p-5 shadow-sm bg-white dark:bg-slate-900">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search Name or Register / Roll Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/50 hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Roster List Table */}
      {isTabLoading ? (
        <Loader message="Compiling statistical reports..." size="large" />
      ) : !selectedSubjectId ? (
        <EmptyState 
          icon={BookOpen}
          title="No Subject Selected"
          description="Select a subject from the drop-down menu above to load the student list."
        />
      ) : processedData.length === 0 ? (
        <EmptyState 
          icon={Users}
          title="No Matching Student Logs"
          description="No students match the current filters or search query."
        />
      ) : (
        <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden bg-white dark:bg-slate-900">
          <div className="p-4 border-b border-slate-100 dark:border-slate-850 font-bold text-sm text-slate-750 dark:text-slate-200 flex justify-between items-center bg-slate-50/30 dark:bg-slate-950/20">
            <span>Subject Wise Summary Roster</span>
            <span className="text-xs text-slate-400 dark:text-slate-505 font-semibold">
              {processedData.length} {processedData.length === 1 ? 'student' : 'students'} shown
            </span>
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-105 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/5 text-xs font-bold text-slate-455 dark:text-slate-550 uppercase tracking-wider">
                  <th className="py-3.5 px-6 w-1/4">Roll No</th>
                  <th className="py-3.5 px-6 w-1/3">Student Name</th>
                  <th className="py-3.5 px-6 text-right w-1/6">OD as Present</th>
                  <th className="py-3.5 px-6 text-right w-1/6">OD as Absent</th>
                  <th className="py-3.5 px-6 text-center w-12" />
                </tr>
              </thead>
              <tbody>
                {processedData.map((student) => {
                  const isExpanded = expandedStudentId === student.student_id;
                  
                  // Color codes
                  let pctStyle = 'text-emerald-600 border-emerald-250 bg-emerald-500/5';
                  if (student.attendance_percentage < 50.0) {
                    pctStyle = 'text-rose-600 border-rose-250 bg-rose-500/5';
                  } else if (student.attendance_percentage < 75.0) {
                    pctStyle = 'text-amber-600 border-amber-250 bg-amber-500/5';
                  }

                  let pctStyleOD = 'text-emerald-600 border-emerald-250 bg-emerald-500/5';
                  if (student.attendance_percentage_od < 50.0) {
                    pctStyleOD = 'text-rose-600 border-rose-250 bg-rose-500/5';
                  } else if (student.attendance_percentage_od < 75.0) {
                    pctStyleOD = 'text-amber-600 border-amber-250 bg-amber-500/5';
                  }

                  return (
                    <React.Fragment key={student.student_id}>
                      <tr 
                        onClick={() => toggleRow(student.student_id)}
                        className="border-b last:border-0 border-slate-50 dark:border-slate-850 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6 font-display font-semibold text-slate-500 dark:text-slate-455">
                          {student.register_no}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {student.student_name}
                        </td>
                        <td className="py-4 px-6 text-right font-display">
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${pctStyleOD}`}>
                            {student.attendance_percentage_od}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-display">
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${pctStyle}`}>
                            {student.attendance_percentage}%
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </td>
                      </tr>

                      {/* Expanded Row Detail */}
                      {isExpanded && (
                        <tr className="bg-slate-50/30 dark:bg-slate-950/20">
                          <td colSpan={5} className="py-4 px-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-slide-down">
                              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                                <span className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-wider block">Conducted</span>
                                <span className="text-sm font-bold text-slate-750 dark:text-slate-200 mt-1 block">{student.conducted_hours} hrs</span>
                              </div>
                              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                                <span className="text-[10px] text-emerald-650 dark:text-emerald-450 font-bold uppercase tracking-wider block">Present</span>
                                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">{student.present_hours} hrs</span>
                              </div>
                              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                                <span className="text-[10px] text-rose-650 dark:text-rose-450 font-bold uppercase tracking-wider block">Absent</span>
                                <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-1 block">{student.absent_hours} hrs</span>
                              </div>
                              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                                <span className="text-[10px] text-amber-650 dark:text-amber-450 font-bold uppercase tracking-wider block">On Duty (OD)</span>
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-1 block">{student.od_hours} hrs</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Accordion List View - No Horizontal Scroll */}
          <div className="lg:hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {processedData.map((student) => {
              const isExpanded = expandedStudentId === student.student_id;
              
              // Color codes
              let pctStyle = 'text-emerald-600 border-emerald-250 bg-emerald-500/5';
              if (student.attendance_percentage < 50.0) {
                pctStyle = 'text-rose-600 border-rose-250 bg-rose-500/5';
              } else if (student.attendance_percentage < 75.0) {
                pctStyle = 'text-amber-600 border-amber-250 bg-amber-500/5';
              }

              let pctStyleOD = 'text-emerald-600 border-emerald-250 bg-emerald-500/5';
              if (student.attendance_percentage_od < 50.0) {
                pctStyleOD = 'text-rose-600 border-rose-250 bg-rose-500/5';
              } else if (student.attendance_percentage_od < 75.0) {
                pctStyleOD = 'text-amber-600 border-amber-250 bg-amber-500/5';
              }

              return (
                <div key={student.student_id} className="flex flex-col">
                  {/* Row Trigger */}
                  <div 
                    onClick={() => toggleRow(student.student_id)}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-slate-900/10 active:bg-slate-100/50 cursor-pointer select-none"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-0.5">
                        {student.register_no}
                      </p>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {student.student_name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[7px] font-bold text-slate-400">OD as Present</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${pctStyleOD}`}>
                          {student.attendance_percentage_od}%
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-[7px] font-bold text-slate-400">OD as Absent</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${pctStyle}`}>
                          {student.attendance_percentage}%
                        </span>
                      </div>
                      <div className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-50/50 dark:border-slate-850/50">
                      <div className="grid grid-cols-2 gap-3 mt-2 animate-slide-down">
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center shadow-sm">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Conducted</span>
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200 mt-1 block">{student.conducted_hours} hrs</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center shadow-sm">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider block">Present</span>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">{student.present_hours} hrs</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center shadow-sm">
                          <span className="text-[10px] text-rose-600 dark:text-rose-450 font-bold uppercase tracking-wider block">Absent</span>
                          <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400 mt-1 block">{student.absent_hours} hrs</span>
                        </div>
                        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl text-center shadow-sm">
                          <span className="text-[10px] text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider block">On Duty (OD)</span>
                          <span className="text-xs font-extrabold text-amber-600 dark:text-amber-450 mt-1 block">{student.od_hours} hrs</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
