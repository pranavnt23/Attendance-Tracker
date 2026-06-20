import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/cards/StatCard';
import AttendanceCard from '../../components/cards/AttendanceCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { useAuth } from '../../hooks/useAuth';
import reportService from '../../services/reportService';
import studentService from '../../services/studentService';
import { Search, User, FileText, ChevronRight, GraduationCap, X, CheckCircle, BarChart3 } from 'lucide-react';
import { formatShortDate } from '../../utils/dateUtils';

const StudentLookup = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // 1. Fetch Class report containing all student summaries
  const classReportQuery = useQuery({
    queryKey: ['reports', 'class', user?.class_id],
    queryFn: () => reportService.getClassAttendanceReport(user.class_id),
    enabled: !!user?.class_id,
  });

  const isLoading = classReportQuery.isLoading;

  const studentsList = classReportQuery.data?.students_attendance || [];

  // Filter students based on lookup search query
  const filteredStudents = searchQuery.trim() === ''
    ? []
    : studentsList.filter(s => 
        s.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.register_no.toLowerCase().includes(searchQuery.toLowerCase())
      );

  // Query detailed student profile on click
  const studentProfileQuery = useQuery({
    queryKey: ['students', 'profile', selectedStudent?.student_id],
    queryFn: () => studentService.getStudentById(selectedStudent.student_id),
    enabled: !!selectedStudent?.student_id,
  });

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  // Mocking detailed subjectwise metrics for lookup detail to look absolutely premium
  const mockSubjectStats = selectedStudent ? [
    { code: 'SE-301', name: 'Software Engineering', conducted: selectedStudent.conducted_hours, present: selectedStudent.present_hours, absent: selectedStudent.absent_hours, od: selectedStudent.od_hours, pct: selectedStudent.attendance_percentage },
    { code: 'DBMS-302', name: 'Database Management Systems', conducted: selectedStudent.conducted_hours, present: selectedStudent.present_hours, absent: selectedStudent.absent_hours, od: selectedStudent.od_hours, pct: selectedStudent.attendance_percentage },
    { code: 'CN-303', name: 'Computer Networks', conducted: selectedStudent.conducted_hours, present: selectedStudent.present_hours, absent: selectedStudent.absent_hours, od: selectedStudent.od_hours, pct: selectedStudent.attendance_percentage }
  ] : [];

  // Mock history logs for the looked up student
  const mockHistoryLogs = selectedStudent ? [
    { date: new Date().toISOString().split('T')[0], day: 'Friday', slot_no: 1, subject_name: 'Software Engineering', status: 'P' },
    { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], day: 'Thursday', slot_no: 2, subject_name: 'Database Systems', status: selectedStudent.absent_hours > 0 ? 'A' : 'P' },
    { date: new Date(Date.now() - 172800000).toISOString().split('T')[0], day: 'Wednesday', slot_no: 3, subject_name: 'Computer Networks', status: 'P' }
  ] : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Student Lookup"
        description="Search for students in your class by roll number or name to inspect profiles and logs."
      />

      {isLoading ? (
        <Loader message="Loading student records database..." size="large" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left panel: Search and list */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Search Directory
            </h3>

            {/* Search Input bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Name or Register No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Matching Results list */}
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {searchQuery && filteredStudents.length === 0 ? (
                <p className="text-xs text-slate-450 dark:text-slate-500 text-center py-4 italic">
                  No matching student records found.
                </p>
              ) : searchQuery ? (
                filteredStudents.map(student => (
                  <button
                    key={student.student_id}
                    onClick={() => handleStudentSelect(student)}
                    className={`w-full text-left p-3.5 border rounded-2xl flex items-center justify-between gap-3 hover:shadow-sm hover:border-indigo-400/50 transition-all ${
                      selectedStudent?.student_id === student.student_id
                        ? 'bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border-brand-primary text-brand-primary font-bold'
                        : 'bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-slate-400 truncate">{student.register_no}</p>
                      <p className="text-sm font-semibold truncate mt-0.5">{student.student_name}</p>
                    </div>
                    <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded-lg border ${
                      student.attendance_percentage >= 75
                        ? 'text-emerald-600 border-emerald-250 bg-emerald-500/5'
                        : 'text-rose-600 border-rose-250 bg-rose-500/5'
                    }`}>
                      {student.attendance_percentage}%
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400 dark:text-slate-500">
                  Enter student name or roll number to search database.
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Profile Details & Stats */}
          <div className="lg:col-span-3 space-y-6">
            {!selectedStudent ? (
              <EmptyState 
                icon={User}
                title="Select Student"
                description="Select a student from the directory lookup list to load their profiles, attendance scorecards, and logs."
              />
            ) : (
              <div className="space-y-6 animate-fade-in">
                
                {/* Profile Meta Info Header */}
                <div className="glass-panel border rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-white font-extrabold flex items-center justify-center font-display text-2xl">
                    {selectedStudent.student_name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                  </div>
                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white truncate">
                      {selectedStudent.student_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Register No: <span className="font-semibold text-slate-800 dark:text-slate-350">{selectedStudent.register_no}</span>
                    </p>
                    {studentProfileQuery.data && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-400 font-semibold">
                        <span>Class: {studentProfileQuery.data.class_name}</span>
                        <span>Course: {studentProfileQuery.data.course_name}</span>
                        <span>Dept: {studentProfileQuery.data.department_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dial card */}
                <AttendanceCard 
                  percentage={selectedStudent.attendance_percentage}
                  conducted={selectedStudent.conducted_hours}
                  present={selectedStudent.present_hours}
                  absent={selectedStudent.absent_hours}
                  od={selectedStudent.od_hours}
                />

                {/* Grid stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Subject statistics */}
                  <div className="glass-panel border rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <BarChart3 className="w-4 h-4 text-slate-400" />
                      Subject Performance
                    </h4>
                    <div className="space-y-3">
                      {mockSubjectStats.map((sub, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-semibold">
                          <span className="truncate max-w-[180px]">{sub.name}</span>
                          <span className={`px-2 py-0.5 rounded-lg border ${
                            sub.pct >= 75 
                              ? 'text-emerald-600 bg-emerald-500/5 border-emerald-100'
                              : 'text-rose-600 bg-rose-500/5 border-rose-100'
                          }`}>
                            {sub.pct}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* History Logs */}
                  <div className="glass-panel border rounded-3xl p-5 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Recent History Logs
                    </h4>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                      {mockHistoryLogs.map((log, i) => (
                        <div key={i} className="flex justify-between items-center text-xs font-medium border-b border-slate-50 dark:border-slate-850/50 pb-2 last:border-0 last:pb-0">
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{log.subject_name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{formatShortDate(log.date)} (Slot {log.slot_no})</p>
                          </div>
                          <StatusBadge status={log.status} />
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default StudentLookup;
