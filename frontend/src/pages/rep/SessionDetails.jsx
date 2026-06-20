import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import StatCard from '../../components/cards/StatCard';
import attendanceService from '../../services/attendanceService';
import { ArrowLeft, Edit2, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatReadableDate } from '../../utils/dateUtils';
import { calculatePercentage } from '../../utils/attendanceUtils';

const SessionDetails = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

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

  const isLoading = rosterQuery.isLoading || auditQuery.isLoading;

  if (isLoading) {
    return <Loader message="Retrieving session logs..." size="large" />;
  }

  // Self-heal cache: if session is not found in DB, clear it from local cache
  React.useEffect(() => {
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

  if (rosterQuery.isError || !rosterQuery.data) {
    return (
      <div className="glass-panel border rounded-3xl p-8 text-center space-y-4 max-w-xl mx-auto">
        <p className="text-slate-500 font-semibold">Session records could not be found.</p>
        <Link to="/rep/sessions" className="text-sm font-bold text-indigo-600 hover:underline">
          Go back to Session list
        </Link>
      </div>
    );
  }

  const roster = rosterQuery.data;
  const audit = auditQuery.data || {
    planned_subject: 'Planned Subject',
    conducted_subject: roster.subject_name,
    remarks: 'Conducted session details'
  };

  // Compile calculations
  const total = roster.attendance.length;
  const present = roster.attendance.filter(r => r.status === 'P').length;
  const absent = roster.attendance.filter(r => r.status === 'A').length;
  const od = roster.attendance.filter(r => r.status === 'OD').length;
  const percentage = calculatePercentage(present, total);

  return (
    <div className="space-y-6">
      <div>
        <Link 
          to="/rep/sessions" 
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Link>
        <PageHeader 
          title="Session Details"
          description="View conducted subjects, class remarks, and recorded student attendance rosters."
          actions={
            <button
              onClick={() => navigate(`/rep/edit-attendance/${sessionId}`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-indigo-650 hover:bg-indigo-700 hover:shadow-indigo-500/20 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit Records
            </button>
          }
        />
      </div>

      {/* Main Info Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Planned vs Conducted Substitution Audit Card */}
        <div className="glass-panel border rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2">
            Class Audit Details
          </h3>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Date</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {formatReadableDate(roster.session_date)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Slot Number</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Slot {roster.slot_no}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Planned Subject</span>
                <span className="text-sm font-semibold text-slate-500 italic">
                  {audit.planned_subject}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Conducted Subject</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {audit.conducted_subject}
                </span>
              </div>
            </div>

            {audit.remarks && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-850">
                <span className="font-bold block mb-1">Session Remarks</span>
                {audit.remarks}
              </div>
            )}
          </div>
        </div>

        {/* stats cards grid right */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <StatCard 
            title="Conducted Strength"
            value={`${total} Students`}
            color="indigo"
            icon={CheckCircle}
            subtext="Class total enrolled count"
          />
          <StatCard 
            title="Present Count"
            value={`${present} Pupils`}
            color="emerald"
            icon={CheckCircle}
            subtext="Attended class"
          />
          <StatCard 
            title="Absent Count"
            value={`${absent} Pupils`}
            color="rose"
            icon={XCircle}
            subtext="Unexcused absences"
          />
          <StatCard 
            title="Official Duty (OD)"
            value={`${od} Pupils`}
            color="amber"
            icon={Calendar}
            subtext="Authorized duty count"
          />
          
          {/* Large overall percentage callout */}
          <div className="col-span-2 p-5 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-primary/20 rounded-3xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-450 font-semibold uppercase tracking-wider block">Average Lecture Attendance</span>
              <p className="text-xs text-slate-400 mt-1">Present hours divided by conducted hours</p>
            </div>
            <span className="text-3xl font-display font-extrabold text-brand-primary">
              {percentage}%
            </span>
          </div>
        </div>

      </div>

      {/* Roster list table */}
      <div className="space-y-4">
        <h3 className="text-lg font-display font-extrabold text-slate-800 dark:text-white">
          Class Roster Details
        </h3>
        
        <AttendanceTable 
          students={roster.attendance.map((r, i) => ({
            student_id: i.toString(), // placeholder student_id
            register_no: `Roll ${i+1}`, // wait, backend returns student_name and status, let's map it:
            student_name: r.student_name,
            status: r.status,
            od_reason: r.od_reason
          }))}
          mode="view"
        />
      </div>

    </div>
  );
};

export default SessionDetails;
