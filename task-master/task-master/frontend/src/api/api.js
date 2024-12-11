// api.js (or any utility file for API handling)
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL, // Your base URL
});

// Function to refresh the token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (refreshToken) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_APP_API_BASE_URL}/auth/refresh-token`, {
        refreshToken: refreshToken,
      });

      const newAccessToken = response.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh token', error);
      throw new Error('Token refresh failed');
    }
  }
  
  throw new Error('No refresh token available');
};

// Interceptor to handle request and token refresh
api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Unauthorized (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const newAccessToken = await refreshAccessToken();

        // Update the request with the new token and retry
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed', refreshError);
        // You can handle redirecting to login here
      }
    }

    return Promise.reject(error);
  }
);

export default api;
