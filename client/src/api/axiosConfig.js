import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : 'http://localhost:5035/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
