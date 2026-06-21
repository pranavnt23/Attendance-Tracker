import apiClient from './axios';

const attendanceService = {
  createSession: async (sessionData) => {
    // Create session via backend
    const response = await apiClient.post('/api/attendance/session', {
      class_id: sessionData.class_id,
      session_date: sessionData.session_date,
      slot_id: sessionData.slot_id,
      subject_id: sessionData.subject_id,
      staff_id: sessionData.staff_id,
      remarks: sessionData.remarks || '',
    });
    
    return response.data;
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

  deleteSession: async (sessionId) => {
    const response = await apiClient.delete(`/api/attendance/session/${sessionId}`);
    return response.data;
  },

  // Retrieval and filters for sessions from backend
  getSessionsList: async (filters = {}) => {
    let list = [];
    try {
      const response = await apiClient.get('/api/attendance/sessions');
      list = response.data;
    } catch (e) {
      console.error("Error reading session list from backend:", e);
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
