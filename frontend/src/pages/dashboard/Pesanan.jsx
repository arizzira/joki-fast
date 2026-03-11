import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Search, Filter, Loader2, Star } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import BeriRatingModal from '../../components/BerikanRating'

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper Format Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka || 0);
};

// Helper Warna Badge
const statusBadge = (status) => {
    const map = {
        'DONE': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        'ON_PROGRESS': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'REVIEW': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'WAITING_WORKER': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
};

// Helper Teks Status
const formatStatusText = (status) => {
    const map = {
        'DONE': 'Selesai',
        'ON_PROGRESS': 'Dikerjakan',
        'REVIEW': 'Direview',
        'WAITING_WORKER': 'Menunggu',
    };
    return map[status] || status;
};

export default function Pesanan() {
    const { isDark } = useTheme();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // 👇 STATE BUAT MODAL RATING
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);

    // Tarik nilai search dari URL
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('search') || '';
    const [searchTerm, setSearchTerm] = useState(query);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value) {
            setSearchParams({ search: value });
        } else {
            setSearchParams({});
        }
    };

    const fetchMyOrders = async () => {
        try {
            const token = localStorage.getItem('jokifast_token');
            const userStr = localStorage.getItem('jokifast_user');
            const user = userStr ? JSON.parse(userStr) : null;

            const res = await fetch(`${API_URL}/api/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const result = await res.json();

            if (result.success && user) {
                const myOrders = result.data.filter(o => o.nama_klien === user.nama);
                setOrders(myOrders);
            }
        } catch (error) {
            console.error("Gagal mengambil data pesanan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyOrders();
    }, []);

    // Filter Logic
    const filteredOrders = orders.filter(order =>
        order.judul_tugas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_id_custom.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 relative">

            {/* PANGGIL MODAL RATING DI SINI */}
            <BeriRatingModal
                isOpen={isRatingModalOpen}
                onClose={() => setIsRatingModalOpen(false)}
                orderId={selectedOrderId}
                isDark={isDark}
                onSuccess={fetchMyOrders} // Refresh list kalau rating berhasil dikirim
            />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Pesanan Saya</h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Kelola dan pantau status pengerjaan tugas Anda di sini.</p>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        placeholder="Cari ID atau judul tugas..."
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-blue-500/50 transition-colors ${isDark ? 'bg-slate-900/60 border-slate-800/60 text-white placeholder:text-slate-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                    />
                </div>
                <button className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-300 hover:text-white hover:border-slate-700' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300'}`}>
                    <Filter className="w-4 h-4" /> Filter Status
                </button>
            </motion.div>

            {/* List Pesanan */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`rounded-2xl border overflow-hidden shadow-xl ${isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200'}`}>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase border-b ${isDark ? 'text-slate-400 bg-slate-900/50 border-slate-800/60' : 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                            <tr>
                                <th className="px-6 py-4">ID Pesanan</th>
                                <th className="px-6 py-4">Judul Tugas</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Harga</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800/60 text-slate-300' : 'divide-gray-200 text-gray-700'}`}>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}`}>
                                        <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{order.order_id_custom}</td>
                                        <td className="px-6 py-4">
                                            <p className={`font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.judul_tugas}</p>
                                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Dibuat: {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border ${statusBadge(order.status_pengerjaan)}`}>
                                                    {formatStatusText(order.status_pengerjaan)}
                                                </span>

                                                {/* TAMPILAN BINTANG KALAU UDAH DIRATING */}
                                                {order.rating && (
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                                        <Star className="w-3 h-3 fill-amber-500" /> {order.rating}/5
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                                            {formatRupiah(order.harga_total)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* TOMBOL BERI ULASAN (Muncul kalau selesai & belum dirating) */}
                                                {order.status_pengerjaan === 'DONE' && !order.rating && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrderId(order.id);
                                                            setIsRatingModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-white font-bold text-[11px] rounded-lg transition-colors shadow-lg shadow-amber-500/20"
                                                    >
                                                        <Star className="w-3.5 h-3.5 fill-current" /> Nilai
                                                    </button>
                                                )}

                                                <Link to={`/dashboard/pesanan/${order.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 font-bold text-xs rounded-lg transition-colors">
                                                    <Eye className="w-4 h-4" /> Detail
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        Anda belum memiliki pesanan. <Link to="/dashboard/buat-pesanan" className="text-blue-500 hover:underline font-bold">Buat sekarang</Link>.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className={`md:hidden divide-y ${isDark ? 'divide-slate-800/60' : 'divide-gray-200'}`}>
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <div key={order.id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{order.order_id_custom}</p>
                                        <h4 className={`font-bold line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.judul_tugas}</h4>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge(order.status_pengerjaan)}`}>
                                            {formatStatusText(order.status_pengerjaan)}
                                        </span>
                                        {/* TAMPILAN BINTANG DI MOBILE */}
                                        {order.rating && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                                                <Star className="w-3 h-3 fill-amber-500" /> {order.rating}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-end pt-2">
                                    <div>
                                        <p className={`text-xs mb-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Harga</p>
                                        <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{formatRupiah(order.harga_total)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* TOMBOL NILAI DI MOBILE */}
                                        {order.status_pengerjaan === 'DONE' && !order.rating && (
                                            <button
                                                onClick={() => {
                                                    setSelectedOrderId(order.id);
                                                    setIsRatingModalOpen(true);
                                                }}
                                                className="px-3 py-2 bg-amber-500 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-amber-500/20"
                                            >
                                                NILAI
                                            </button>
                                        )}
                                        <Link to={`/dashboard/pesanan/${order.id}`} className="px-4 py-2 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-lg border border-blue-500/20">Detail</Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            Tidak ada pesanan yang cocok dengan pencarian.
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}