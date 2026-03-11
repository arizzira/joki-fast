import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Briefcase, Wallet, CheckCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
// KITA BALIKIN KE SINI AJA BIAR LU GAK PUSING BIKIN FILE BARU
import { supabase } from '../../supabaseClient';

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

const workerTestimonials = [
    { name: 'Andi S.', text: 'Sejak gabung jadi mitra JokiFast, bisa nambah uang jajan lumayan banget. Sistemnya fair dan pembayarannya lancar!' },
    { name: 'Budi W.', text: 'Enaknya di sini orderan masuk terus, tinggal pilih tugas yang sesuai sama keahlian kita. Mantap lah pokoknya.' },
    { name: 'Clara M.', text: 'Platform yang sangat membantu buat mahasiswa IT yang pengen cari penghasilan tambahan dari ngoding.' }
];


export default function CarrierLogin() { // Sesuaikan nama function lu
    const navigate = useNavigate();
    const [testiIndex, setTestiIndex] = useState(0);
    const [loadingGoogle, setLoadingGoogle] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setLoadingGoogle(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/carrier/login'
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

                    const response = await axiosInstance.post('/auth/google', {
                        email: user.email,
                        nama: user.user_metadata.full_name,
                        googleId: user.id,
                        role: 'WORKER'
                    });

                    localStorage.setItem('jokifast_token', response.data.token);
                    localStorage.setItem('jokifast_user', JSON.stringify(response.data.user));

                    navigate('/carrier/dashboard');
                } catch (err) {
                    setError('Gagal sinkronisasi data Mitra ke sistem.');
                } finally {
                    setLoadingGoogle(false);
                }
            }
        };

        checkGoogleSession();
    }, [navigate]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const interval = setInterval(() => {
            setTestiIndex((prev) => (prev + 1) % workerTestimonials.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen flex bg-slate-50 lg:bg-white font-sans relative overflow-hidden">
            <div className="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[80px]"></div>
                <div className="absolute top-[60%] -left-[20%] w-[300px] h-[300px] rounded-full bg-teal-500/10 blur-[60px]"></div>
            </div>

            <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="w-full max-w-md mx-auto bg-white lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-[2rem] lg:rounded-none shadow-2xl shadow-emerald-900/5 lg:shadow-none border border-slate-100 lg:border-none">

                    <div className="lg:hidden flex justify-center mb-10">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="w-6 h-6 bg-emerald-600 rounded-md"></div>
                            <span className="text-2xl font-medium tracking-tight text-slate-900">
                                Joki<span className="text-emerald-600">Fast</span> <span className="text-sm font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">PRO</span>
                            </span>
                        </Link>
                    </div>

                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">Portal Mitra</h1>
                        <p className="text-slate-500 text-base leading-relaxed">Masuk ke akun Worker Anda menggunakan Google untuk mulai mengambil pesanan.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{error}</div>
                    )}

                    <div className="space-y-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loadingGoogle}
                            className="w-full py-4 px-6 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 disabled:opacity-60 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 group shadow-sm"
                        >
                            {loadingGoogle ? <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" /> : <GoogleIcon />}
                            <span className="text-base font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                                {loadingGoogle ? 'Memproses Akses...' : 'Masuk sebagai Mitra'}
                            </span>
                        </button>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                                <Briefcase className="w-4 h-4 text-teal-600" />
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm">Tugas Melimpah</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Pilih project yang sesuai dengan keahlian Anda.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-emerald-600" />
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm">Cuan Cepat</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">Pencairan dana langsung ke rekening Anda.</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-slate-900 border-l border-slate-800">
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-emerald-900/40 to-slate-900">
                    <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 pointer-events-none"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg p-12 text-white">
                    <div className="mb-16">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg group-hover:scale-105 transition-transform"></div>
                            <span className="text-2xl font-medium tracking-tight">
                                Joki<span className="text-emerald-500">Fast</span> <span className="text-sm font-bold bg-white/10 px-2 py-1 rounded">PRO</span>
                            </span>
                        </Link>
                    </div>

                    <h2 className="text-5xl font-medium tracking-tight mb-8 leading-[1.15]">
                        Ubah skill Anda<br />
                        <span className="text-slate-400">menjadi penghasilan pasti.</span>
                    </h2>

                    <div className="p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl relative h-[220px] flex flex-col justify-between">
                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                <motion.div key={testiIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="absolute inset-0">
                                    <p className="text-lg font-medium text-slate-200 leading-relaxed line-clamp-3">"{workerTestimonials[testiIndex].text}"</p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center gap-4 mt-4">
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-emerald-500/20">
                                {workerTestimonials[testiIndex].name.charAt(0)}
                            </div>
                            <h4 className="font-semibold text-white text-sm">{workerTestimonials[testiIndex].name}</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}