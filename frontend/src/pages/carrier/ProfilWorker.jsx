import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { User, Mail, Sparkles, Building2, CreditCard, Save, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function ProfilWorker() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({ nama: '', email: '', keahlian: '', bank: '', no_rekening: '' });

    useEffect(() => {
        const userStr = localStorage.getItem('jokifast_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setFormData({
                nama: user.nama || '', email: user.email || '',
                keahlian: user.keahlian || '', bank: user.bank || '', no_rekening: user.no_rekening || ''
            });
        }
    }, []);

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); setSuccess(false); };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true); setSuccess(false);
        try {
            const res = await axiosInstance.put('/auth/profile', { nama: formData.nama, bank: formData.bank, no_rekening: formData.no_rekening });
            if (res.data.success) {
                const currentUser = JSON.parse(localStorage.getItem('jokifast_user') || '{}');
                localStorage.setItem('jokifast_user', JSON.stringify({ ...currentUser, nama: formData.nama, bank: formData.bank, no_rekening: formData.no_rekening }));
                setSuccess(true);
            } else {
                alert(res.data.message || 'Gagal menyimpan profil');
            }
        } catch (error) {
            console.error("Gagal update profil:", error);
            alert(error.response?.data?.message || "Terjadi kesalahan jaringan.");
        } finally {
            setLoading(false);
        }
    };

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800/60' : 'bg-white border-gray-200 shadow-sm';
    const inputClass = `w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 ${isDark ? 'bg-slate-900/50 border border-slate-700/50 text-slate-200 placeholder:text-slate-500' : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'}`;

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textPrimary} flex items-center gap-2`}>
                    <User className="w-8 h-8 text-emerald-500" /> Pengaturan Profil
                </h1>
                <p className={`text-sm mt-1 ${textSecondary}`}>Atur informasi pribadi dan detail rekening penarikan Anda.</p>
            </motion.div>

            <motion.form variants={fadeUp} initial="hidden" animate="visible" onSubmit={handleSave}
                className={`border rounded-3xl overflow-hidden shadow-2xl ${cardBg}`}
            >
                <div className={`h-32 bg-gradient-to-r ${isDark ? 'from-emerald-600/20 to-[#0B1120]' : 'from-emerald-100 to-white'} border-b ${isDark ? 'border-emerald-500/10' : 'border-emerald-200'} relative`}>
                    <div className="absolute -bottom-10 left-8">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-emerald-500 shadow-xl ${isDark ? 'bg-slate-800 border-4 border-slate-900' : 'bg-emerald-50 border-4 border-white'}`}>
                            {formData.nama.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>

                <div className="p-8 pt-16 space-y-8">
                    <div className="space-y-5">
                        <div className={`flex items-center gap-2 font-bold pb-2 border-b ${textPrimary} ${isDark ? 'border-slate-800/80' : 'border-gray-200'}`}>
                            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Informasi Akun Pribadi
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Nama Lengkap</label>
                                <div className="relative">
                                    <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                                    <input type="text" name="nama" value={formData.nama} onChange={handleChange} className={inputClass} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Email Akun <span className={`text-xs font-normal ${textSecondary}`}>(Tidak dapat diubah)</span></label>
                                <div className="relative">
                                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                                    <input type="email" name="email" value={formData.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Keahlian Utama (Skills)</label>
                                <div className="relative">
                                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/70" />
                                    <input type="text" name="keahlian" value={formData.keahlian} onChange={handleChange} placeholder="Misal: Data Entry, Menulis Makalah, Frontend React" className={inputClass} />
                                </div>
                                <p className={`text-xs mt-1 pl-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Pisahkan dengan koma (,).</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5 pt-4">
                        <div className={`flex items-center gap-2 font-bold pb-2 border-b ${textPrimary} ${isDark ? 'border-slate-800/80' : 'border-gray-200'}`}>
                            <CreditCard className="w-5 h-5 text-emerald-500" /> Detail Penarikan Dana
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Nama Bank / E-Wallet</label>
                                <div className="relative">
                                    <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                                    <select name="bank" value={formData.bank} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`}>
                                        <option value="" className={isDark ? 'bg-slate-900' : 'bg-white'}>Pilih Bank</option>
                                        {['BCA', 'Mandiri', 'BNI', 'BRI', 'GoPay', 'OVO', 'Dana'].map(b => (
                                            <option key={b} value={b} className={isDark ? 'bg-slate-900' : 'bg-white'}>{b}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Nomor Rekening / HP</label>
                                <div className="relative">
                                    <CreditCard className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                                    <input type="text" name="no_rekening" value={formData.no_rekening} onChange={handleChange} placeholder="Masukkan nomor" className={inputClass} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`p-6 sm:px-8 border-t flex items-center justify-between gap-4 ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-gray-100 bg-gray-50'}`}>
                    {success && (
                        <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Profil berhasil diperbarui!
                        </div>
                    )}
                    <div className={!success ? 'ml-auto' : ''}>
                        <button type="submit" disabled={loading}
                            className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </motion.form>
        </div>
    );
}
