import axios from 'axios';
import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY || 'default-secret-key-123456789012';

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token and encrypt payload
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Encrypt JSON payloads
    if (config.data && !(config.data instanceof FormData)) {
      try {
        const jsonStr = JSON.stringify(config.data);
        const ciphertext = CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
        config.data = { payload: ciphertext };
      } catch (err) {
        console.error('Payload encryption failed:', err);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and decrypt payload
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.payload) {
      try {
        const bytes = CryptoJS.AES.decrypt(response.data.payload, SECRET_KEY);
        const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
        if (decryptedStr) {
          response.data = JSON.parse(decryptedStr);
        }
      } catch (err) {
        console.error('Payload decryption failed:', err);
      }
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      window.location.href = '/admin-login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;