import apiClient from './axios';

const reportService = {
  getClassAttendanceReport: async (classId) => {
    const response = await apiClient.get(`/api/reports/class-attendance/${classId}`);
    return response.data;
  },

  getSubjectAttendanceReport: async (subjectId) => {
    const response = await apiClient.get(`/api/reports/subject-attendance/${subjectId}`);
    return response.data;
  },

  getShortageReport: async (classId, threshold = 75.0) => {
    const response = await apiClient.get(`/api/reports/shortage/${classId}`, {
      params: { threshold }
    });
    return response.data;
  }
};

export default reportService;
