import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom';
import { ClipboardList, Eye, Loader2, FileText } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const statusBadge = (status, isDark) => {
    switch (status) {
        case 'NEGOTIATION': return isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200';
        case 'ON_PROGRESS': return isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200';
        case 'REVIEW': return isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200';
        case 'DONE': return isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
        default: return isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-gray-100 text-gray-500 border-gray-200';
    }
};

const statusLabel = (status) => {
    switch (status) {
        case 'NEGOTIATION': return 'NEGOSIASI';
        case 'ON_PROGRESS': return 'DIKERJAKAN';
        case 'REVIEW': return 'REVIEW';
        case 'DONE': return 'SELESAI';
        default: return status;
    }
};

const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num * 0.8 || 0);
};

const extractInfo = (descString) => {
    const regex = /\[Tipe: (.*?) \| Deadline: (.*?)\]/;
    const match = descString?.match(regex);
    return { type: match ? match[1] : '-', deadline: match ? match[2] : '-' };
};

export default function TugasAktif() {
    const { isDark } = useTheme();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkerOrders = async () => {
            try {
                const res = await axiosInstance.get('/orders/worker');
                if (res.data.success) setOrders(res.data.data);
            } catch (error) {
                console.error("Gagal ambil tugas aktif:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkerOrders();
    }, []);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200';
    const tableBorder = isDark ? 'divide-slate-800/60' : 'divide-gray-200';
    const tableHeadBg = isDark ? 'bg-slate-900/50 border-slate-800/60 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-500';
    const hoverRow = isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textPrimary} flex items-center gap-2`}>
                    <ClipboardList className="w-8 h-8 text-emerald-500" /> Tugas Aktif
                </h1>
                <p className={`text-sm mt-1 ${textSecondary}`}>Pantau progres pekerjaan yang sedang Anda tangani.</p>
            </motion.div>

            {orders.length === 0 ? (
                <motion.div variants={fadeUp} initial="hidden" animate="visible"
                    className={`py-16 text-center border border-dashed rounded-2xl ${isDark ? 'border-slate-800 bg-slate-900/20' : 'border-gray-300 bg-gray-50'}`}
                >
                    <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                    <h3 className={`text-lg font-bold ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Belum Ada Tugas</h3>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Ambil tugas dari Bursa Tugas untuk mulai bekerja.</p>
                </motion.div>
            ) : (
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className={`text-xs uppercase border-b ${tableHeadBg}`}>
                                <tr>
                                    <th className="px-6 py-4">ID Pesanan</th>
                                    <th className="px-6 py-4">Informasi Tugas</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Upah</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${tableBorder} ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                                {orders.map((task) => {
                                    const { deadline } = extractInfo(task.deskripsi);
                                    return (
                                        <tr key={task.id} className={`transition-colors ${hoverRow}`}>
                                            <td className={`px-6 py-4 font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{task.order_id_custom}</td>
                                            <td className="px-6 py-4">
                                                <p className={`font-bold line-clamp-1 ${textPrimary}`}>{task.judul_tugas}</p>
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Klien: {task.client?.nama || task.nama_klien}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] w-max font-bold tracking-wider uppercase border ${statusBadge(task.status_pengerjaan, isDark)}`}>
                                                        {statusLabel(task.status_pengerjaan)}
                                                    </span>
                                                    <span className={`text-[10px] font-medium ${task.status_pembayaran === 'DP_DIBAYAR' || task.status_pembayaran === 'LUNAS' ? 'text-emerald-500' : isDark ? 'text-red-400' : 'text-red-500'}`}>
                                                        {task.status_pembayaran === 'LUNAS' ? '💰 Lunas' : task.status_pembayaran === 'DP_DIBAYAR' ? '💰 DP OK' : '⏳ Belum DP'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-emerald-500">
                                                {formatRupiah(task.harga_deal || task.harga_total)}
                                                <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>DL: {deadline}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link to={`/carrier/dashboard/detail/${task.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-semibold rounded-lg transition-colors border border-emerald-500/20 shadow-sm"
                                                >
                                                    <Eye className="w-4 h-4" /> Buka Workspace
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className={`md:hidden divide-y ${tableBorder}`}>
                        {orders.map((task) => {
                            const { deadline } = extractInfo(task.deskripsi);
                            return (
                                <div key={task.id} className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className={`text-[10px] font-mono mb-1 px-1.5 py-0.5 rounded ${isDark ? 'text-slate-500 bg-slate-950' : 'text-gray-400 bg-gray-100'}`}>{task.order_id_custom}</p>
                                            <h4 className={`font-bold line-clamp-2 text-sm ${textPrimary}`}>{task.judul_tugas}</h4>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`shrink-0 inline-flex px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${statusBadge(task.status_pengerjaan, isDark)}`}>
                                                {statusLabel(task.status_pengerjaan)}
                                            </span>
                                            <span className={`text-[9px] font-medium ${task.status_pembayaran === 'DP_DIBAYAR' || task.status_pembayaran === 'LUNAS' ? 'text-emerald-500' : isDark ? 'text-red-400' : 'text-red-500'}`}>
                                                {task.status_pembayaran === 'LUNAS' ? '💰 Lunas' : task.status_pembayaran === 'DP_DIBAYAR' ? '💰 DP OK' : '⏳ Belum DP'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`flex justify-between items-end pt-2 border-t ${isDark ? 'border-slate-800/40' : 'border-gray-200'}`}>
                                        <div>
                                            <p className={`text-[10px] mb-0.5 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Upah Proyek</p>
                                            <p className="text-sm font-bold text-emerald-500">{formatRupiah(task.harga_deal || task.harga_total)}</p>
                                        </div>
                                        <Link to={`/carrier/dashboard/detail/${task.id}`}
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-xs font-bold rounded-lg border border-emerald-500/20 transition-all flex items-center gap-1.5"
                                        >
                                            <Eye className="w-3 h-3" /> Workspace
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
