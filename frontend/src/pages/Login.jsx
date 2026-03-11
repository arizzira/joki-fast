import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Loader2, ShieldCheck, Zap } from 'lucide-react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const GoogleIcon = () => (
    <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
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

const testimonials = [
    { name: 'Reza P.', text: 'Nyelamatin banget pas deadline tugas bikin web responsif tinggal 12 jam. Kodingannya rapi, clean code, dan error langsung fixed!' },
    { name: 'Dinda M.', text: 'Sering banget pusing bikin laporan praktikum yang formatnya ribet. Untung ada JokiFast, dikirim malem, pagi-pagi udah siap kumpul.' },
    { name: 'Kevin S.', text: 'Desain UI/UX buat tugas akhir IMK dibikinin estetik banget. Dosen sampai muji karena prototype-nya interaktif dan detail.' },
    { name: 'Amalia R.', text: 'Gila sih, makalahnya daging semua, plus dibikinin PPT yang transisinya smooth abis. Presentasi kelompok jadi paling standout!' },
    { name: 'Gilang W.', text: 'Udah langganan tiap kali ada tugas hitungan yang bikin mumet. Jawabannya selalu bener dan runtut cara kerjanya, mantap!' }
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Login() {
    const navigate = useNavigate();
    const [testiIndex, setTestiIndex] = useState(0);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [error, setError] = useState('');

    // ==========================================
    // LOGIC GOOGLE LOGIN ONLY
    // ==========================================
    const handleGoogleLogin = async () => {
        setLoadingGoogle(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/login'
            }
        });
        if (error) {
            setError("Gagal memanggil Google Login: " + error.message);
            setLoadingGoogle(false);
        }
    };

    useEffect(() => {
        const checkGoogleSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                try {
                    setLoadingGoogle(true);
                    const user = session.user;

                    const response = await axios.post(`${API_URL}/api/auth/google`, {
                        email: user.email,
                        nama: user.user_metadata.full_name,
                        googleId: user.id
                    });

                    localStorage.setItem('jokifast_token', response.data.token);
                    localStorage.setItem('jokifast_user', JSON.stringify(response.data.user));

                    navigate('/dashboard');
                } catch (err) {
                    setError('Gagal sinkronisasi data Google ke sistem JokiFast.');
                } finally {
                    setLoadingGoogle(false);
                }
            }
        };

        checkGoogleSession();
    }, [navigate]);

    // ==========================================
    // EFEK SLIDER TESTIMONI
    // ==========================================
    useEffect(() => {
        window.scrollTo(0, 0);
        const interval = setInterval(() => {
            setTestiIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

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
                        Kembali ke Beranda
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                            Masuk ke JokiFast
                        </h1>
                        <p className="text-slate-500 text-base leading-relaxed">
                            Tidak perlu daftar manual. Gunakan akun Google Anda untuk akses instan ke layanan kami.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                            {error}
                        </div>
                    )}

                    {/* TOMBOL GOOGLE UTAMA (HERO BUTTON) */}
                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loadingGoogle}
                            className="w-full py-4 px-6 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group shadow-sm"
                        >
                            {loadingGoogle ? (
                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                            ) : (
                                <GoogleIcon />
                            )}
                            <span className="text-base font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                                {loadingGoogle ? 'Memproses Akses...' : 'Lanjutkan dengan Google'}
                            </span>
                        </button>
                    </div>

                    {/* FITUR HIGHLIGHTS */}
                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Zap className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm">Akses Instan</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Tanpa perlu repot mengingat password baru.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm">Aman Terenkripsi</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Data dilindungi protokol keamanan Google.</p>
                        </div>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-slate-400 text-xs">
                            Dengan masuk, Anda menyetujui <span className="text-blue-600">Syarat Ketentuan</span> & <span className="text-blue-600">Kebijakan Privasi</span> kami.
                        </p>
                    </div>
                </motion.div>
            </div>

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
                        Fokus pada target utama Anda,<br />
                        <span className="text-slate-400">biar kami yang urus sisanya.</span>
                    </h2>

                    <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl relative h-[250px] flex flex-col justify-between">
                        <div className="absolute -top-3 -left-3 text-4xl text-blue-500/30 font-serif">"</div>
                        <div className="flex items-center gap-1.5 mb-2 relative z-10">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>

                        {/* Area Animasi Teks */}
                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={testiIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0"
                                >
                                    <p className="text-lg font-medium text-slate-200 leading-relaxed line-clamp-3">
                                        {testimonials[testiIndex].text}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Area Author */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20 text-white transition-all">
                                {testimonials[testiIndex].name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-semibold text-white text-sm">{testimonials[testiIndex].name}</h4>
                            </div>

                            {/* Indikator Slider */}
                            <div className="flex gap-1.5 ml-auto">
                                {testimonials.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === testiIndex ? 'bg-blue-400 w-4' : 'bg-slate-600'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}