import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import attendanceService from '../../services/attendanceService';
import studentService from '../../services/studentService';
import timetableService from '../../services/timetableService';
import { formatDateString } from '../../utils/dateUtils';
import { 
  Users, 
  ListCollapse, 
  Search, 
  BarChart3, 
  PlusCircle, 
  ClipboardCheck, 
  History,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const todayStr = formatDateString(new Date());

  // Fetch class students list
  const studentsQuery = useQuery({
    queryKey: ['students', 'class', user?.class_id],
    queryFn: () => studentService.getClassStudents(user.class_id),
    enabled: !!user?.class_id,
  });

  // Fetch session list count
  const sessionsQuery = useQuery({
    queryKey: ['sessions', 'list'],
    queryFn: () => attendanceService.getSessionsList(),
  });

  // Fetch today's classes
  const todayClassesQuery = useQuery({
    queryKey: ['timetable', 'actual', todayStr],
    queryFn: () => timetableService.getActualTimetable(todayStr),
  });

  const isLoading = studentsQuery.isLoading || sessionsQuery.isLoading || todayClassesQuery.isLoading;

  if (isLoading) {
    return <Loader message="Loading representative overview..." size="large" />;
  }

  const students = studentsQuery.data || [];
  const sessions = sessionsQuery.data || [];
  const todayClasses = todayClassesQuery.data || [];

  // Filter today's logged sessions
  const todaySessions = sessions.filter(s => s.date === todayStr);

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      <PageHeader
        title="Representative Dashboard"
        description="Oversee student logs, compile shortage details, and log conducted class hours."
      />

      {/* Responsive Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Stats & details (takes 2 cols on lg screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Hero Action Card */}
          <Card 
            className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/20 border border-indigo-500/10 dark:border-slate-800 shadow-sm"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">
                    Daily Duty Tracker
                  </span>
                </div>
                <h3 className="text-xl font-display font-extrabold text-slate-955 dark:text-white">
                  Log Attendance Sessions
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
                  Ensure all lecture hours are recorded. Today, you have logged <strong className="font-bold text-indigo-650 dark:text-indigo-400">{todaySessions.length} session{todaySessions.length !== 1 ? 's' : ''}</strong> for your class.
                </p>
              </div>

              <Button
                onClick={() => navigate('/rep/mark')}
                variant="primary"
                leftIcon={PlusCircle}
                className="w-full md:w-auto text-xs shrink-0"
              >
                Mark Attendance Slot
              </Button>
            </div>
          </Card>

          {/* Primary Statistics cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Class Strength Card */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Class Strength
                  </span>
                  <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
                    {students.length} Students
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold block mt-1.5">
                    Enrolled class size roster
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/10">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </Card>

            {/* Sessions Logged Card */}
            <Card className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Total Recorded Logs
                  </span>
                  <p className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
                    {sessions.length} Lectures
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-500 font-semibold block mt-1.5">
                    Conducted hours logged to database
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/10">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
              </div>
            </Card>

          </div>

          {/* Quick Administrative Actions List */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Shortcut Tools
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Student Lookup */}
              <Link
                to="/rep/lookup"
                className="no-underline group"
              >
                <Card 
                  interactive
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 hover:border-indigo-500/40 dark:border-slate-800 dark:hover:border-indigo-450 h-full p-5"
                >
                  <div className="flex flex-col gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 w-fit border border-indigo-500/10 group-hover:scale-105 transition-transform">
                      <Search className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-slate-950 dark:text-white group-hover:text-indigo-600 transition-colors">
                        Student Lookup
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Search class lists and view detailed records.
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Sessions List */}
              <Link
                to="/rep/sessions"
                className="no-underline group"
              >
                <Card 
                  interactive
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 hover:border-indigo-500/40 dark:border-slate-800 dark:hover:border-indigo-455 h-full p-5"
                >
                  <div className="flex flex-col gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 w-fit border border-indigo-500/10 group-hover:scale-105 transition-transform">
                      <History className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-slate-955 dark:text-white group-hover:text-indigo-600 transition-colors">
                        Edit Sessions
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Review sessions and update attendance marks.
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

              {/* Reports */}
              <Link
                to="/rep/reports"
                className="no-underline group"
              >
                <Card 
                  interactive
                  className="bg-white dark:bg-slate-900 border border-slate-200/60 hover:border-indigo-500/40 dark:border-slate-800 dark:hover:border-indigo-455 h-full p-5"
                >
                  <div className="flex flex-col gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 w-fit border border-indigo-500/10 group-hover:scale-105 transition-transform">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-xs text-slate-955 dark:text-white group-hover:text-indigo-600 transition-colors">
                        Reports & Shortages
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        Compile records and list shortage warnings.
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>

            </div>
          </div>

        </div>

        {/* Right Column: Today's Classes */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-550 dark:text-indigo-400" />
            Today's Classes
          </h3>

          {todayClasses.length === 0 ? (
            <div className="glass-panel border rounded-3xl p-6 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
              No classes scheduled for today.
            </div>
          ) : (
            <div className="space-y-3">
              {todayClasses.map((slot) => {
                const isMarked = slot.attendance_status !== 'NOT_MARKED';
                return (
                  <div
                    key={slot.slot_no}
                    className={`glass-panel border rounded-2xl p-4 flex flex-col gap-3 shadow-sm transition-all duration-300 ${
                      isMarked
                        ? 'border-emerald-500/20 bg-emerald-500/[0.01]'
                        : 'border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-900/5'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex gap-3">
                        {/* Slot Badge */}
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-805 text-slate-700 dark:text-slate-300 flex flex-col items-center justify-center shrink-0 border border-slate-200/50 dark:border-slate-700/50 font-display">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 leading-none">Slot</span>
                          <span className="text-sm font-bold leading-none mt-0.5">{slot.slot_no}</span>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {slot.subject_name || 'No Subject'}
                          </h4>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)} | {slot.faculty || 'TBD'}
                          </p>
                        </div>
                      </div>

                      <div>
                        {isMarked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450">
                            Marked
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                            Unmarked
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-850/50 pt-2.5 mt-0.5">
                      {isMarked ? (
                        <>
                          <Link
                            to={`/rep/sessions/${slot.session_id}`}
                            className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200 transition-colors no-underline"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/rep/edit-attendance/${slot.session_id}`}
                            className="px-2.5 py-1 text-[10px] font-bold bg-indigo-500/10 text-indigo-650 hover:bg-indigo-550/20 dark:text-indigo-400 dark:bg-indigo-500/5 rounded-lg transition-all no-underline"
                          >
                            Edit Records
                          </Link>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            navigate('/rep/mark', {
                              state: {
                                date: todayStr,
                                initialSlotNo: slot.slot_no,
                                initialSubjectName: slot.subject_name,
                                initialFacultyName: slot.faculty,
                                autoInitialize: true,
                              },
                            })
                          }
                          className="px-3 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all flex items-center gap-1 cursor-pointer border-0 shadow-sm"
                        >
                          <PlusCircle className="w-3 h-3" />
                          Mark Attendance
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;