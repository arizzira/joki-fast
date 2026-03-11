import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, Loader2, Send, CheckCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function BeriRatingModal({ isOpen, onClose, orderId, onSuccess, isDark }) {
    const [rating, setRating] = useState(0);
    const [hoveredStar, setHoveredStar] = useState(0);
    const [ulasan, setUlasan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Pilih minimal 1 bintang ya, Bro!');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axiosInstance.post(`/orders/${orderId}/rating`, { rating, ulasan });

            if (res.data.success) {
                setSuccessMsg('Terima kasih atas ulasan Anda!');
                setTimeout(() => {
                    onSuccess(); // Buat nge-refresh data di halaman utama
                    onClose();   // Tutup modal
                    setSuccessMsg('');
                    setRating(0);
                    setUlasan('');
                }, 2000);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal mengirim ulasan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const bg = isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900';
    const textSec = isDark ? 'text-slate-400' : 'text-slate-500';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => !isSubmitting && onClose()}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className={`relative w-full max-w-md p-6 sm:p-8 rounded-3xl shadow-2xl border ${bg}`}
                >
                    <button onClick={() => !isSubmitting && onClose()} className="absolute top-4 right-4 p-2 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>

                    {successMsg ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-emerald-500 mb-2">Ulasan Terkirim!</h3>
                            <p className={textSec}>{successMsg}</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6 mt-2">
                                <h3 className="text-2xl font-bold mb-2">Beri Ulasan ⭐</h3>
                                <p className={`text-sm ${textSec}`}>Bagaimana hasil kerja Mitra kami? Penilaian Anda sangat berharga.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* BINTANG BINTANG */}
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star} type="button"
                                            onMouseEnter={() => setHoveredStar(star)}
                                            onMouseLeave={() => setHoveredStar(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-110 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-colors ${star <= (hoveredStar || rating)
                                                    ? 'fill-amber-400 text-amber-400'
                                                    : isDark ? 'text-slate-700' : 'text-slate-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className={`text-center text-xs font-bold uppercase tracking-wider ${rating > 0 ? 'text-amber-500' : textSec}`}>
                                    {rating === 1 && 'Sangat Kurang'}
                                    {rating === 2 && 'Kurang'}
                                    {rating === 3 && 'Cukup'}
                                    {rating === 4 && 'Bagus'}
                                    {rating === 5 && 'Sempurna!'}
                                    {rating === 0 && 'Pilih Bintang'}
                                </p>

                                {/* TEKS ULASAN */}
                                <div>
                                    <label className={`block text-xs font-bold mb-2 uppercase tracking-wider ${textSec}`}>Tuliskan Pengalaman Anda</label>
                                    <textarea
                                        rows="4" required
                                        placeholder="Pekerjaannya cepat dan hasilnya rapi banget..."
                                        value={ulasan} onChange={(e) => setUlasan(e.target.value)}
                                        className={`w-full p-4 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none ${isDark ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border border-slate-200 text-slate-900'
                                            }`}
                                    ></textarea>
                                </div>

                                <button type="submit" disabled={isSubmitting || rating === 0} className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2">
                                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : <><Send className="w-4 h-4" /> Kirim Ulasan</>}
                                </button>
                            </form>
                        </>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}