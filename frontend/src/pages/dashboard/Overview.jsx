import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Wallet, TrendingUp, Search, Filter, Loader2, ArrowRight } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    })
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
};

const statusBadge = (status) => {
    const map = {
        'DONE': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'ON_PROGRESS': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'REVIEW': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'WAITING_WORKER': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

const formatStatusText = (status) => {
    const map = { 'DONE': 'Selesai', 'ON_PROGRESS': 'Dikerjakan', 'REVIEW': 'Direview', 'WAITING_WORKER': 'Menunggu' };
    return map[status] || status;
};

export default function Overview() {
    const { isDark } = useTheme();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosInstance.get('/orders');
                if (res.data.success) setOrders(res.data.data);
            } catch (error) {
                console.error("Gagal mengambil data pesanan:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const activeOrdersCount = orders.filter(o => o.status_pengerjaan !== 'DONE').length;
    const completedOrdersCount = orders.filter(o => o.status_pengerjaan === 'DONE').length;
    const totalSpend = orders.reduce((total, order) => total + (order.harga_total || 0), 0);

    const stats = [
        { title: 'Pesanan Aktif', value: activeOrdersCount.toString(), change: 'Sedang berjalan', icon: Clock, gradient: 'from-blue-600 to-blue-400', glow: 'shadow-blue-500/20' },
        { title: 'Tugas Selesai', value: completedOrdersCount.toString(), change: 'Telah dikirim', icon: CheckCircle2, gradient: 'from-emerald-600 to-emerald-400', glow: 'shadow-emerald-500/20' },
        { title: 'Total Pengeluaran', value: formatRupiah(totalSpend), change: 'All time', icon: Wallet, gradient: 'from-purple-600 to-purple-400', glow: 'shadow-purple-500/20' },
    ];

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 border-slate-800/60' : 'bg-white border-gray-200 shadow-sm';
    const tableBorder = isDark ? 'divide-slate-800/60' : 'divide-gray-200';
    const tableHeadBg = isDark ? 'bg-slate-900/50 border-slate-800/60 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-500';

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textPrimary}`}>Overview</h1>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Pantau aktivitas dan statistik pesanan Anda.</p>
                </div>
                <Link to="/dashboard/buat-pesanan" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                    Buat Pesanan Baru <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {stats.map((stat, i) => (
                    <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="visible"
                        className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-sm shadow-xl ${cardBg} ${stat.glow}`}
                    >
                        <div className="flex items-start justify-between relative z-10">
                            <div>
                                <p className={`text-sm font-medium mb-1 ${textSecondary}`}>{stat.title}</p>
                                <h3 className={`text-3xl font-bold mb-2 ${textPrimary}`}>{stat.value}</h3>
                                <p className="text-xs font-medium text-blue-500 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> {stat.change}
                                </p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible" className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
                <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-slate-800/60' : 'border-gray-100'}`}>
                    <h3 className={`text-lg font-bold ${textPrimary}`}>Pesanan Terakhir</h3>
                    <Link to="/dashboard/pesanan" className="text-sm font-medium text-blue-500 hover:text-blue-400">Lihat Semua</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase border-b ${tableHeadBg}`}>
                            <tr>
                                <th className="px-6 py-4">ID Pesanan</th>
                                <th className="px-6 py-4">Judul Tugas</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4 text-right">Harga Total</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${tableBorder} ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                            {orders.length > 0 ? (
                                orders.slice(0, 5).map((order) => (
                                    <tr key={order.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}`}>
                                        <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{order.order_id_custom}</td>
                                        <td className="px-6 py-4 truncate max-w-[200px]">{order.judul_tugas}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-semibold border ${statusBadge(order.status_pengerjaan)}`}>
                                                {formatStatusText(order.status_pengerjaan)}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 ${textSecondary}`}>
                                            {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                                            {formatRupiah(order.harga_total)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className={`px-6 py-8 text-center ${textSecondary}`}>
                                        Belum ada pesanan yang dibuat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}