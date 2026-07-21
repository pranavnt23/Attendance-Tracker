import apiClient from './axios';

const odListService = {
  getODList: async () => {
    const response = await apiClient.get('/api/od-list');
    return response.data;
  },

  addStudentToODList: async (studentId) => {
    const response = await apiClient.post('/api/od-list', {
      student_id: studentId
    });
    return response.data;
  },

  bulkAddStudents: async (studentIds) => {
    const response = await apiClient.post('/api/od-list/bulk-add', {
      student_ids: studentIds
    });
    return response.data;
  },

  removeStudentFromODList: async (studentId) => {
    const response = await apiClient.delete(`/api/od-list/${studentId}`);
    return response.data;
  },

  bulkRemoveStudents: async (studentIds) => {
    const response = await apiClient.post('/api/od-list/bulk-delete', {
      student_ids: studentIds
    });
    return response.data;
  },

  searchClassStudents: async (query = '') => {
    const response = await apiClient.get('/api/od-list/search', {
      params: { query }
    });
    return response.data;
  }
};

export default odListService;
