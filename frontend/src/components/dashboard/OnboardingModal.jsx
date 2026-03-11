import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Briefcase, ArrowRight, Loader2, Building2, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';


export default function OnboardingModal({ isOpen, onClose }) {
    const [step, setStep] = useState(1);
    const [isStudent, setIsStudent] = useState(null);
    const [formData, setFormData] = useState({ univ: '', jurusan: '', semester: '1' });
    const [loading, setLoading] = useState(false);

    // CEK DATA: Kalau user udah punya data 'univ' (entah nama kampus atau "Umum"), modal gak bakal muncul!
    useEffect(() => {
        const userStr = localStorage.getItem('jokifast_user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.univ) {
                onClose();
            }
        }
    }, [onClose, isOpen]);

    const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all border bg-slate-800/40 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 focus:bg-slate-800/60";

    // FUNGSI BARU: Buat nembak API nyimpen data
    const saveToDB = async (dataToSave) => {
        setLoading(true);
        try {
            const res = await axiosInstance.put('/auth/profile', dataToSave);

            if (res.data.success) {
                // Update brankas lokal di browser lu
                localStorage.setItem('jokifast_user', JSON.stringify(res.data.user));
                onClose(); // Tutup modal selamanya
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error("Gagal simpan data onboarding", error);
            alert(error.response?.data?.message || "Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1 && isStudent !== null) {
            if (isStudent === false) {
                // Kalau milih Umum, kita simpen "Umum" ke database biar ga ditanya lagi
                saveToDB({ univ: 'Umum', jurusan: 'Umum', semester: '-' });
            } else {
                setStep(2); // Lanjut isi form mahasiswa
            }
        } else if (step === 2) {
            // Simpan form mahasiswa ke database
            saveToDB(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-white">Lengkapi Profil Anda</h3>
                            <p className="text-sm text-slate-400 mt-1">Bantu kami menyesuaikan layanan untuk Anda.</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 min-h-[300px]">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <p className="text-sm font-medium text-slate-300 mb-4">Apakah Anda seorang mahasiswa?</p>
                                <button onClick={() => setIsStudent(true)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isStudent === true ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isStudent === true ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                            <GraduationCap className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className={`font-bold ${isStudent === true ? 'text-emerald-400' : 'text-slate-200'}`}>Ya, Mahasiswa Aktif</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Saya sedang menempuh pendidikan.</p>
                                        </div>
                                    </div>
                                    {isStudent === true && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                </button>

                                <button onClick={() => setIsStudent(false)} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isStudent === false ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isStudent === false ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className={`font-bold ${isStudent === false ? 'text-blue-400' : 'text-slate-200'}`}>Tidak, Umum / Profesional</h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Saya butuh layanan untuk project lain.</p>
                                        </div>
                                    </div>
                                    {isStudent === false && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300">Asal Universitas / Kampus</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input type="text" value={formData.univ} onChange={(e) => setFormData({ ...formData, univ: e.target.value })} placeholder="Contoh: Universitas Indonesia" className={inputClass} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Jurusan</label>
                                        <div className="relative">
                                            <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <input type="text" value={formData.jurusan} onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })} placeholder="Informatika" className={inputClass} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Semester</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                                            <select value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} className={`${inputClass} appearance-none relative z-0 cursor-pointer`}>
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(s => (
                                                    <option key={s} value={s} className="bg-slate-900">Semester {s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 pt-0 mt-2">
                        <button onClick={handleNext} disabled={(step === 1 && isStudent === null) || loading} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 disabled:shadow-none transition-all">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{step === 1 ? 'Lanjutkan' : 'Simpan Data'} <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}