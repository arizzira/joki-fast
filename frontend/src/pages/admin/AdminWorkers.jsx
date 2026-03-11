import { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, Loader2, ExternalLink, ShieldAlert, FileText } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminWorkers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const { isDark } = useTheme();

    const fetchWorkers = async () => {
        try {
            const token = localStorage.getItem('jokifast_token');
            const res = await axios.get(`${API_URL}/api/admin/workers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setWorkers(res.data.data);
            }
        } catch (error) {
            console.error("Gagal load workers:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchWorkers(); }, []);

    const handleUpdateStatus = async (id, status) => {
        const actionText = status === 'APPROVED' ? 'Menerima' : 'Menolak';
        if (!confirm(`Yakin ingin ${actionText} mitra ini?`)) return;

        setProcessingId(id);
        try {
            const token = localStorage.getItem('jokifast_token');
            const res = await axios.put(`${API_URL}/api/admin/workers/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                fetchWorkers(); // Refresh tabel
            }
        } catch (error) {
            alert(error.response?.data?.message || "Gagal mengupdate status.");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>Aktif</span>;
            case 'REJECTED':
                return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200'}`}>Ditolak</span>;
            default:
                return <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>Menunggu Review</span>;
        }
    };

    if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;

    return (
        <div className={`max-w-6xl mx-auto space-y-6 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <div>
                    <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        <Users className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} /> Verifikasi Mitra (Worker)
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Review profil, keahlian, dan portofolio calon eksekutor tugas.</p>
                </div>
            </div>

            <div className={`rounded-2xl shadow-xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className={`text-xs uppercase tracking-wider border-b ${isDark ? 'bg-slate-950/50 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            <tr>
                                <th className="px-6 py-4">Nama & Kontak</th>
                                <th className="px-6 py-4">Latar Belakang</th>
                                <th className="px-6 py-4 text-center">CV / Portfolio</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                            {workers.length === 0 ? (
                                <tr><td colSpan="5" className={`px-6 py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Belum ada data mitra terdaftar.</td></tr>
                            ) : (
                                workers.map((w) => (
                                    <tr key={w.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{w.nama}</p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{w.email}</p>
                                            {w.whatsappNumber && <p className={`text-[10px] mt-1 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>WA: {w.whatsappNumber}</p>}
                                        </td>
                                        <td className="px-6 py-4 min-w-[200px]">
                                            {w.keahlian ? (
                                                <>
                                                    <p className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>{w.keahlian}</p>
                                                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{w.univ || 'Umum / Profesional'}</p>
                                                </>
                                            ) : (
                                                <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded w-fit border ${isDark ? 'text-amber-500/80 bg-amber-500/10 border-amber-500/20' : 'text-amber-600 bg-amber-50 border-amber-200'}`}>
                                                    <ShieldAlert className="w-3 h-3" /> Belum Isi Onboarding
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {w.portfolio_link ? (
                                                <a href={w.portfolio_link} target="_blank" rel="noopener noreferrer"
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-all text-xs font-bold shadow-sm ${isDark
                                                        ? 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20'
                                                        : 'bg-white hover:bg-slate-50 text-blue-600 border-slate-200'
                                                        }`}>
                                                    <FileText className="w-3.5 h-3.5" /> Buka Link <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            {getStatusBadge(w.status_worker)}
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            {processingId === w.id ? (
                                                <Loader2 className={`w-5 h-5 animate-spin ml-auto ${isDark ? 'text-indigo-500' : 'text-indigo-600'}`} />
                                            ) : w.status_worker === 'PENDING' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleUpdateStatus(w.id, 'APPROVED')} title="Terima Mitra"
                                                        className={`p-2 rounded-lg transition-colors border shadow-sm ${isDark
                                                            ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-transparent hover:border-emerald-500/30'
                                                            : 'bg-white text-emerald-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50'
                                                            }`}>
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button onClick={() => handleUpdateStatus(w.id, 'REJECTED')} title="Tolak Mitra"
                                                        className={`p-2 rounded-lg transition-colors border shadow-sm ${isDark
                                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-transparent hover:border-red-500/30'
                                                            : 'bg-white text-red-600 border-slate-200 hover:border-red-300 hover:bg-red-50'
                                                            }`}>
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end">
                                                    {/* Tombol kalau admin mau cabut statusnya */}
                                                    <button onClick={() => handleUpdateStatus(w.id, w.status_worker === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                                                        className={`text-[10px] underline underline-offset-2 ${isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                                                        Ubah ke {w.status_worker === 'APPROVED' ? 'Tolak' : 'Aktif'}
                                                    </button>
                                                </div>
                                            )}
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