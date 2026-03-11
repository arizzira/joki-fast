import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Loader2, Briefcase } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CarrierRegister() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [keahlian, setKeahlian] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Ubah endpoint ke API register yang udah ada di backend
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // 2. WAJIB tambahin role: 'WORKER' biar disimpen khusus sbg worker
                // (Note: keahlian sementara gak dikirim karena di Prisma belum kita bikin kolomnya)
                body: JSON.stringify({ nama, email, password, role: 'WORKER' }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registrasi gagal.');
            }

            // Redirect ke carrier login dengan pesan sukses
            navigate('/carrier/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 lg:bg-white font-sans relative overflow-hidden">

            {/* Mobile Ambient Background */}
            <div className="absolute inset-0 z-0 lg:hidden overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-emerald-500/10 blur-[80px]"></div>
                <div className="absolute top-[60%] -left-[20%] w-[300px] h-[300px] rounded-full bg-teal-500/10 blur-[60px]"></div>
            </div>

            {/* Left: Form Section */}
            <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="w-full max-w-md mx-auto bg-white lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-[2rem] lg:rounded-none shadow-2xl shadow-emerald-900/5 lg:shadow-none border border-slate-100 lg:border-none"
                >
                    {/* Mobile Header / Logo */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="grid grid-cols-2 gap-[2px] w-6 h-6">
                                <div className="bg-emerald-600 rounded-sm"></div>
                                <div className="bg-slate-900 rounded-sm"></div>
                                <div className="bg-slate-900 rounded-sm"></div>
                                <div className="bg-slate-900 rounded-sm"></div>
                            </div>
                            <span className="text-2xl font-medium tracking-tight text-slate-900">
                                Joki<span className="text-emerald-600">Fast</span>
                            </span>
                        </Link>
                    </div>

                    <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-emerald-600 transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali
                    </Link>

                    <div className="mb-8">
                        <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-4">
                            Worker Portal
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                            Daftar Jadi Worker
                        </h1>
                        <p className="text-slate-500 text-base">
                            Bergabung sebagai worker elite dan mulai hasilkan uang dari skill Anda.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        {/* Name Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all duration-200"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all duration-200"
                                    placeholder="nama@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Keahlian Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Keahlian Utama</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Briefcase className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    value={keahlian}
                                    onChange={(e) => setKeahlian(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all duration-200"
                                    placeholder="Web Development, UI/UX, dll."
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-12 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all duration-200"
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
                                Dengan mendaftar, Anda menyetujui <Link to="/legal/syarat-ketentuan" className="text-emerald-600 hover:underline">Syarat & Ketentuan</Link> dan <Link to="/legal/kebijakan-privasi" className="text-emerald-600 hover:underline">Kebijakan Privasi</Link> kami.
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-200 mt-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                            ) : (
                                'Daftar Sebagai Worker'
                            )}
                        </button>
                    </form>

                    {/* Footer / Switch Auth */}
                    <div className="mt-10 text-center">
                        <p className="text-slate-500 text-sm">
                            Sudah punya akun worker?{' '}
                            <Link to="/carrier/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
                                Masuk di sini
                            </Link>
                        </p>
                        <p className="text-slate-400 text-xs mt-3">
                            Bukan worker?{' '}
                            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">
                                Daftar sebagai User
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Right: Branding Section (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-slate-900 border-l border-slate-800">
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-slate-900 via-emerald-900 to-slate-900">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-50 pointer-events-none"></div>
                </div>

                <div className="relative z-10 w-full max-w-lg p-12 text-white">
                    <div className="mb-16">
                        <Link to="/" className="flex items-center gap-2.5 group">
                            <div className="grid grid-cols-2 gap-[2px] w-7 h-7 group-hover:scale-105 transition-transform">
                                <div className="bg-emerald-500 rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                                <div className="bg-white rounded-sm"></div>
                            </div>
                            <span className="text-2xl font-medium tracking-tight">
                                Joki<span className="text-emerald-500">Fast</span>
                            </span>
                        </Link>
                    </div>

                    <h2 className="text-5xl font-medium tracking-tight mb-8 leading-[1.15]">
                        Bergabung jadi worker,<br />
                        <span className="text-slate-400">monetisasi keahlian Anda.</span>
                    </h2>

                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Fleksibilitas Penuh</h4>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Kerjakan project sesuai jadwal Anda. Tidak ada jam kerja tetap — Anda yang tentukan kapan dan di mana.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Pembayaran Transparan</h4>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Kompensasi yang jelas dan adil untuk setiap project. Pembayaran langsung masuk setelah project selesai.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <div>
                                <h4 className="text-white font-medium">Portofolio Berkembang</h4>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">Setiap project menambah pengalaman dan portofolio Anda. Tingkatkan skill sambil mendapat penghasilan.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}