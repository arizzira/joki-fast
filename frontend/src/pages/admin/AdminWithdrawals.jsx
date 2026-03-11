import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, Loader2, Clock, Landmark, MessageCircle } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { useTheme } from '../../context/ThemeContext';


export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const { isDark } = useTheme();

    const fetchWithdrawals = async () => {
        try {
            const res = await axiosInstance.get('/admin/withdrawals');
            if (res.data.success) {
                setWithdrawals(res.data.data);
            }
        } catch (error) {
            console.error("Gagal load withdrawals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleUpdateStatus = async (id, status, isReject = false) => {
        let catatan = '';
        if (isReject) {
            catatan = prompt("Masukkan alasan penolakan (contoh: Rekening tidak valid):");
            if (catatan === null) return; // Batal kalau klik cancel
        } else {
            if (!confirm(`Yakin tandai penarikan ini sebagai ${status}?`)) return;
        }

        setProcessingId(id);
        try {
            const res = await axiosInstance.put(`/admin/withdrawals/${id}`, { status, catatan_admin: catatan });

            if (res.data.success) {
                fetchWithdrawals(); // Refresh data
            }
        } catch (error) {
            alert(error.response?.data?.message || "Gagal mengupdate status.");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'COMPLETED':
                return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>Selesai</span>;
            case 'PROCESSING':
                return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>Diproses</span>;
            case 'REJECTED':
                return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'}`}>Ditolak</span>;
            default:
                return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>Pending</span>;
        }
    };

    const formatRp = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;

    return (
        <div className={`max-w-6xl mx-auto space-y-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <CreditCard className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} /> Permintaan Pencairan Dana
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Kelola transfer pencairan saldo ke rekening mitra.</p>
                </div>
            </div>

            <div className={`rounded-2xl shadow-xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className={`text-xs uppercase tracking-wider border-b ${isDark ? 'bg-slate-950/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Mitra (Worker)</th>
                                <th className="px-6 py-4">Rekening Tujuan</th>
                                <th className="px-6 py-4">Nominal</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {withdrawals.length === 0 ? (
                                <tr><td colSpan="6" className={`px-6 py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Belum ada riwayat penarikan.</td></tr>
                            ) : (
                                withdrawals.map((wd) => (
                                    <tr key={wd.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                        <td className={`px-6 py-4 whitespace-nowrap text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            {new Date(wd.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{wd.worker?.nama}</p>
                                            <p className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{wd.worker?.email}</p>

                                            {/* KITA BIKIN JARING PENANGKAP WA BIAR GAK LOLOS */}
                                            {(wd.no_wa || wd.nomor_wa || wd.whatsapp || wd.worker?.whatsappNumber) && (
                                                <a
                                                    href={`https://wa.me/${(wd.no_wa || wd.nomor_wa || wd.whatsapp || wd.worker?.whatsappNumber).replace(/^0/, '62')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold transition-colors ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'
                                                        }`}
                                                >
                                                    <MessageCircle className="w-3 h-3" /> {(wd.no_wa || wd.nomor_wa || wd.whatsapp || wd.worker?.whatsappNumber)}
                                                </a >
                                            )}
                                        </td >
                                        <td className="px-6 py-4 min-w-[250px]">
                                            <div className="flex items-center gap-2">
                                                <Landmark className={`w-4 h-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                                                <div>
                                                    <p className={`font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{wd.bank}</p>
                                                    <p className={`font-mono text-xs tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{wd.no_rekening}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={`px-6 py-4 font-bold whitespace-nowrap ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                            {formatRp(wd.amount)}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {getStatusBadge(wd.status)}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {processingId === wd.id ? (
                                                <Loader2 className={`w-5 h-5 animate-spin ml-auto ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`} />
                                            ) : wd.status === 'PENDING' || wd.status === 'PROCESSING' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    {wd.status === 'PENDING' && (
                                                        <button onClick={() => handleUpdateStatus(wd.id, 'PROCESSING')} title="Tandai Sedang Diproses"
                                                            className={`p-2 rounded-lg transition-colors border shadow-sm ${isDark
                                                                ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-transparent hover:border-blue-500/30'
                                                                : 'bg-white text-blue-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'
                                                                }`}>
                                                            <Clock className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button onClick={() => handleUpdateStatus(wd.id, 'COMPLETED')} title="Transfer Selesai"
                                                        className={`p-2 rounded-lg transition-colors border shadow-sm ${isDark
                                                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-transparent hover:border-emerald-500/30'
                                                            : 'bg-white text-emerald-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                                            }`}>
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(wd.id, 'REJECTED', true)} title="Tolak & Refund"
                                                        className={`p-2 rounded-lg transition-colors border shadow-sm ${isDark
                                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-transparent hover:border-red-500/30'
                                                            : 'bg-white text-red-600 border-slate-200 hover:border-red-300 hover:bg-red-50'
                                                            }`}>
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>-</span>
                                            )}
                                        </td>
                                    </tr >
                                ))
                            )}
                        </tbody >
                    </table >
                </div >
            </div >
        </div >
    );
}