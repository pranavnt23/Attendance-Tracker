import apiClient from './axios';

const studentService = {
  getProfile: async () => {
    const response = await apiClient.get('/api/student/profile');
    return response.data;
  },

  getRepStudentSubjectWise: async (studentId) => {
    const response = await apiClient.get(`/api/rep/students/${studentId}/attendance/subject-wise`);
    return response.data;
  },

  getRepStudentHistory: async (studentId) => {
    const response = await apiClient.get(`/api/rep/students/${studentId}/attendance/history`);
    return response.data;
  },

  getSubjectWiseAttendance: async () => {
    const response = await apiClient.get('/api/student/attendance/subject-wise');
    return response.data;
  },

  getAttendanceHistory: async () => {
    const response = await apiClient.get('/api/student/attendance/history');
    return response.data;
  },

  getSubjectDetails: async (subjectId) => {
    const response = await apiClient.get(`/api/student/subjects/${subjectId}`);
    return response.data;
  },

  getClassStudents: async (classId) => {
    const response = await apiClient.get(`/api/classes/${classId}/students`);
    return response.data;
  },

  getStudentById: async (studentId) => {
    const response = await apiClient.get(`/api/students/${studentId}`);
    return response.data;
  },

  getSubjectsByClass: async (classId) => {
    const response = await apiClient.get(`/api/classes/${classId}/subjects`);
    return response.data;
  },

  getStaffList: async () => {
    const response = await apiClient.get('/api/staff');
    return response.data;
  },

  getSubjectStaff: async (subjectId) => {
    const response = await apiClient.get(`/api/subjects/${subjectId}/staff`);
    return response.data;
  },

  getLastUpdatedDate: async () => {
    const response = await apiClient.get('/api/student/attendance/last-updated');
    return response.data;
  },

  createStudent: async (studentData) => {
    const response = await apiClient.post('/api/students', studentData);
    return response.data;
  },

  bulkRegisterStudents: async (studentsList) => {
    const response = await apiClient.post('/api/students/bulk', studentsList);
    return response.data;
  },

  updateStudentRole: async (studentId, newRole) => {
    const response = await apiClient.patch(`/api/students/${studentId}/role`, { role: newRole });
    return response.data;
  },

  deleteStudent: async (studentId) => {
    const response = await apiClient.delete(`/api/students/${studentId}`);
    return response.data;
  },

  createStaff: async (staffData) => {
    const response = await apiClient.post('/api/staff', staffData);
    return response.data;
  },

  updateStaff: async (staffId, staffData) => {
    const response = await apiClient.put(`/api/staff/${staffId}`, staffData);
    return response.data;
  },

  deleteStaff: async (staffId) => {
    const response = await apiClient.delete(`/api/staff/${staffId}`);
    return response.data;
  },
};

export default studentService;
