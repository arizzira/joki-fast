import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Lock, Building2, BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Profil() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // State form disesuaikan dengan schema database lu
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        univ: '',
        jurusan: '',
        password: '',
        confirmPassword: ''
    });

    // Tarik data asli pas halaman di-load
    useEffect(() => {
        window.scrollTo(0, 0);
        const userStr = localStorage.getItem('jokifast_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setFormData(prev => ({
                ...prev,
                nama: user.nama || '',
                email: user.email || '',
                univ: user.univ || '',
                jurusan: user.jurusan || ''
            }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setMessage({ type: '', text: '' });

        // Validasi password kalau diisi
        if (formData.password && formData.password !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi password baru tidak cocok!' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('jokifast_token');

            // Tembak ke API Update Profil
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    univ: formData.univ,
                    jurusan: formData.jurusan
                })
            });

            const result = await res.json();

            if (result.success) {
                // Update brankas lokal biar data baru langsung nampil
                localStorage.setItem('jokifast_user', JSON.stringify(result.user));
                setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });

                // Kosongin kolom password setelah save
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Gagal menyimpan perubahan.' });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all border ${isDark ? 'bg-slate-800/40 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 focus:bg-slate-800/60' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 focus:bg-white'}`;

    return (
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12">
            <div>
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Profil Pengguna</h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Kelola data diri dan keamanan akun Anda.</p>
            </div>

            {/* Notifikasi */}
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {message.text}
                </div>
            )}

            {/* Data Pribadi */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className={`rounded-2xl border overflow-hidden transition-colors shadow-lg ${isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200'}`}
            >
                <div className={`p-6 border-b ${isDark ? 'border-slate-800/60' : 'border-gray-100'}`}>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Data Pribadi</h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Informasi ini digunakan untuk personalisasi layanan.</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="text" name="nama" value={formData.nama} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="email" value={formData.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                            </div>
                            <p className="text-xs text-slate-500">Email tidak dapat diubah.</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">Asal Kampus / Instansi</label>
                            <div className="relative">
                                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="text" name="univ" value={formData.univ} onChange={handleChange} placeholder="Contoh: Universitas Indonesia" className={inputClass} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">Jurusan</label>
                            <div className="relative">
                                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input type="text" name="jurusan" value={formData.jurusan} onChange={handleChange} placeholder="Contoh: Informatika" className={inputClass} />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Keamanan */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible"
                className={`rounded-2xl border overflow-hidden transition-colors shadow-lg ${isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200'}`}
            >
                <div className={`p-6 border-b ${isDark ? 'border-slate-800/60' : 'border-gray-100'}`}>
                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Keamanan Akun</h2>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Kosongkan jika tidak ingin mengganti password.</p>
                </div>
                <div className="p-6 space-y-4 max-w-sm">
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Password Baru</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium block">Konfirmasi Password Baru</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className={inputClass} />
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t flex justify-end border-slate-800/60 bg-slate-800/20">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-6 py-2.5 w-full sm:w-auto text-white font-medium rounded-xl shadow-lg transition-all ${isDark ? 'bg-blue-500 hover:bg-blue-400 disabled:bg-slate-800 disabled:text-slate-500 shadow-blue-500/20' : 'bg-blue-500 hover:bg-blue-400 disabled:bg-gray-300 disabled:text-gray-500 shadow-blue-500/20'}`}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}