import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import studentService from '../services/studentService';
import attendanceService from '../services/attendanceService';
import timetableService from '../services/timetableService';

export const useAttendance = (options = {}) => {
  const queryClient = useQueryClient();


  // Subject-wise attendance query
  const useSubjectWiseStats = (enabled = true) => useQuery({
    queryKey: ['attendance', 'subject-wise'],
    queryFn: studentService.getSubjectWiseAttendance,
    enabled,
  });

  // Attendance history query
  const useHistory = (enabled = true) => useQuery({
    queryKey: ['attendance', 'history'],
    queryFn: studentService.getAttendanceHistory,
    enabled,
  });

  // Actual daily timetable
  const useActualTimetable = (dateStr, enabled = true) => useQuery({
    queryKey: ['timetable', 'actual', dateStr],
    queryFn: () => timetableService.getActualTimetable(dateStr),
    enabled: enabled && !!dateStr,
  });

  // Static timetable
  const useStaticTimetable = (enabled = true) => useQuery({
    queryKey: ['timetable', 'static'],
    queryFn: timetableService.getStaticTimetable,
    enabled,
  });

  // Mark attendance mutation
  const markAttendanceMutation = useMutation({
    mutationFn: attendanceService.markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    }
  });

  // Edit attendance mutation
  const editAttendanceMutation = useMutation({
    mutationFn: ({ sessionId, updates }) => attendanceService.editAttendance(sessionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    }
  });

  // Substitute subject mutation
  const substituteSubjectMutation = useMutation({
    mutationFn: ({ sessionId, subject_id, remarks }) => 
      attendanceService.substituteSubject(sessionId, { subject_id, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
    }
  });

  return {
    useSubjectWiseStats,
    useHistory,
    useActualTimetable,
    useStaticTimetable,
    markAttendance: markAttendanceMutation.mutateAsync,
    isMarking: markAttendanceMutation.isPending,
    editAttendance: editAttendanceMutation.mutateAsync,
    isEditing: editAttendanceMutation.isPending,
    substituteSubject: substituteSubjectMutation.mutateAsync,
    isSubstituting: substituteSubjectMutation.isPending
  };
};
