import apiClient from './axios';

const authService = {
  login: async (register_no, password) => {
    const response = await apiClient.post('/api/auth/login', {
      register_no,
      password,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  forgotPassword: async (register_no) => {
    const response = await apiClient.post('/api/auth/forgot-password', {
      register_no,
    });
    return response.data;
  },

  verifyOtp: async (register_no, otp) => {
    const response = await apiClient.post('/api/auth/verify-otp', {
      register_no,
      otp,
    });
    return response.data;
  },

  resetPassword: async (register_no, new_password) => {
    const response = await apiClient.post('/api/auth/reset-password', {
      register_no,
      new_password,
    });
    return response.data;
  },
};

export default authService;
