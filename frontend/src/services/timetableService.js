import apiClient from './axios';

const timetableService = {
  getStaticTimetable: async () => {
    const response = await apiClient.get('/api/student/timetable/static');
    return response.data;
  },

  getActualTimetable: async (dateStr) => {
    const response = await apiClient.get(`/api/student/timetable/actual`, {
      params: { date: dateStr }
    });
    return response.data;
  },

  getSlots: async () => {
    const response = await apiClient.get('/api/slots');
    return response.data;
  },

  getClassTimetable: async (classId) => {
    const response = await apiClient.get(`/api/classes/${classId}/timetable`);
    return response.data;
  }
};

export default timetableService;
