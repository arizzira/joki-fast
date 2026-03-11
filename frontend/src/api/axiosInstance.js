import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://jokifast.my.id/api',
});

// Request Interceptor to add Authorization target
axiosInstance.interceptors.request.use(
    (config) => {
        // Ambil token JWT yang dihasilkan oleh backend dari localStorage
        const token = localStorage.getItem('jokifast_token');

        // Jika ada token, masukkan ke Authorization header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
