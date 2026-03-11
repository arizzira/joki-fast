import { useState, useEffect } from 'react';
import { ShoppingCart, Loader2, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosInstance';


export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { isDark } = useTheme();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosInstance.get('/admin/orders');
                if (res.data.success) {
                    setOrders(res.data.data);
                }
            } catch (error) {
                console.error("Gagal load orders:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

    const getStatusPengerjaanBadge = (status) => {
        const badges = {
            'WAITING_WORKER': isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-100 text-slate-600 border-slate-200',
            'NEGOTIATION': isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200',
            'ON_PROGRESS': isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200',
            'REVIEW': isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-600 border-purple-200',
            'DONE': isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200',
            'CANCELLED': isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'
        };
        const color = badges[status] || (isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-500');
        return <span className={`px-2 py-1 border rounded-md text-[9px] font-bold uppercase tracking-wider ${color}`}>{status.replace('_', ' ')}</span>;
    };

    const getStatusPembayaranBadge = (status) => {
        const badges = {
            'BELUM_DP': isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200',
            'DP_DIBAYAR': isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200',
            'LUNAS': isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
        };
        const color = badges[status] || (isDark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-500');
        return <span className={`px-2 py-1 border rounded-md text-[9px] font-bold uppercase tracking-wider ${color}`}>{status.replace('_', ' ')}</span>;
    };

    // Fitur pencarian simple berdasarkan ID atau Judul Tugas
    const filteredOrders = orders.filter(o =>
        o.order_id_custom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.judul_tugas.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;

    return (
        <div className={`max-w-7xl mx-auto space-y-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <ShoppingCart className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} /> Semua Pesanan
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pantau seluruh transaksi dan pengerjaan tugas di platform.</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <input
                        type="text"
                        placeholder="Cari ID atau Judul..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isDark
                            ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:bg-slate-800'
                            : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-slate-50 shadow-sm'
                            }`}
                    />
                </div>
            </div>

            <div className={`rounded-2xl shadow-xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className={`text-[11px] uppercase tracking-wider border-b ${isDark ? 'bg-slate-950/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            <tr>
                                <th className="px-5 py-4">ID & Judul Tugas</th>
                                <th className="px-5 py-4">Klien (Pemesan)</th>
                                <th className="px-5 py-4">Mitra (Eksekutor)</th>
                                <th className="px-5 py-4 text-right">Harga Deal</th>
                                <th className="px-5 py-4 text-center">Status Bayar</th>
                                <th className="px-5 py-4 text-center">Status Tugas</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan="6" className={`px-6 py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Tidak ada data pesanan.</td></tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                        <td className="px-5 py-4 min-w-[200px]">
                                            <p className={`font-mono text-xs font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{order.order_id_custom}</p>
                                            <p className={`font-semibold mt-1 line-clamp-1 max-w-[250px] ${isDark ? 'text-white' : 'text-slate-900'}`}>{order.judul_tugas}</p>
                                            <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </td>
                                        <td className="px-5 py-4 min-w-[200px]">
                                            <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{order.client?.nama || 'Unknown'}</p>
                                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{order.client?.email}</p>
                                        </td>
                                        <td className="px-5 py-4 min-w-[200px]">
                                            {order.worker ? (
                                                <>
                                                    <p className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{order.worker.nama}</p>
                                                    <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{order.worker.email}</p>
                                                </>
                                            ) : (
                                                <span className={`text-xs italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Belum ada</span>
                                            )}
                                        </td>
                                        <td className={`px-5 py-4 text-right font-bold whitespace-nowrap ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                            {formatRp(order.harga_deal || order.harga_total)}
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            {getStatusPembayaranBadge(order.status_pembayaran)}
                                        </td>
                                        <td className="px-5 py-4 text-center whitespace-nowrap">
                                            {getStatusPengerjaanBadge(order.status_pengerjaan)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}