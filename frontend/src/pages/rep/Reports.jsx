import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import reportService from '../../services/reportService';
import studentService from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import { BarChart3, AlertTriangle, BookOpen, Users, HelpCircle, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';

const Reports = () => {
  const { user } = useAuth();
  const [activeReportTab, setActiveReportTab] = useState('class'); // 'class' | 'subject' | 'shortage'

  // Shortage category state
  const [shortageThreshold, setShortageThreshold] = useState(90.0); // 90.0 | 80.0 | 75.0

  // Subject report selection
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  // 1. Fetch class subjects for dropdown list
  const subjectsQuery = useQuery({
    queryKey: ['subjects', user?.class_id],
    queryFn: () => studentService.getSubjectsByClass(user.class_id),
    enabled: !!user?.class_id,
  });

  // 2. Fetch class attendance summary report
  const classReportQuery = useQuery({
    queryKey: ['reports', 'class', user?.class_id],
    queryFn: () => reportService.getClassAttendanceReport(user.class_id),
    enabled: !!user?.class_id && activeReportTab === 'class',
  });

  // 3. Fetch subject specific attendance report
  const subjectReportQuery = useQuery({
    queryKey: ['reports', 'subject', selectedSubjectId],
    queryFn: () => reportService.getSubjectAttendanceReport(selectedSubjectId),
    enabled: !!selectedSubjectId && activeReportTab === 'subject',
  });

  // 4. Fetch shortage report with specific threshold
  const shortageReportQuery = useQuery({
    queryKey: ['reports', 'shortage', user?.class_id, shortageThreshold],
    queryFn: () => reportService.getShortageReport(user.class_id, shortageThreshold),
    enabled: !!user?.class_id && activeReportTab === 'shortage',
  });

  // Auto set initial subject selection
  React.useEffect(() => {
    if (subjectsQuery.data && subjectsQuery.data.length > 0 && !selectedSubjectId) {
      setSelectedSubjectId(subjectsQuery.data[0].subject_id);
    }
  }, [subjectsQuery.data, selectedSubjectId]);

  const classData = classReportQuery.data?.students_attendance || [];
  const subjectData = subjectReportQuery.data?.students_attendance || [];
  const shortageData = shortageReportQuery.data?.students_shortage || [];
  const subjectsList = subjectsQuery.data || [];

  // Distribution chart parameters
  const above75Count = classData.filter(s => s.attendance_percentage >= 75.0).length;
  const range50To75Count = classData.filter(s => s.attendance_percentage >= 50.0 && s.attendance_percentage < 75.0).length;
  const below50Count = classData.filter(s => s.attendance_percentage < 50.0).length;
  const totalStudentsCount = classData.length || 1;

  const pctAbove75 = Math.round((above75Count / totalStudentsCount) * 100);
  const pct50To75 = Math.round((range50To75Count / totalStudentsCount) * 100);
  const pctBelow50 = Math.round((below50Count / totalStudentsCount) * 100);

  return (
    <div className="space-y-6">
      
      {/* Header and top tab controls */}
      <PageHeader 
        title="Reports & Analytics"
        description="Extract statistical aggregates, track low-attendance roster shorts, and print lists."
        actions={
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-205 shadow-inner">
            <button
              onClick={() => setActiveReportTab('class')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeReportTab === 'class' ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Class Summary
            </button>
            <button
              onClick={() => setActiveReportTab('subject')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeReportTab === 'subject' ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Subject Wise
            </button>
            <button
              onClick={() => setActiveReportTab('shortage')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeReportTab === 'shortage' ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Watchlist Shortage
            </button>
          </div>
        }
      />

      {/* Tab 1: Class Summary */}
      {activeReportTab === 'class' && (
        <div className="space-y-6">
          {classReportQuery.isLoading ? (
            <Loader message="Compiling class stats..." size="large" />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Distribution visual graphics left */}
              <div className="glass-panel border rounded-3xl p-6 shadow-sm space-y-6">
                <h4 className="text-sm font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <BarChart3 className="w-4 h-4 text-indigo-500" />
                  Roster Distribution
                </h4>

                <div className="space-y-4">
                  {/* Distribution bar chart */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-6 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full hover:opacity-90" style={{ width: `${pctAbove75}%` }} title={`Above 75%: ${pctAbove75}%`} />
                    <div className="bg-amber-500 h-full hover:opacity-90" style={{ width: `${pct50To75}%` }} title={`50% - 75%: ${pct50To75}%`} />
                    <div className="bg-rose-500 h-full hover:opacity-90" style={{ width: `${pctBelow50}%` }} title={`Below 50%: ${pctBelow50}%`} />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        Clear Threshold (≥ 75%)
                      </span>
                      <span>{above75Count} Students ({pctAbove75}%)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        Caution Range (50% - 75%)
                      </span>
                      <span>{range50To75Count} Students ({pct50To75}%)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-500">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        Critical Shortage (&lt; 50%)
                      </span>
                      <span>{below50Count} Students ({pctBelow50}%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster table list right */}
              <div className="lg:col-span-2 glass-panel border rounded-3xl shadow-sm overflow-hidden bg-slate-50/10">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 font-bold text-sm text-slate-700 dark:text-slate-200">
                  Class Attendance Roster
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-6">Roll No</th>
                        <th className="py-3.5 px-6">Student Name</th>
                        <th className="py-3.5 px-6 text-center">Conducted</th>
                        <th className="py-3.5 px-6 text-right">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classData.map((student) => (
                        <tr 
                          key={student.student_id}
                          className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                        >
                          <td className="py-4 px-6 font-display font-semibold text-slate-500">
                            {student.register_no}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                            {student.student_name}
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-slate-500">
                            {student.conducted_hours} hrs
                          </td>
                          <td className="py-4 px-6 text-right font-display">
                            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                              student.attendance_percentage >= 75
                                ? 'text-emerald-600 border-emerald-250 bg-emerald-500/5'
                                : student.attendance_percentage >= 50
                                  ? 'text-amber-600 border-amber-250 bg-amber-500/5'
                                  : 'text-rose-600 border-rose-250 bg-rose-500/5'
                            }`}>
                              {student.attendance_percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* Tab 2: Subject-wise */}
      {activeReportTab === 'subject' && (
        <div className="space-y-6">
          {/* Subject Selector Filter */}
          <div className="glass-panel border rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4 max-w-xl">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Select Subject
            </span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-100/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-200"
            >
              {subjectsList.map(s => (
                <option key={s.subject_id} value={s.subject_id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                  {s.subject_code} - {s.subject_name}
                </option>
              ))}
            </select>
          </div>

          {subjectReportQuery.isLoading ? (
            <Loader message="Compiling subject attendance sheets..." size="large" />
          ) : !selectedSubjectId ? (
            <EmptyState 
              icon={BookOpen}
              title="No Subject Selected"
              description="Please select a subject conducting session to audit aggregates."
            />
          ) : (
            <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden bg-slate-50/10">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 font-bold text-sm text-slate-700 dark:text-slate-200">
                Subject Roster Detail
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Roll No</th>
                      <th className="py-3.5 px-6">Student Name</th>
                      <th className="py-3.5 px-6 text-center">Conducted</th>
                      <th className="py-3.5 px-6 text-center text-emerald-500">Present</th>
                      <th className="py-3.5 px-6 text-center text-rose-500">Absent</th>
                      <th className="py-3.5 px-6 text-center text-amber-500">OD</th>
                      <th className="py-3.5 px-6 text-right">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 px-6 text-center text-slate-400 font-medium">
                          No logs conducted for this subject yet.
                        </td>
                      </tr>
                    ) : (
                      subjectData.map((student) => (
                        <tr 
                          key={student.student_id}
                          className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                        >
                          <td className="py-4 px-6 font-display font-semibold text-slate-500">
                            {student.register_no}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                            {student.student_name}
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-slate-500">
                            {student.conducted_hours} hrs
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-emerald-600 dark:text-emerald-400">
                            {student.present_hours} hrs
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-rose-600 dark:text-rose-400">
                            {student.absent_hours} hrs
                          </td>
                          <td className="py-4 px-6 text-center font-bold text-amber-600 dark:text-amber-450">
                            {student.od_hours} hrs
                          </td>
                          <td className="py-4 px-6 text-right font-display">
                            <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                              student.attendance_percentage >= 75
                                ? 'text-emerald-600 border-emerald-250 bg-emerald-500/5'
                                : student.attendance_percentage >= 50
                                  ? 'text-amber-600 border-amber-250 bg-amber-500/5'
                                  : 'text-rose-600 border-rose-250 bg-rose-500/5'
                            }`}>
                              {student.attendance_percentage}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Shortage Watchlist */}
      {activeReportTab === 'shortage' && (
        <div className="space-y-6">
          {/* Threshold categories */}
          <div className="glass-panel border rounded-3xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Watchlist Shortage Category
            </span>
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-205">
              <button
                onClick={() => setShortageThreshold(90.0)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  shortageThreshold === 90.0 ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-500'
                }`}
              >
                Below 90% (Caution)
              </button>
              <button
                onClick={() => setShortageThreshold(80.0)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  shortageThreshold === 80.0 ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-500'
                }`}
              >
                Below 80% (Warning)
              </button>
              <button
                onClick={() => setShortageThreshold(75.0)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  shortageThreshold === 75.0 ? 'bg-white dark:bg-slate-900 text-brand-primary shadow-sm' : 'text-slate-500'
                }`}
              >
                Below 75% (Critical)
              </button>
            </div>
          </div>

          {shortageReportQuery.isLoading ? (
            <Loader message="Compiling low attendance shortages..." size="large" />
          ) : shortageData.length === 0 ? (
            <EmptyState 
              icon={CheckCircle}
              title="Roster Shortage Clear!"
              description={`Perfect! No students are currently logging attendance ratios below ${shortageThreshold}%.`}
            />
          ) : (
            <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden bg-slate-50/10">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 font-bold text-sm text-slate-700 dark:text-slate-200 flex justify-between items-center">
                <span>Roster Shortage Watchlist</span>
                <span className="text-xs bg-rose-500/10 text-rose-600 dark:text-rose-450 px-2 py-0.5 rounded-full border border-rose-500/20 font-bold">
                  {shortageData.length} students flagged
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/10 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Roll No</th>
                      <th className="py-3.5 px-6">Student Name</th>
                      <th className="py-3.5 px-6 text-center">Conducted</th>
                      <th className="py-3.5 px-6 text-center text-emerald-500">Present</th>
                      <th className="py-3.5 px-6 text-center text-rose-500">Absent</th>
                      <th className="py-3.5 px-6 text-right">Ratios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shortageData.map((student) => (
                      <tr 
                        key={student.student_id}
                        className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors"
                      >
                        <td className="py-4 px-6 font-display font-semibold text-slate-500">
                          {student.register_no}
                        </td>
                        <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                          {student.student_name}
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-slate-500">
                          {student.conducted_hours} hrs
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-emerald-600 dark:text-emerald-400">
                          {student.present_hours} hrs
                        </td>
                        <td className="py-4 px-6 text-center font-bold text-rose-600 dark:text-rose-450">
                          {student.absent_hours} hrs
                        </td>
                        <td className="py-4 px-6 text-right font-display">
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                            student.attendance_percentage < 75
                              ? 'text-rose-600 border-rose-250 bg-rose-500/5'
                              : 'text-amber-600 border-amber-250 bg-amber-500/5'
                          }`}>
                            {student.attendance_percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default Reports;
