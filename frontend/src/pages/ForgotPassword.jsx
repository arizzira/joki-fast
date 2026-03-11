import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Terjadi kesalahan saat memproses permintaan.');
            }

            // Kalau API mengembalikan { success: true }
            if (data.success) {
                setSuccess(true);
            } else {
                throw new Error(data.message || 'Gagal mengirim email reset.');
            }
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
                <div className="absolute -top-[10%] -right-[10%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px]"></div>
                <div className="absolute top-[60%] -left-[20%] w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[60px]"></div>
            </div>

            {/* Left: Form Section */}
            <div className="relative z-10 w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-8 lg:px-16 xl:px-24 py-12">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    className="w-full max-w-md mx-auto bg-white lg:bg-transparent p-8 sm:p-10 lg:p-0 rounded-[2rem] lg:rounded-none shadow-2xl shadow-blue-900/5 lg:shadow-none border border-slate-100 lg:border-none"
                >
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
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
                            Lupa Password?
                        </h1>
                        <p className="text-slate-500 text-base leading-relaxed">
                            Jangan panik. Masukkan alamat email yang terdaftar, dan kami akan mengirimkan instruksi untuk mereset password Anda.
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        {/* Success State */}
                        {success ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2">Email Terkirim!</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
                                    Jika email <strong className="text-slate-700">{email}</strong> terdaftar di sistem kami, Anda akan menerima link untuk mereset password.
                                </p>
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-6 transition-colors">
                                    <ArrowLeft className="w-4 h-4" /> Kembali ke Login
                                </Link>
                            </div>
                        ) : (
                            <>
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
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 lg:bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                                            placeholder="nama@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</>
                                    ) : (
                                        'Kirim Link Reset'
                                    )}
                                </button>
                            </>
                        )}
                    </form>

                    {/* Footer Warning / Info */}
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Sistem kami mengamankan data Anda dengan enkripsi end-to-end. Jika Anda tidak menerima email dalam 5 menit, periksa folder Spam Anda.
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Right: Branding Section (Desktop Only) */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center bg-slate-900 border-l border-slate-800">
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-3xl opacity-40 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-40 pointer-events-none"></div>
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
                        Keamanan akun Anda<br />
                        <span className="text-slate-400">adalah prioritas kami.</span>
                    </h2>

                    <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                        Kami memastikan privasi dan setiap baris kode tugas Anda tetap rahasia. Jangan ragu untuk menghubungi admin jika Anda mengalami kesulitan mengakses akun.
                    </p>
                </div>
            </div>
        </div>
    );
}