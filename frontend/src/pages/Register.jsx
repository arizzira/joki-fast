import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GoogleIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingGoogle, setLoadingGoogle] = useState(false); // STATE BARU BUAT LOADING GOOGLE
    const [error, setError] = useState('');

    // ==========================================
    // LOGIC GOOGLE LOGIN & CEK SESSION
    // ==========================================
    const handleGoogleLogin = async () => {
        setLoadingGoogle(true); // SET LOADING NYALA PAS DIKLIK
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/register'
            }
        });
        if (error) {
            setError("Gagal memanggil Google Login: " + error.message);
            setLoadingGoogle(false); // MATIIN LOADING KALAU ERROR
        }
    };

    useEffect(() => {
        const checkGoogleSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                try {
                    setLoadingGoogle(true); // NYALAIN LOADING PAS BALIK DARI GOOGLE
                    const user = session.user;
                    
                    const response = await axios.post(`${API_URL}/api/auth/google`, {
                        email: user.email,
                        nama: user.user_metadata.full_name,
                        googleId: user.id
                    });

                    localStorage.setItem('jokifast_token', response.data.token);
                    localStorage.setItem('jokifast_user', JSON.stringify(response.data.user));

                    alert('Registrasi via Google Berhasil! Langsung masuk ke Dashboard...');
                    navigate('/dashboard'); 
                } catch (err) {
                    setError('Gagal sinkronisasi pendaftaran Google ke sistem JokiFast.');
                } finally {
                    setLoadingGoogle(false); // MATIIN LOADING PAS KELAR
                }
            }
        };

        checkGoogleSession();
    }, [navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // ==========================================
    // LOGIC MANUAL REGISTER (EMAIL & PASSWORD)
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nama, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registrasi gagal. Silakan coba lagi.');
            }

            alert('Registrasi berhasil! Silakan login dengan akun Anda.');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 lg:bg-white font-sans relative overflow-hidden">
            <div className="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px]"></div>
                <div className="absolute top-[60%] -left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[60px]"></div>
            </div>

            <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="w-full max-w-md mx-auto bg-white lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-[2rem] lg:rounded-none shadow-2xl shadow-blue-900/5 lg:shadow-none border border-slate-100 lg:border-none"
                >
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

                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>

                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                            Buat Akun Baru
                        </h1>
                        <p className="text-slate-500 text-base">
                            Daftar dan akses layanan kami.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="nama" className="text-sm font-medium text-slate-700 cursor-pointer">Nama Lengkap</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="nama"
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700 cursor-pointer">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                                    placeholder="nama@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-slate-700 cursor-pointer">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                                    placeholder="Min. 8 karakter"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                                Dengan mendaftar, Anda menyetujui <Link to="/legal/syarat-ketentuan" className="text-blue-600 hover:underline">Syarat & Ketentuan</Link> dan <Link to="/legal/kebijakan-privasi" className="text-blue-600 hover:underline">Kebijakan Privasi</Link> kami.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                            ) : (
                                'Daftar Sekarang'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 mb-8 flex items-center">
                        <div className="flex-1 border-t border-slate-200"></div>
                        <span className="px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Atau daftar dengan</span>
                        <div className="flex-1 border-t border-slate-200"></div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* TOMBOL GOOGLE UDAH DI-UPGRADE PAKAI LOADING STATE */}
                        <button 
                            onClick={handleGoogleLogin} 
                            disabled={loadingGoogle}
                            type="button" 
                            className="flex items-center justify-center gap-3 w-full py-3 bg-slate-50 lg:bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-slate-700 transition-all duration-200"
                        >
                            {loadingGoogle ? (
                                <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            {loadingGoogle ? 'Memproses...' : 'Google'}
                        </button>

                        <button type="button" className="flex items-center justify-center gap-3 w-full py-3 bg-slate-50 lg:bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 transition-all duration-200">
                            <MessageCircle className="w-5 h-5 text-[#25D366]" />
                            WhatsApp
                        </button>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-slate-500 text-sm">
                            Sudah punya akun?{' '}
                            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                Masuk di sini
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-slate-900 border-l border-slate-800">
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-900 via-indigo-900 to-slate-900">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 pointer-events-none"></div>
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
                        Dapatkan solusi cepat<br />
                        <span className="text-slate-400">tanpa mengorbankan kualitas.</span>
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Jaminan Kerahasiaan</h4>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Privasi dan source code Anda aman terlindungi 100% dari kebocoran kepada pihak ketiga.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Garansi Revisi</h4>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Pengembangan akan dilanjutkan hingga pesanan Anda benar-benar memenuhi requirement awal tugas.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Originalitas Tinggi</h4>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Setiap baris kode dibuat secara eksklusif dan unik agar bebas dari deteksi mesin pencari plagiasi manapun.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}