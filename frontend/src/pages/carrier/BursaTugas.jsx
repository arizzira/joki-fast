import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, CreditCard, ChevronRight, User, Briefcase, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatGaji = (hargaTotal) => {
    if (!hargaTotal || hargaTotal === 0) return "Harga Nego";
    const gaji = hargaTotal * 0.8;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(gaji);
};

export default function BursaTugas() {
    const { isDark } = useTheme();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchMarketOrders = async () => {
            try {
                const token = localStorage.getItem('jokifast_token');
                const res = await fetch(`${API_URL}/api/orders/market`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) setOrders(result.data);
            } catch (error) {
                console.error("Gagal mengambil data bursa tugas:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMarketOrders();
    }, []);

    const filteredOrders = orders.filter(order => {
        return order.judul_tugas.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_id_custom.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const extractInfo = (descString) => {
        const regex = /\[Tipe: (.*?) \| Deadline: (.*?)\]/;
        const match = descString?.match(regex);
        return {
            type: match ? match[1] : '-',
            deadline: match ? match[2] : '-',
            cleanDesc: descString?.replace(regex, '').trim() || '-'
        };
    };

    // Theme helpers
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800/60' : 'bg-white border-gray-200 shadow-sm';
    const inputBg = isDark ? 'bg-slate-900/60 border-slate-800/60 text-white placeholder:text-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textPrimary} flex items-center gap-2`}>
                        <Briefcase className="w-8 h-8 text-emerald-500" /> Bursa Tugas
                    </h1>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Temukan dan ambil tugas yang sesuai dengan keahlian Anda.</p>
                </div>
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari ID atau judul tugas..."
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all ${inputBg}`}
                    />
                </div>
            </motion.div>

            <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <AnimatePresence>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => {
                            const { type, deadline, cleanDesc } = extractInfo(order.deskripsi);
                            return (
                                <motion.div key={order.id} variants={fadeUp} layout
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                                    className={`group relative border rounded-2xl p-5 sm:p-6 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 flex flex-col ${cardBg}`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                            {type}
                                        </span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-md ${isDark ? 'text-slate-500 bg-slate-950/50' : 'text-gray-400 bg-gray-100'}`}>{order.order_id_custom}</span>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className={`text-base sm:text-lg font-bold leading-snug group-hover:text-emerald-500 transition-colors line-clamp-2 ${textPrimary}`}>
                                            {order.judul_tugas}
                                        </h3>
                                        <div className={`flex items-center gap-2 mt-2 text-xs sm:text-sm ${textSecondary}`}>
                                            <User className="w-4 h-4" />
                                            <span>Klien: <strong className={`font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{order.client?.nama || order.nama_klien}</strong></span>
                                        </div>
                                        <p className={`mt-3 text-sm line-clamp-2 leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                                            {cleanDesc}
                                        </p>
                                    </div>

                                    <div className={`mt-auto grid grid-cols-2 gap-3 mb-5 p-3 rounded-xl border ${isDark ? 'bg-slate-950/50 border-slate-800/50' : 'bg-gray-50 border-gray-200'}`}>
                                        <div>
                                            <p className={`text-[10px] font-medium mb-0.5 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                                <CreditCard className="w-3 h-3" /> Estimasi Upah
                                            </p>
                                            <p className="text-sm font-bold text-emerald-500">{formatGaji(order.harga_total)}</p>
                                        </div>
                                        <div>
                                            <p className={`text-[10px] font-medium mb-0.5 flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                                <Clock className="w-3 h-3" /> Tenggat Waktu
                                            </p>
                                            <p className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>{deadline}</p>
                                        </div>
                                    </div>

                                    <Link to={`/carrier/dashboard/detail/${order.id}`}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                    >
                                        Lihat Detail Tugas <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </motion.div>
                            );
                        })
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className={`col-span-full py-16 text-center border border-dashed rounded-2xl ${isDark ? 'border-slate-800 bg-slate-900/20' : 'border-gray-300 bg-gray-50'}`}
                        >
                            <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                            <h3 className={`text-lg font-bold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Belum Ada Tugas Tersedia</h3>
                            <p className={`text-sm mt-1 ${textSecondary}`}>Menunggu pesanan baru dari klien masuk ke sistem.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}