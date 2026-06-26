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
};

export default studentService;
