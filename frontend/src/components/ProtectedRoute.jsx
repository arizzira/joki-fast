import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    // Cek apakah ada token JWT di localStorage
    const token = localStorage.getItem('jokifast_token');

    // Kalau nggak ada token, tendang balik ke halaman login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Kalau aman, silakan masuk ke komponen anak (Outlet)
    return <Outlet />;
}