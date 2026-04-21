import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ilc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — auto logout
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ilc_token');
      localStorage.removeItem('ilc_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default client;