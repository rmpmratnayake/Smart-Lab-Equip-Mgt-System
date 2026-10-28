import axios from 'axios';

// all requests go to /api (vite proxies them to the backend)
const api = axios.create({ baseURL: '/api' });

// add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

// if the token is not valid, go back to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config ? err.config.url : '';
    if (err.response && err.response.status === 401 && !url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// gets a readable error message from an axios error
export function getError(err) {
  if (err.response && err.response.data && err.response.data.message) {
    return err.response.data.message;
  }
  if (err.request) return 'Cannot reach the server. Is the backend running?';
  return 'Something went wrong.';
}

// format a date for display
export function showDate(d) {
  return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
}

// format a date for a datetime-local input
export function toInputDate(d) {
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
    'T' + pad(date.getHours()) + ':' + pad(date.getMinutes())
  );
}

export default api;
