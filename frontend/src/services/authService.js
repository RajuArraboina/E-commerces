import api from './api';

export const authService = {
  // Register customer
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Login user (customer or admin)
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Continue client cleanup even if backend logout fails
    }
  },

  // Get current logged-in user profile
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Reset forgotten password
  resetPassword: async (email, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },

  // Send 6-digit signup verification OTP
  sendSignupOtp: async (email, name) => {
    const response = await api.post('/auth/send-otp', { email, name });
    return response.data;
  },

  // Verify signup OTP
  verifySignupOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Verify login 6-digit OTP
  verifyLoginOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-login-otp', { email, otp });
    return response.data;
  },

  // Resend login 6-digit OTP
  resendLoginOtp: async (email) => {
    const response = await api.post('/auth/resend-login-otp', { email });
    return response.data;
  },
};

export default authService;
