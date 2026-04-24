import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
});

// Add token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ilc_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally — session expired
// Teaching: We import the store lazily (inside the handler) to avoid
// circular dependency issues between client.js and authStore.js
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('ilc_token');
      // Only treat as session expiry if user WAS logged in
      // (not just a failed login attempt)
      if (token) {
        localStorage.removeItem('ilc_token');
        localStorage.removeItem('ilc_user');
        // Set sessionExpired flag via store then redirect
        // We use dynamic import to avoid circular dependency
        import('../store/authStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout(true);
        });
      }
    }
    return Promise.reject(error);
  }
);

export default client;