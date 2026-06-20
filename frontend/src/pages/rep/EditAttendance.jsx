import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import attendanceService from '../../services/attendanceService';
import studentService from '../../services/studentService';
import { ArrowLeft, CheckCircle, RotateCcw, HelpCircle, Save } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const EditAttendance = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Local state for modified values
  const [remarks, setRemarks] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [updatedStudents, setUpdatedStudents] = useState([]);
  const [originalStudents, setOriginalStudents] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Session Roster Logs
  const rosterQuery = useQuery({
    queryKey: ['session', 'roster', sessionId],
    queryFn: () => attendanceService.viewAttendance(sessionId),
    enabled: !!sessionId,
  });

  // 2. Fetch Session Planned vs Conducted Audits
  const auditQuery = useQuery({
    queryKey: ['session', 'audit', sessionId],
    queryFn: () => attendanceService.getSessionDetails(sessionId),
    enabled: !!sessionId,
  });

  // 3. Fetch Subjects list
  const subjectsQuery = useQuery({
    queryKey: ['subjects', user?.class_id],
    queryFn: () => studentService.getSubjectsByClass(user.class_id),
    enabled: !!user?.class_id,
  });

  const slotsStudentsQuery = useQuery({
    queryKey: ['session', 'students-full-list', sessionId],
    queryFn: () => attendanceService.getStudentsForSession(sessionId),
    enabled: !!sessionId
  });

  // Sync state once data loaded
  useEffect(() => {
    if (rosterQuery.data && slotsStudentsQuery.data) {
      // Map roster data to list with proper student IDs
      const rosterList = rosterQuery.data.attendance;
      const fullClassList = slotsStudentsQuery.data;

      // Map by name (roster returns student_name and status) to resolve student_id
      const mapped = fullClassList.map(s => {
        const match = rosterList.find(r => r.student_name.toLowerCase() === s.student_name.toLowerCase());
        return {
          student_id: s.student_id,
          register_no: s.register_no,
          student_name: s.student_name,
          status: match ? match.status : 'P',
          od_reason: match ? match.od_reason : null
        };
      });

      setUpdatedStudents(JSON.parse(JSON.stringify(mapped)));
      setOriginalStudents(JSON.parse(JSON.stringify(mapped)));
    }
  }, [rosterQuery.data, slotsStudentsQuery.data]);

  useEffect(() => {
    if (auditQuery.data) {
      setRemarks(auditQuery.data.remarks || '');
      // Try to find matching subject ID based on conducted subject name
      if (subjectsQuery.data) {
        const subMatch = subjectsQuery.data.find(s => s.subject_name.toLowerCase() === auditQuery.data.conducted_subject.toLowerCase());
        if (subMatch) {
          setSelectedSubjectId(subMatch.subject_id);
        }
      }
    }
  }, [auditQuery.data, subjectsQuery.data]);

  const isLoading = rosterQuery.isLoading || auditQuery.isLoading || subjectsQuery.isLoading || slotsStudentsQuery.isLoading;

  const handleStudentChange = (studentId, status, odReason) => {
    setUpdatedStudents(prev => prev.map(s => {
      if (s.student_id === studentId) {
        return { ...s, status, od_reason: odReason };
      }
      return s;
    }));
  };

  const handleReset = () => {
    setUpdatedStudents(JSON.parse(JSON.stringify(originalStudents)));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSaving(true);

    // Validate OD reasons
    const missingODReason = updatedStudents.some(s => s.status === 'OD' && (!s.od_reason || s.od_reason.trim() === ''));
    if (missingODReason) {
      setErrorMessage('Please provide an Official Duty (OD) reason for all students marked as OD.');
      setIsSaving(false);
      return;
    }

    try {
      // 1. Update session subject details if changed
      const originalSubject = subjectsQuery.data?.find(s => s.subject_name.toLowerCase() === auditQuery.data.conducted_subject.toLowerCase());
      if (selectedSubjectId !== originalSubject?.subject_id || remarks !== auditQuery.data.remarks) {
        await attendanceService.substituteSubject(sessionId, {
          subject_id: selectedSubjectId,
          remarks: remarks
        });
      }

      // 2. Update students roster statuses
      const updatesPayload = updatedStudents.map(s => ({
        student_id: s.student_id,
        status: s.status,
        od_reason: s.status === 'OD' ? s.od_reason : null
      }));

      await attendanceService.editAttendance(sessionId, updatesPayload);

      // Invalidate queries & redirect
      queryClient.invalidateQueries({ queryKey: ['session', 'roster', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['session', 'audit', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      navigate(`/rep/sessions/${sessionId}`);
    } catch (e) {
      setErrorMessage(e.response?.data?.detail || 'Failed to update attendance records. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Self-heal cache: if session is not found in DB, clear it from local cache
  useEffect(() => {
    if (rosterQuery.isError && sessionId) {
      try {
        const localSessions = JSON.parse(localStorage.getItem('cached_sessions') || '[]');
        const filtered = localSessions.filter(s => s.session_id !== sessionId);
        localStorage.setItem('cached_sessions', JSON.stringify(filtered));
      } catch (e) {
        console.error("Error clearing stale session from cache:", e);
      }
    }
  }, [rosterQuery.isError, sessionId]);

  if (rosterQuery.isError || (!isLoading && !rosterQuery.data)) {
    return (
      <div className="glass-panel border rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto mt-12 animate-fade-in">
        <p className="text-slate-500 font-semibold text-sm">Session records could not be found.</p>
        <Link to="/rep/sessions" className="text-xs font-extrabold text-indigo-650 hover:underline">
          Go back to Session list
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return <Loader message="Fetching session details for editing..." size="large" />;
  }

  const subjects = subjectsQuery.data || [];

  return (
    <div className="space-y-6">
      
      <div>
        <Link 
          to={`/rep/sessions/${sessionId}`} 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Session Details
        </Link>
        <PageHeader 
          title="Edit Attendance"
          description="Update conducted subject, session remarks, or individual student attendance logs."
        />
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center max-w-2xl mx-auto">
          {errorMessage}
        </div>
      )}

      {/* Editor panels */}
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
        
        {/* Subject conducted / Remarks details */}
        <div className="glass-panel border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Class Configuration Settings
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                Conducted Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-200"
                required
              >
                {subjects.map(s => (
                  <option key={s.subject_id} value={s.subject_id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {s.subject_code} - {s.subject_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider mb-2">
                Conducted remarks
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Substitution details, remarks..."
                className="w-full px-3 py-2 text-sm bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Comparison & edit grid */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white">
              Student Status Roster
            </h3>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Changes
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Split panels to show Original vs Updated */}
            <div className="glass-panel border rounded-3xl shadow-sm overflow-hidden bg-slate-50/10">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-6">Roll No</th>
                      <th className="py-3.5 px-6">Student Name</th>
                      <th className="py-3.5 px-6 text-center w-36">Original Status</th>
                      <th className="py-3.5 px-6 text-center w-60">Updated Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updatedStudents.map((student) => {
                      const orig = originalStudents.find(o => o.student_id === student.student_id) || { status: 'P' };
                      const hasChanged = student.status !== orig.status || student.od_reason !== orig.od_reason;

                      return (
                        <tr 
                          key={student.student_id}
                          className={`border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/20 transition-colors ${
                            hasChanged ? 'bg-indigo-500/[0.02]' : ''
                          }`}
                        >
                          <td className="py-4 px-6 font-display font-semibold text-slate-500">
                            {student.register_no}
                          </td>
                          <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                            {student.student_name}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="text-xs font-bold text-slate-400">
                              {orig.status} {orig.status === 'OD' && `(${orig.od_reason?.substring(0, 10)})`}
                            </span>
                          </td>
                          <td className="py-3 px-6">
                            <div className="flex flex-col gap-2 max-w-xs mx-auto">
                              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-100/50 dark:bg-slate-800/40">
                                <button
                                  type="button"
                                  onClick={() => handleStudentChange(student.student_id, 'P', null)}
                                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                                    student.status === 'P'
                                      ? 'bg-emerald-500 text-white shadow-sm'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  P
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStudentChange(student.student_id, 'A', null)}
                                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                                    student.status === 'A'
                                      ? 'bg-rose-500 text-white shadow-sm'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  A
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStudentChange(student.student_id, 'OD', student.od_reason || 'Official Duty')}
                                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                                    student.status === 'OD'
                                      ? 'bg-amber-500 text-white shadow-sm'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  OD
                                </button>
                              </div>
                              {student.status === 'OD' && (
                                <input
                                  type="text"
                                  placeholder="OD Reason (required)"
                                  value={student.od_reason || ''}
                                  onChange={(e) => handleStudentChange(student.student_id, 'OD', e.target.value)}
                                  className="px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-700 focus:outline-none text-slate-700 dark:text-slate-350"
                                  required
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Submit action */}
        <div className="flex gap-4 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate(`/rep/sessions/${sessionId}`)}
            className="px-6 py-2.5 rounded-xl border border-slate-205 dark:border-slate-850 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Attendance Records
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditAttendance;
