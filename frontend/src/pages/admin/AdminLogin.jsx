import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2, Lock } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post(`${API_URL}/api/auth/admin-login`, { email, password });

            if (res.data.success) {
                localStorage.setItem('jokifast_token', res.data.token);
                localStorage.setItem('jokifast_user', JSON.stringify(res.data.user));
                navigate('/admin/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal terhubung ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-indigo-500/30 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8 relative z-10 transition-all hover:border-slate-700/50 hover:shadow-indigo-500/10 hover:shadow-2xl">

                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Admin<span className="text-indigo-400">Panel</span></h1>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Restricted Access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Admin</label>
                        <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                            placeholder="admin@jokifast.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <input
                                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 text-white pl-11 pr-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <button
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Masuk Command Center'}
                    </button>
                </form>

            </div>
        </div>
    );
}