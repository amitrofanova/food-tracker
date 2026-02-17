import axios from 'axios';

export const http = axios.create({
  baseURL: 'https://world.openfoodfacts.org',
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  },
);
