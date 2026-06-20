import apiClient from './axios';

const attendanceService = {
  createSession: async (sessionData) => {
    // 1. Create session via backend
    const response = await apiClient.post('/api/attendance/session', {
      class_id: sessionData.class_id,
      session_date: sessionData.session_date,
      slot_id: sessionData.slot_id,
      subject_id: sessionData.subject_id,
      staff_id: sessionData.staff_id,
      remarks: sessionData.remarks || '',
    });
    
    const newSession = response.data;

    // 2. Cache in localStorage to enable "Session List" feature since there is no backend list endpoint
    try {
      const localSessions = JSON.parse(localStorage.getItem('cached_sessions') || '[]');
      
      // Prevent duplicates in cache
      const exists = localSessions.some(s => s.session_id === newSession.session_id);
      if (!exists) {
        // Enriched metadata for rendering card details
        const enrichedSession = {
          ...newSession,
          subject_name: sessionData.subject_name || 'Conducted Subject',
          faculty_name: sessionData.faculty_name || 'Faculty Member',
          slot_no: sessionData.slot_no || 1,
          attendance_count: sessionData.student_count || 0
        };
        localSessions.unshift(enrichedSession); // Add to beginning
        localStorage.setItem('cached_sessions', JSON.stringify(localSessions));
      }
    } catch (e) {
      console.error("Error updating local session cache:", e);
    }

    return newSession;
  },

  getStudentsForSession: async (sessionId) => {
    const response = await apiClient.get(`/api/attendance/session/${sessionId}/students`);
    return response.data;
  },

  markAttendance: async ({ session_id, absentees, od_students }) => {
    const response = await apiClient.post('/api/attendance/mark', {
      session_id,
      absentees,
      od_students,
    });
    
    // Update local cache count
    try {
      const localSessions = JSON.parse(localStorage.getItem('cached_sessions') || '[]');
      const sessionIndex = localSessions.findIndex(s => s.session_id === session_id);
      if (sessionIndex !== -1) {
        // Fetch total student count for session
        const studentsResp = await apiClient.get(`/api/attendance/session/${session_id}/students`);
        const total = studentsResp.data.length;
        const presentCount = total - absentees.length - od_students.length;
        
        localSessions[sessionIndex].attendance_count = presentCount;
        localStorage.setItem('cached_sessions', JSON.stringify(localSessions));
      }
    } catch (e) {
      console.error("Error updating cache attendance count:", e);
    }

    return response.data;
  },

  viewAttendance: async (sessionId) => {
    const response = await apiClient.get(`/api/attendance/session/${sessionId}`);
    return response.data;
  },

  editAttendance: async (sessionId, updates) => {
    const response = await apiClient.put(`/api/attendance/session/${sessionId}`, updates);
    return response.data;
  },

  substituteSubject: async (sessionId, { subject_id, remarks }) => {
    const response = await apiClient.patch(`/api/attendance/session/${sessionId}/subject`, {
      subject_id,
      remarks,
    });
    return response.data;
  },

  getSessionDetails: async (sessionId) => {
    const response = await apiClient.get(`/api/attendance/session/${sessionId}/details`);
    return response.data;
  },

  deleteSessionFromCache: async (sessionId) => {
    try {
      const localSessions = JSON.parse(localStorage.getItem('cached_sessions') || '[]');
      const filtered = localSessions.filter(s => s.session_id !== sessionId);
      localStorage.setItem('cached_sessions', JSON.stringify(filtered));
      return true;
    } catch (e) {
      console.error("Error deleting session from cache:", e);
      return false;
    }
  },

  // Client side retrieval and filters for sessions
  getSessionsList: async (filters = {}) => {
    // Return cached sessions list sorted by date desc
    let list = [];
    try {
      // One-time cache migration to purge old test sessions
      if (!localStorage.getItem('cache_cleaned_v2')) {
        localStorage.removeItem('cached_sessions');
        localStorage.setItem('cache_cleaned_v2', 'true');
      }
      
      list = JSON.parse(localStorage.getItem('cached_sessions') || '[]');
      
      // Purge static mock data from local cache if present
      const mockIds = [
        'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        'f6e5d4c3-b2a1-0f9e-8d7c-6b5a4f3e2d1c',
        '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d'
      ];
      const filtered = list.filter(s => !mockIds.includes(s.session_id));
      if (filtered.length !== list.length) {
        list = filtered;
        localStorage.setItem('cached_sessions', JSON.stringify(list));
      }
    } catch (e) {
      console.error("Error reading session cache:", e);
    }

    // Filter logic
    if (filters.date) {
      list = list.filter(s => {
        if (!s.session_date) return false;
        const sDateStr = String(s.session_date).split('T')[0];
        const fDateStr = String(filters.date).split('T')[0];
        return sDateStr === fDateStr;
      });
    }
    if (filters.subject) {
      list = list.filter(s => s.subject_name.toLowerCase().includes(filters.subject.toLowerCase()) || (s.subject_code && s.subject_code.toLowerCase().includes(filters.subject.toLowerCase())));
    }
    if (filters.faculty) {
      list = list.filter(s => s.faculty_name.toLowerCase().includes(filters.faculty.toLowerCase()));
    }
    if (filters.slot) {
      list = list.filter(s => s.slot_no === parseInt(filters.slot));
    }

    return list;
  }
};

export default attendanceService;
