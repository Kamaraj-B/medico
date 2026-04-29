import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true, 
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// To prevent infinite loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const requestUrl = originalRequest?.url || '';
    const isRefreshRequest = requestUrl.includes('/auth/token/refresh');
    const isVerifyRequest = requestUrl.includes('/auth/token/verify');
    const hasTokenInfo = Boolean(localStorage.getItem('tokenInfo'));

    if (
      err.response?.status === 401 &&
      !originalRequest?._retry &&
      !isRefreshRequest &&
      !isVerifyRequest &&
      hasTokenInfo
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // attempt to refresh token
        await api.get('/auth/token/refresh');
        processQueue(null);
        return api(originalRequest); 
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('tokenInfo');

        // optional: redirect only if not on login page already
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export const apiService = {
  get: (url, config = {}) => api.get(url, config),
  post: (url, data, config = {}) => api.post(url, data, config),
  put: (url, data, config = {}) => api.put(url, data, config),
  patch: (url, data, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),
};

export default api;
