import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import AttendanceTable from '../../components/attendance/AttendanceTable';
import { useAuth } from '../../hooks/useAuth';
import timetableService from '../../services/timetableService';
import studentService from '../../services/studentService';
import attendanceService from '../../services/attendanceService';
import { formatDateString } from '../../utils/dateUtils';
import { Calendar, Clock, BookOpen, User, PlusCircle, ArrowLeft, CheckCircle } from 'lucide-react';

const MarkAttendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Step state
  const [step, setStep] = useState(1); // 1 = Initialize Session, 2 = Mark Students
  const [date, setDate] = useState(formatDateString(new Date()));
  const [selectedSlotIds, setSelectedSlotIds] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [remarks, setRemarks] = useState('');

  // Created session metadata
  const [sessionId, setSessionId] = useState('');
  const [createdSessionIds, setCreatedSessionIds] = useState([]);
  const [students, setStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Slots
  const slotsQuery = useQuery({
    queryKey: ['slots'],
    queryFn: timetableService.getSlots,
  });

  // 2. Fetch Subjects for the Class
  const subjectsQuery = useQuery({
    queryKey: ['subjects', user?.class_id],
    queryFn: () => studentService.getSubjectsByClass(user.class_id),
    enabled: !!user?.class_id,
  });

  // 3. Fetch Staff List
  const staffQuery = useQuery({
    queryKey: ['staff'],
    queryFn: studentService.getStaffList,
  });

  // 4. Fetch static timetable for auto-fill lookups
  const staticTimetableQuery = useQuery({
    queryKey: ['timetable', 'static'],
    queryFn: timetableService.getStaticTimetable,
    enabled: !!user,
  });

  const slots = slotsQuery.data || [];
  const subjects = subjectsQuery.data || [];
  const staffList = staffQuery.data || [];

  const isLoading = slotsQuery.isLoading || subjectsQuery.isLoading || staffQuery.isLoading || staticTimetableQuery.isLoading;

  // Auto-fill faculty/staff assigned to a subject
  const autoFillStaffForSubject = async (subjectId, plannedFacultyName = null) => {
    if (!subjectId) return;
    try {
      const staffAssignments = await studentService.getSubjectStaff(subjectId);
      if (staffAssignments && staffAssignments.length > 0) {
        // 1. Try to match the planned faculty name if provided
        if (plannedFacultyName) {
          const matchedStaff = staffList.find(st => 
            st.staff_name.toLowerCase().includes(plannedFacultyName.toLowerCase()) ||
            plannedFacultyName.toLowerCase().includes(st.staff_name.toLowerCase())
          );
          if (matchedStaff && staffAssignments.some(sa => sa.staff_id === matchedStaff.staff_id)) {
            setSelectedStaffId(matchedStaff.staff_id);
            return;
          }
        }

        // 2. Try to find who is marked as "is_incharge"
        const inCharge = staffAssignments.find(st => st.is_incharge);
        if (inCharge) {
          setSelectedStaffId(inCharge.staff_id);
        } else {
          // 3. Fallback to first assigned staff member
          setSelectedStaffId(staffAssignments[0].staff_id);
        }
      }
    } catch (err) {
      console.error("Failed to autofill staff for subject:", err);
    }
  };

  // Look up planned timetable entry and auto-fill subject & staff
  const autoFillFromTimetable = (selectedDate, slotId) => {
    if (!selectedDate || !slotId) return;

    const selectedSlotObj = slots.find(s => s.slot_id === slotId);
    if (!selectedSlotObj) return;

    const slotNo = selectedSlotObj.slot_no;

    // Get day of the week (1=Monday to 6=Saturday)
    const d = new Date(selectedDate);
    let dayOfWeek = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    if (dayOfWeek === 0) dayOfWeek = 7;

    const dayKey = String(dayOfWeek);
    const daySlots = staticTimetableQuery.data?.day_timetable?.[dayKey] || [];
    const timetableMatch = daySlots.find(t => t.slot_no === slotNo);

    if (timetableMatch) {
      // Find matching subject ID from subjects list
      const subjectMatch = subjects.find(s => 
        s.subject_code.toLowerCase() === timetableMatch.subject_code.toLowerCase() ||
        s.subject_name.toLowerCase() === timetableMatch.subject_name.toLowerCase()
      );
      if (subjectMatch) {
        setSelectedSubjectId(subjectMatch.subject_id);
        // Autofill staff based on subject mapping and planned faculty name
        autoFillStaffForSubject(subjectMatch.subject_id, timetableMatch.faculty_name);
      }
    }
  };

  const handleToggleSlot = (slotId) => {
    let newSlotIds;
    if (selectedSlotIds.includes(slotId)) {
      newSlotIds = selectedSlotIds.filter(id => id !== slotId);
    } else {
      newSlotIds = [...selectedSlotIds, slotId];
    }
    setSelectedSlotIds(newSlotIds);

    // Auto fill subject and staff based on the newly/first selected slot
    if (newSlotIds.length > 0) {
      autoFillFromTimetable(date, newSlotIds[0]);
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (selectedSlotIds.length > 0) {
      autoFillFromTimetable(newDate, selectedSlotIds[0]);
    }
  };

  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [hasAutoInitialized, setHasAutoInitialized] = useState(false);

  const triggerSessionInitialization = async (sessionDate, slotIds, subjectId, staffId) => {
    setErrorMessage('');
    setIsLoadingSession(true);
    try {
      const selectedSubject = subjects.find(s => s.subject_id === subjectId);
      const selectedStaff = staffList.find(s => s.staff_id === staffId);

      // Create attendance sessions for all selected slots in parallel
      const sessionPromises = slotIds.map(slotId => {
        const selectedSlot = slots.find(s => s.slot_id === slotId);
        return attendanceService.createSession({
          class_id: user.class_id,
          session_date: sessionDate,
          slot_id: slotId,
          subject_id: subjectId,
          staff_id: staffId,
          remarks,
          subject_name: selectedSubject?.subject_name,
          faculty_name: selectedStaff?.staff_name,
          slot_no: selectedSlot?.slot_no,
          student_count: 0
        });
      });

      const newSessions = await Promise.all(sessionPromises);
      
      const sessionIdsCreated = newSessions.map(s => s.session_id);
      setCreatedSessionIds(sessionIdsCreated);
      setSessionId(newSessions[0].session_id);

      // Fetch student list for this session (using the first created session ID)
      const classStudents = await attendanceService.getStudentsForSession(newSessions[0].session_id);
      setStudents(classStudents);
      setStep(2);
    } catch (e) {
      setErrorMessage(e.response?.data?.detail || 'An attendance session already exists for this class, date, and slot.');
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleInitializeSession = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    
    if (selectedSlotIds.length === 0 || !selectedSubjectId || !selectedStaffId) {
      setErrorMessage('Please select Date, Slot(s), Subject, and Faculty conducting the session.');
      return;
    }

    await triggerSessionInitialization(date, selectedSlotIds, selectedSubjectId, selectedStaffId);
  };

  // Handle prefilled state from navigation (e.g. from Dashboard)
  useEffect(() => {
    if (
      location.state && 
      slots.length > 0 && 
      subjects.length > 0 && 
      staffList.length > 0 &&
      !hasAutoInitialized
    ) {
      const { initialSlotNo, initialSubjectName, initialFacultyName, date: stateDate, autoInitialize } = location.state;
      
      let matchedDate = date;
      if (stateDate) {
        setDate(stateDate);
        matchedDate = stateDate;
      }
      
      let matchedSlotId = null;
      if (initialSlotNo) {
        const matchedSlot = slots.find(s => s.slot_no === initialSlotNo);
        if (matchedSlot) {
          setSelectedSlotIds([matchedSlot.slot_id]);
          matchedSlotId = matchedSlot.slot_id;
        }
      }
      
      let matchedSubjectId = null;
      if (initialSubjectName) {
        const matchedSubject = subjects.find(s => 
          s.subject_name.toLowerCase() === initialSubjectName.toLowerCase() ||
          s.subject_code.toLowerCase() === initialSubjectName.toLowerCase()
        );
        if (matchedSubject) {
          setSelectedSubjectId(matchedSubject.subject_id);
          matchedSubjectId = matchedSubject.subject_id;
        }
      }
      
      const initializeWithStaff = async (subId, staffName) => {
        let finalStaffId = null;
        if (staffName) {
          const matchedStaff = staffList.find(st => 
            st.staff_name.toLowerCase().includes(staffName.toLowerCase()) ||
            staffName.toLowerCase().includes(st.staff_name.toLowerCase())
          );
          if (matchedStaff) {
            finalStaffId = matchedStaff.staff_id;
          }
        }
        
        if (!finalStaffId && subId) {
          try {
            const staffAssignments = await studentService.getSubjectStaff(subId);
            if (staffAssignments && staffAssignments.length > 0) {
              const inCharge = staffAssignments.find(st => st.is_incharge);
              finalStaffId = inCharge ? inCharge.staff_id : staffAssignments[0].staff_id;
            }
          } catch (err) {
            console.error("Autofill staff failed: ", err);
          }
        }
        
        if (finalStaffId) {
          setSelectedStaffId(finalStaffId);
        }

        // If autoInitialize is true and we matched everything, trigger initialize
        if (autoInitialize && matchedDate && matchedSlotId && matchedSubjectId && finalStaffId) {
          setHasAutoInitialized(true);
          triggerSessionInitialization(matchedDate, [matchedSlotId], matchedSubjectId, finalStaffId);
        }
      };

      initializeWithStaff(matchedSubjectId, initialFacultyName);
      
      // Clear location state so it doesn't trigger again on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, slots, subjects, staffList, hasAutoInitialized]);

  const handleStudentStatusChange = (studentId, status, odReason) => {
    setStudents(prev => prev.map(s => {
      if (s.student_id === studentId) {
        return { ...s, status, od_reason: odReason };
      }
      return s;
    }));
  };

  const handleMarkAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'P', od_reason: null })));
  };

  const handleReset = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'P', od_reason: null })));
  };

  const handleSubmitAttendance = async () => {
    setSubmitting(true);
    setErrorMessage('');

    // Check if any student marked as OD is missing a reason
    const missingODReason = students.some(s => s.status === 'OD' && (!s.od_reason || s.od_reason.trim() === ''));
    if (missingODReason) {
      setErrorMessage('Please provide an On Duty (OD) reason for all students marked as OD.');
      setSubmitting(false);
      return;
    }

    try {
      const absentees = students.filter(s => s.status === 'A').map(s => s.student_id);
      const od_students = students
        .filter(s => s.status === 'OD')
        .map(s => ({ student_id: s.student_id, od_reason: s.od_reason }));

      // Submit attendance for all sessions in parallel
      await Promise.all(createdSessionIds.map(sessId => 
        attendanceService.markAttendance({
          session_id: sessId,
          absentees,
          od_students
        })
      ));

      navigate('/rep/sessions');
    } catch (e) {
      setErrorMessage(e.response?.data?.detail || 'Failed to submit attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loader message="Loading attendance resources..." size="large" />;
  }

  return (
    <div className="space-y-6">
      
      <div>
        {step === 2 && (
          <button
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Configuration
          </button>
        )}
        <PageHeader 
          title="Mark Attendance"
          description={
            step === 1 
              ? "Initialize an attendance session by selecting the date, slot, subject conducted, and faculty."
              : "Mark each student as Present, Absent, or on On Duty (OD) for the class session."
          }
        />
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center max-w-2xl mx-auto">
          {errorMessage}
        </div>
      )}

      {/* Stage 1: Setup Details */}
      {step === 1 && (
        <form onSubmit={handleInitializeSession} className="max-w-2xl mx-auto glass-panel border rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Session Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary text-slate-800 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            {/* Slot Selection (Multi-select pills) */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Select Class Slot(s) <span className="text-[10px] text-slate-450 dark:text-slate-450 lowercase normal-case">(Select multiple for labs/double periods)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map(s => {
                  const isSelected = selectedSlotIds.includes(s.slot_id);
                  return (
                    <button
                      key={s.slot_id}
                      type="button"
                      onClick={() => handleToggleSlot(s.slot_id)}
                      className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all font-medium text-xs gap-1.5 cursor-pointer hover:scale-[1.01] ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/10'
                          : 'bg-slate-100/50 hover:bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-extrabold">Slot {s.slot_no}</span>
                      <span className="opacity-80 text-[10px] font-bold">{s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Selection (Substitution Override Support) */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Conducted Subject
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedSubjectId}
                  onChange={(e) => {
                    const newSubId = e.target.value;
                    setSelectedSubjectId(newSubId);
                    autoFillStaffForSubject(newSubId);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary appearance-none text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Select Subject</option>
                  {subjects.map(sub => (
                    <option key={sub.subject_id} value={sub.subject_id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {sub.subject_code} - {sub.subject_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conducting Staff Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Conducting Faculty
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary appearance-none text-slate-800 dark:text-slate-200"
                  required
                >
                  <option value="" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Select Staff</option>
                  {staffList.map(st => (
                    <option key={st.staff_id} value={st.staff_id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                      {st.staff_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              Session Remarks (Optional)
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Conducted substitution lecture for Computer Networks, Lab session, etc."
              rows={3}
              className="w-full px-4 py-2.5 text-sm bg-slate-100/50 hover:bg-slate-100 focus:bg-white dark:focus:bg-slate-800 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:border-brand-primary resize-none text-slate-800 dark:text-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-indigo-500/25 transition-all flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
            disabled={isLoadingSession}
          >
            {isLoadingSession ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Initializing Session...
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Initialize Attendance Session Roster
              </>
            )}
          </button>
        </form>
      )}

      {/* Stage 2: Roster Marking */}
      {step === 2 && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Quick info cards */}
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400 mb-0.5">Subject</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                {subjects.find(s=>s.subject_id === selectedSubjectId)?.subject_name}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400 mb-0.5">Faculty</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                {staffList.find(st=>st.staff_id === selectedStaffId)?.staff_name}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400 mb-0.5">Date & Slot</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">
                {date} (Slot {selectedSlotIds.map(id => slots.find(s => s.slot_id === id)?.slot_no).sort((a,b) => a-b).join(', ')})
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider block text-slate-400 mb-0.5">Roster Status</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-450 block">
                Active Session
              </span>
            </div>
          </div>

          <AttendanceTable 
            students={students}
            mode="mark"
            onChange={handleStudentStatusChange}
            onMarkAllPresent={handleMarkAllPresent}
            onReset={handleReset}
          />

          <div className="flex gap-4 justify-end pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-350"
              disabled={submitting}
            >
              Back to Configuration
            </button>
            <button
              onClick={handleSubmitAttendance}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Submitting Records...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Submit Attendance Records
                </>
              )}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default MarkAttendance;
