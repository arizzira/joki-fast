import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowDownRight, ArrowUpRight, TrendingUp, History, Loader2, FileText, X, AlertCircle, CheckCircle, Building, CreditCard, Phone } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
};

export default function Pendapatan() {
    const { isDark } = useTheme();
    const [orders, setOrders] = useState([]);
    const [withdrawals, setWithdrawals] = useState([]);
    const [loading, setLoading] = useState(true);

    // State buat Modal Withdraw & Rekening
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bank, setBank] = useState('');
    const [noRekening, setNoRekening] = useState('');
    const [whatsapp, setWhatsapp] = useState(''); // 👇 STATE BARU BUAT WA

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalMessage, setModalMessage] = useState({ type: '', text: '' });

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('jokifast_token');

            // Ambil data User dari localStorage buat auto-fill Bank, Rekening, dan WA
            const storedUser = JSON.parse(localStorage.getItem('jokifast_user') || '{}');
            if (storedUser.bank) setBank(storedUser.bank);
            if (storedUser.no_rekening) setNoRekening(storedUser.no_rekening);
            if (storedUser.whatsappNumber) setWhatsapp(storedUser.whatsappNumber); // 👇 AUTO-FILL WA

            // Fetch Orders
            const resOrders = await fetch(`${API_URL}/api/orders/worker`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resultOrders = await resOrders.json();
            if (resultOrders.success) setOrders(resultOrders.data);

            // Fetch Withdrawals
            const resWd = await fetch(`${API_URL}/api/withdraw/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resultWd = await resWd.json();
            if (resultWd.success) setWithdrawals(resultWd.data);

        } catch (error) {
            console.error("Gagal ambil data pendapatan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Kalkulasi Pendapatan
    const completedOrders = orders.filter(o => o.status_pengerjaan === 'DONE');
    const inProgressOrders = orders.filter(o => o.status_pengerjaan === 'ON_PROGRESS' || o.status_pengerjaan === 'REVIEW');

    const totalEarned = completedOrders.reduce((sum, o) => sum + (o.harga_total * 0.8), 0);
    const pendingEarnings = inProgressOrders.reduce((sum, o) => sum + (o.harga_total * 0.8), 0);

    const totalWithdrawn = withdrawals.reduce((sum, w) => w.status !== 'REJECTED' ? sum + w.amount : sum, 0);
    const currentSaldo = totalEarned - totalWithdrawn;

    const orderTransactions = completedOrders.map(o => ({
        id: o.order_id_custom,
        rawDate: new Date(o.createdAt),
        date: new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        desc: `Upah Tugas — ${o.judul_tugas}`,
        amount: o.harga_total * 0.8,
        type: 'IN',
        status: 'COMPLETED'
    }));

    const wdTransactions = withdrawals.map(w => ({
        id: w.id.substring(0, 8).toUpperCase(),
        rawDate: new Date(w.createdAt),
        date: new Date(w.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        desc: `Penarikan Dana ke ${w.bank}`,
        amount: w.amount,
        type: 'OUT',
        status: w.status
    }));

    const transactions = [...orderTransactions, ...wdTransactions].sort((a, b) => b.rawDate - a.rawDate);

    const handleWithdrawSubmit = async (e) => {
        e.preventDefault();
        setModalMessage({ type: '', text: '' });

        // Jaga-jaga kalau withdrawAmount bentuknya angka, kita paksa jadi string
        const nominalStr = String(withdrawAmount).replace(/\D/g, '');
        const nominal = parseInt(nominalStr);

        if (!bank.trim()) return setModalMessage({ type: 'error', text: 'Nama Bank wajib diisi!' });
        if (!noRekening.trim()) return setModalMessage({ type: 'error', text: 'Nomor Rekening wajib diisi!' });
        if (!whatsapp || String(whatsapp).trim().length < 10) return setModalMessage({ type: 'error', text: 'Nomor WA tidak valid!' });
        if (!nominal || nominal < 50000) return setModalMessage({ type: 'error', text: 'Minimal penarikan Rp 50.000' });
        if (nominal > currentSaldo) return setModalMessage({ type: 'error', text: 'Saldo tidak mencukupi.' });

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('jokifast_token');

            // 1. UPDATE PROFILE DULU
            await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ bank: bank, no_rekening: noRekening, whatsappNumber: whatsapp })
            });

            // 2. TEMBAK REQUEST WITHDRAW
            const res = await fetch(`${API_URL}/api/withdraw/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    amount: nominal,
                    bank: bank,
                    no_rekening: noRekening,
                    whatsapp: whatsapp
                })
            });

            // CEK KALAU SERVER NGASIH ERROR HTML BUKAN JSON
            if (!res.ok && res.headers.get("content-type")?.indexOf("application/json") === -1) {
                throw new Error(`Server nyasar! Status: ${res.status}. Rute API mungkin salah.`);
            }

            const data = await res.json();

            if (data.success) {
                setModalMessage({ type: 'success', text: 'Berhasil! Permintaan diproses dalam 1x24 Jam.' });

                const storedUser = JSON.parse(localStorage.getItem('jokifast_user') || '{}');
                storedUser.bank = bank;
                storedUser.no_rekening = noRekening;
                storedUser.whatsappNumber = whatsapp;
                localStorage.setItem('jokifast_user', JSON.stringify(storedUser));

                setWithdrawAmount('');
                fetchData();

                setTimeout(() => {
                    setIsModalOpen(false);
                    setModalMessage({ type: '', text: '' });
                }, 3000);
            } else {
                setModalMessage({ type: 'error', text: data.message });
            }
        } catch (err) {
            // 👇 INI DIA TERSANGKA UTAMANYA KITA MUNCULIN KE CONSOLE 👇
            console.error("🔥 ERROR ASLI DARI FRONTEND:", err);
            setModalMessage({ type: 'error', text: `Error: ${err.message}. Cek Console (F12) Bro!` });
        } finally {
            setIsSubmitting(false);
        }
    };

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200 shadow-sm';
    const tableHeadBg = isDark ? 'bg-slate-950/50 border-slate-800/60 text-slate-400' : 'bg-gray-50 border-gray-200 text-gray-500';
    const tableBorder = isDark ? 'divide-slate-800/60' : 'divide-gray-200';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full overflow-hidden space-y-6 sm:space-y-8 pb-10">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-4 sm:mt-0">
                <div>
                    <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textPrimary} flex items-center gap-2`}>
                        <Wallet className="w-8 h-8 text-emerald-500" /> Pendapatan
                    </h1>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Kelola dompet dan riwayat transaksi hasil keringat Anda.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                    <ArrowUpRight className="w-5 h-5" /> Tarik Saldo
                </button>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`p-6 rounded-2xl border relative overflow-hidden group ${isDark ? 'bg-slate-900/80 backdrop-blur-xl border-emerald-500/30' : 'bg-white border-emerald-200 shadow-sm'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-24 h-24 text-emerald-500 rotate-12" />
                    </div>
                    <p className="text-sm font-medium text-emerald-500/80 mb-2 relative z-10">Total Saldo Aktif</p>
                    <h2 className={`text-3xl font-bold tracking-tight relative z-10 ${textPrimary}`}>{formatRupiah(currentSaldo)}</h2>
                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 w-fit px-2.5 py-1 rounded-lg relative z-10 border border-emerald-500/20">
                        <TrendingUp className="w-3.5 h-3.5" /> Bisa ditarik kapan saja
                    </div>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className={`p-6 rounded-2xl border ${cardBg}`}>
                    <p className={`text-sm font-medium mb-2 ${textSecondary}`}>Menunggu Pembayaran (Hold)</p>
                    <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{formatRupiah(pendingEarnings)}</h2>
                    <p className={`mt-4 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Dari {inProgressOrders.length} tugas aktif</p>
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className={`p-6 rounded-2xl border sm:col-span-2 md:col-span-1 ${cardBg}`}>
                    <p className={`text-sm font-medium mb-2 ${textSecondary}`}>Total Tugas Ditangani</p>
                    <h2 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{orders.length}</h2>
                    <p className={`mt-4 text-xs font-medium ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Sepanjang masa</p>
                </motion.div>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className={`rounded-2xl border overflow-hidden shadow-xl w-full ${cardBg}`}>
                <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-gray-100 bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${textPrimary}`}>
                        <History className="w-5 h-5 text-emerald-500" /> Riwayat Transaksi
                    </h3>
                </div>

                {transactions.length === 0 ? (
                    <div className="py-12 text-center px-4">
                        <FileText className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                        <p className={`text-sm ${textSecondary}`}>Belum ada riwayat pendapatan atau penarikan.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full text-sm text-left min-w-[650px]">
                            <thead className={`text-xs uppercase border-b whitespace-nowrap ${tableHeadBg}`}>
                                <tr>
                                    <th className="px-4 sm:px-6 py-4">ID / Tanggal</th>
                                    <th className="px-4 sm:px-6 py-4">Deskripsi</th>
                                    <th className="px-4 sm:px-6 py-4">Tipe</th>
                                    <th className="px-4 sm:px-6 py-4 text-right">Nominal</th>
                                    <th className="px-4 sm:px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${tableBorder} ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                                {transactions.map((trx, idx) => (
                                    <tr key={idx} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}`}>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <p className={`font-mono text-xs ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{trx.id}</p>
                                            <p className="text-[10px] mt-1">{trx.date}</p>
                                        </td>
                                        <td className={`px-4 sm:px-6 py-4 font-medium max-w-[150px] sm:max-w-[250px] truncate ${textPrimary}`}>{trx.desc}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            {trx.type === 'IN' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                                                    <ArrowDownRight className="w-3.5 h-3.5" /> MASUK
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                                                    <ArrowUpRight className="w-3.5 h-3.5" /> KELUAR
                                                </span>
                                            )}
                                        </td>
                                        <td className={`px-4 sm:px-6 py-4 font-bold text-right whitespace-nowrap ${trx.type === 'IN' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {trx.type === 'IN' ? '+' : '-'}{formatRupiah(trx.amount)}
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                                            {trx.status === 'COMPLETED' ? (
                                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 text-emerald-500 border-emerald-500/20">SUCCESS</span>
                                            ) : trx.status === 'PENDING' ? (
                                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-amber-500/10 text-amber-500 border-amber-500/20">PENDING</span>
                                            ) : trx.status === 'PROCESSING' ? (
                                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 text-blue-500 border-blue-500/20">DIPROSES</span>
                                            ) : (
                                                <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-red-500/10 text-red-500 border-red-500/20">REJECTED</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>

            {/* MODAL TARIK SALDO DENGAN FORM BANK & WA */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => !isSubmitting && setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className={`relative w-full max-w-lg p-5 sm:p-8 rounded-3xl shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'} max-h-[90vh] overflow-y-auto custom-scrollbar`}
                        >
                            <button onClick={() => !isSubmitting && setIsModalOpen(false)} className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-900'}`}>
                                <X className="w-5 h-5" />
                            </button>

                            <h3 className={`text-xl font-bold mb-1 ${textPrimary}`}>Tarik Saldo</h3>
                            <p className={`text-sm mb-6 ${textSecondary}`}>Saldo aktif Anda: <strong className="text-emerald-500">{formatRupiah(currentSaldo)}</strong></p>

                            {modalMessage.text && (
                                <div className={`p-3.5 rounded-xl mb-5 flex items-start gap-2.5 text-sm font-medium ${modalMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {modalMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
                                    <p className="leading-relaxed">{modalMessage.text}</p>
                                </div>
                            )}

                            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-[11px] font-bold mb-1.5 uppercase tracking-wider ${textSecondary}`}>Nama Bank / E-Wallet</label>
                                        <div className="relative">
                                            <Building className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                                            <input
                                                type="text" required placeholder="BCA / DANA / GOTO"
                                                value={bank} onChange={(e) => setBank(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={`block text-[11px] font-bold mb-1.5 uppercase tracking-wider ${textSecondary}`}>Nomor Rekening</label>
                                        <div className="relative">
                                            <CreditCard className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                                            <input
                                                type="text" required placeholder="0812345678 / 1234567"
                                                value={noRekening} onChange={(e) => setNoRekening(e.target.value)}
                                                className={`w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* 👇 FORM WHATSAPP BARU 👇 */}
                                <div className="pt-2">
                                    <label className={`block text-[11px] font-bold mb-1.5 uppercase tracking-wider ${textSecondary}`}>Nomor WhatsApp</label>
                                    <div className="relative">
                                        <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                                        <input
                                            type="tel" required placeholder="081234567890"
                                            value={whatsapp}
                                            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))} // Cuma terima angka
                                            className={`w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Admin akan menghubungi nomor ini jika ada kendala transfer.</p>
                                </div>

                                <div className="pt-2">
                                    <label className={`block text-[11px] font-bold mb-1.5 uppercase tracking-wider ${textSecondary}`}>Nominal Penarikan</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                                        <input
                                            type="text" required
                                            value={withdrawAmount}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                setWithdrawAmount(val ? new Intl.NumberFormat('id-ID').format(val) : '');
                                            }}
                                            placeholder="50.000"
                                            className={`w-full pl-12 pr-4 py-3.5 text-lg font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark ? 'bg-slate-950 border border-slate-800 text-white placeholder-slate-700' : 'bg-slate-50 border border-slate-200 text-slate-900'}`}
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center mt-2 px-1">
                                        <p className="text-[10px] text-amber-500 font-medium">Min. penarikan Rp 50.000</p>
                                        <button type="button" onClick={() => setWithdrawAmount(new Intl.NumberFormat('id-ID').format(currentSaldo))} className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider">Tarik Semua</button>
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting || !withdrawAmount} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex justify-center items-center gap-2 mt-4">
                                    {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : 'Konfirmasi Penarikan'}
                                </button>
                                <p className={`text-center text-[10px] mt-3 ${textSecondary}`}>*Penarikan akan diproses ke rekening tujuan maksimal dalam 1x24 jam kerja.</p>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}