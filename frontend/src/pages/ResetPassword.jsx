import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, ShieldCheck } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!token) {
            setError('Token reset password tidak ditemukan atau tidak valid. Silakan request link baru dari halaman Lupa Password.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Konfirmasi password tidak cocok dengan password baru!');
        }

        if (password.length < 8) {
            return setError('Password minimal harus 8 karakter!');
        }

        setLoading(true);
        try {
            await axiosInstance.post('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000); // Auto redirect ke login
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mereset password. Token mungkin sudah kedaluwarsa.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 lg:bg-white font-sans relative overflow-hidden">

            {/* Mobile Ambient Background */}
            <div className="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px]"></div>
                <div className="absolute top-[60%] -left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[60px]"></div>
            </div>

            {/* Left: Form Section */}
            <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full max-w-md mx-auto bg-white lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-[2rem] lg:rounded-none shadow-2xl shadow-blue-900/5 lg:shadow-none border border-slate-100 lg:border-none">

                    {/* Mobile Header / Logo */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="grid grid-cols-2 gap-[2px] w-6 h-6">
                                <div className="bg-blue-600 rounded-sm"></div>
                                <div className="bg-slate-900 rounded-sm"></div>
                                <div className="bg-slate-900 rounded-sm"></div>
                                <div className="bg-slate-900 rounded-sm"></div>
                            </div>
                            <span className="text-2xl font-medium tracking-tight text-slate-900">
                                Joki<span className="text-blue-600">Fast</span>
                            </span>
                        </Link>
                    </div>

                    <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Login
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">Buat Password Baru</h1>
                        <p className="text-slate-500 text-base leading-relaxed">Silakan masukkan password baru Anda. Pastikan kombinasi password kuat dan mudah diingat.</p>
                    </div>

                    {success ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Berhasil Diubah!</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                                Password Anda telah berhasil diperbarui. Mengarahkan ke halaman login dalam beberapa detik...
                            </p>
                        </div>
                    ) : (
                        <form className="space-y-5" onSubmit={handleSubmit}>
                            {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{error}</div>}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Password Baru</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all" placeholder="Min. 8 karakter" required disabled={!token || loading} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Konfirmasi Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all" placeholder="Ulangi password baru" required disabled={!token || loading} />
                                </div>
                            </div>

                            <button type="submit" disabled={loading || !token} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4">
                                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : 'Simpan Password Baru'}
                            </button>
                        </form>
                    )}

                    {/* Footer Info */}
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Password Anda dienkripsi secara aman. Jangan pernah membagikan password Anda kepada siapapun, termasuk admin JokiFast.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Right: Branding Section (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-slate-900 border-l border-slate-800">
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 pointer-events-none"></div>
                    <div className="absolute -bottom-40 -left-20 w-[600px] h-[600px] bg-blue-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-50 pointer-events-none"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg p-12 text-white">
                    <div className="mb-16">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="grid grid-cols-2 gap-[2px] w-7 h-7 group-hover:scale-105 transition-transform">
                                <div className="bg-blue-500 rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                            </div>
                            <span className="text-2xl font-medium tracking-tight">
                                Joki<span className="text-blue-500">Fast</span>
                            </span>
                        </Link>
                    </div>

                    <h2 className="text-5xl font-medium tracking-tight mb-8 leading-[1.15]">
                        Keamanan data Anda<br />
                        <span className="text-slate-400">adalah prioritas utama kami.</span>
                    </h2>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                        Sistem kami menggunakan enkripsi standar industri untuk melindungi setiap informasi Anda. Mulai dari pengerjaan tugas hingga transaksi, semuanya aman terkendali.
                    </p>
                </div>
            </div>
        </div>
    );
}