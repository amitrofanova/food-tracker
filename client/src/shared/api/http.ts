import axios from 'axios';

// Local backend instance
export const http = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if present
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  },
);

// OpenFoodFacts instance for product search
export const openfoodfactsHttp = axios.create({
  baseURL: 'https://world.openfoodfacts.org',
  headers: { 'Content-Type': 'application/json' },
});
