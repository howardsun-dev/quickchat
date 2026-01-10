import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:3000/api'
      : '/api',
  withCredentials: true,
  timeout: 10000,
  // Better headers
  headers: {
    'Content-Type': 'application/json',
  },
});
