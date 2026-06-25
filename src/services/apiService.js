import axios from 'axios';

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://mumbaicha-raja-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

console.log("API URL:", import.meta.env.VITE_API_URL);
console.log("Base URL:", apiClient.defaults.baseURL);


// Add token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);


export default apiClient