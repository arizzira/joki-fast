import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, QrCode, Clock, CheckCircle2, FileText, UploadCloud, AlertCircle, Loader2, Paperclip, MessageCircle, RotateCcw, ShieldCheck, Eye, Link2, X, Image } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosInstance';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);

export default function DetailPesanan() {
    const { isDark } = useTheme();
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState([]);
    const [accepting, setAccepting] = useState(false);
    const [revising, setRevising] = useState(false);
    const [revisionNote, setRevisionNote] = useState('');
    const [showRevisionForm, setShowRevisionForm] = useState(false);

    // Preview state
    const [previewResult, setPreviewResult] = useState(null);

    const token = localStorage.getItem('jokifast_token');

    const fetchOrder = async () => {
        try {
            const res = await axiosInstance.get(`/orders/${id}`);
            if (res.data.success) setOrder(res.data.data);
        } catch (error) { console.error("Gagal fetch:", error); }
        finally { setLoading(false); }
    };

    const fetchInvoices = async () => {
        try {
            const res = await axiosInstance.get(`/invoices/order/${id}`);
            if (res.data.success) setInvoices(res.data.data);
        } catch (error) { console.error("Gagal fetch invoices:", error); }
    };

    useEffect(() => { fetchOrder(); fetchInvoices(); window.scrollTo(0, 0); }, [id]);

    const handleAccept = async () => {
        if (!confirm('Terima hasil tugas ini? Invoice pelunasan akan otomatis dibuat.')) return;
        setAccepting(true);
        try {
            const res = await axiosInstance.put(`/orders/${id}/accept`);
            if (res.data.success) { await fetchOrder(); await fetchInvoices(); }
            else alert(res.data.message);
        } catch (e) { console.error(e); }
        finally { setAccepting(false); }
    };

    const handleRevision = async () => {
        setRevising(true);
        try {
            const res = await axiosInstance.post(`/orders/${id}/revision`, { catatan: revisionNote });
            if (res.data.success) { setShowRevisionForm(false); setRevisionNote(''); await fetchOrder(); }
            alert(res.data.message);
        } catch (e) { console.error(e); }
        finally { setRevising(false); }
    };

    // ============================================================
    // FUNGSI BARU: Nembak Midtrans Snap
    // ============================================================
    // ============================================================
    // FUNGSI BARU: Nembak Midtrans Snap + Hack Bypass Localhost
    // ============================================================
    const handleBayarMidtrans = async (tipeTagihan) => {
        try {
            let invoiceId = null;

            try {
                // 1. Coba create invoice baru
                const resCreate = await axiosInstance.post('/invoices/create', { order_id: id, tipe: tipeTagihan });
                invoiceId = resCreate.data.data?.id;
            } catch (err) {
                // Kalo error 400 (invoice udah ada), ambil ID dari response error atau dari state invoices kita
                if (err.response && err.response.status === 400 && err.response.data.data) {
                    invoiceId = err.response.data.data.id;
                } else if (err.response && err.response.status === 400) {
                    const existing = invoices.find(i => i.tipe === tipeTagihan);
                    if (existing) invoiceId = existing.id;
                } else {
                    throw err; // Lempar ke catch blok utama kalo error lain
                }
            }

            // 2. Minta Token Midtrans
            const resToken = await axiosInstance.post('/invoices/pay-midtrans', { orderId: id, tipe: tipeTagihan });

            if (resToken.data.success && resToken.data.token) {
                // 3. Panggil Pop-Up Midtrans 🪄
                window.snap.pay(resToken.data.token, {
                    onSuccess: async function (result) {

                        // 🔥 JALUR PINTAS LOCALHOST: 
                        // Kasih tau backend secara manual kalau kita udah sukses bayar
                        if (invoiceId) {
                            await axiosInstance.put(`/invoices/${invoiceId}/verify`);
                        }

                        alert("Pembayaran Sukses Bro! 🎉");
                        window.location.reload();
                    },
                    onPending: function (result) {
                        alert("Menunggu pembayaran diselesaikan.");
                    },
                    onError: function (result) {
                        alert("Pembayaran gagal. Silakan coba lagi.");
                    },
                    onClose: function () {
                        console.log('Pop-up ditutup oleh user');
                    }
                });
            } else {
                alert(resToken.data.message || "Gagal mendapatkan token pembayaran.");
            }
        } catch (error) {
            console.error("Midtrans Error:", error);
            alert("Terjadi kesalahan pada server pembayaran: " + (error.response?.data?.message || error.message));
        }
    };


    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200 shadow-sm';
    const innerCardBg = isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-gray-50 border-gray-200';
    const borderColor = isDark ? 'border-slate-800/60' : 'border-gray-200';

    if (loading) return <div className="flex-1 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;
    if (!order) return (
        <div className={`flex-1 flex flex-col items-center justify-center min-h-[60vh] ${textSecondary}`}>
            <AlertCircle className={`w-12 h-12 mb-4 ${isDark ? 'text-slate-500' : 'text-gray-300'}`} />
            <h2 className={`text-xl font-bold mb-2 ${textPrimary}`}>Pesanan Tidak Ditemukan</h2>
            <Link to="/dashboard/pesanan" className="text-blue-500 hover:underline">Kembali</Link>
        </div>
    );

    const extractInfo = (descString) => {
        const regex = /\[Tipe: (.*?) \| Deadline: (.*?)\]/;
        const match = descString?.match(regex);
        return { type: match ? match[1] : '-', deadline: match ? match[2] : '-', cleanDesc: descString?.replace(regex, '').trim() || '-' };
    };
    const { type, deadline, cleanDesc } = order.deskripsi ? extractInfo(order.deskripsi) : { type: '-', deadline: '-', cleanDesc: '-' };

    const getTimelineIndex = (s) => ({ 'WAITING_WORKER': 0, 'NEGOTIATION': 1, 'ON_PROGRESS': 2, 'REVIEW': 3, 'DONE': 4 }[s] || 0);
    const currentIndex = getTimelineIndex(order.status_pengerjaan);
    const timeline = [
        { title: 'Menunggu Worker', desc: 'Mencarikan eksekutor.', icon: FileText },
        { title: 'Negosiasi', desc: 'Diskusi harga dengan worker.', icon: Clock },
        { title: 'Dikerjakan', desc: 'Worker mengerjakan tugas.', icon: Clock },
        { title: 'Review', desc: 'Cek hasil & revisi.', icon: UploadCloud },
        { title: 'Selesai', desc: 'File siap diunduh.', icon: CheckCircle2 },
    ];

    const hargaDisplay = order.harga_deal || order.harga_total;
    const dpInvoice = invoices.find(i => i.tipe === 'DP');
    const pelunasanInvoice = invoices.find(i => i.tipe === 'PELUNASAN');

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <Link to="/dashboard/pesanan" className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'bg-slate-900/60 border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800' : 'bg-white border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}>
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-3`}>
                        {order.order_id_custom}
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{type}</span>
                    </h1>
                    <p className={`text-sm mt-1 ${textSecondary}`}>Dibuat {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT: Timeline + File + Actions */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Timeline */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`p-6 rounded-2xl border shadow-xl ${cardBg}`}>
                        <h3 className={`text-lg font-bold mb-6 ${textPrimary}`}>Status Pengerjaan</h3>
                        <div className={`space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b ${isDark ? 'before:from-blue-500/50 before:via-slate-700 before:to-slate-700' : 'before:from-blue-500/50 before:via-gray-200 before:to-gray-200'}`}>
                            {timeline.map((item, index) => {
                                const isCompleted = index <= currentIndex;
                                const isActive = index === currentIndex;
                                return (
                                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl ${isDark ? 'border-slate-900' : 'border-white'} ${isCompleted ? 'bg-blue-500 text-white' : isDark ? 'bg-slate-800 text-slate-500' : 'bg-gray-200 text-gray-400'}`}>
                                            <item.icon className="w-4 h-4" />
                                        </div>
                                        <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border shadow-lg ${isActive ? (isDark ? 'bg-blue-500/10 border-blue-500/30' : 'bg-blue-50 border-blue-200') : (isDark ? 'bg-slate-800/40 border-slate-700/50' : 'bg-gray-50 border-gray-200')}`}>
                                            <h4 className={`font-bold text-sm ${isActive ? 'text-blue-500' : isDark ? 'text-slate-300' : 'text-gray-700'}`}>{item.title}</h4>
                                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{item.desc}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* File Hasil & Results */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`p-6 rounded-2xl border shadow-xl ${cardBg}`}>
                        <h3 className={`text-lg font-bold mb-4 ${textPrimary}`}>Hasil Tugas Worker</h3>

                        {/* Progress Note */}
                        {order.progress_note && (
                            <div className={`mb-4 p-3 rounded-xl border text-sm ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                                <span className="font-bold">📊 Progress:</span> {order.progress_note}
                            </div>
                        )}

                        {/* Results List */}
                        {order.results?.length > 0 ? (
                            <div className="space-y-2">
                                {order.results.map(r => {
                                    const isLocked = order.status_pembayaran !== 'LUNAS';
                                    const handleClickPreview = (e) => {
                                        if (isLocked && r.tipe !== 'LINK') {
                                            e.preventDefault();
                                            setPreviewResult(r);
                                        }
                                    };

                                    return (
                                        <a key={r.id}
                                            href={(isLocked && r.tipe !== 'LINK') ? '#' : (r.tipe !== 'LINK' ? r.url.replace('/upload/', '/upload/fl_attachment/') : r.url)}
                                            onClick={handleClickPreview}
                                            target={r.tipe === 'LINK' ? '_blank' : '_self'}
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${isDark ? 'bg-slate-800/40 border-slate-700/50 hover:border-blue-500/50' : 'bg-gray-50 border-gray-200 hover:border-blue-400'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-500 group-hover:text-white ${r.tipe === 'FILE' ? (isDark ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'bg-blue-50 text-blue-500 border border-blue-200') : r.tipe === 'LINK' ? (isDark ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-purple-50 text-purple-500 border border-purple-200') : (isDark ? 'bg-pink-500/10 text-pink-500 border border-pink-500/20' : 'bg-pink-50 text-pink-500 border border-pink-200')}`}>
                                                {isLocked && r.tipe !== 'LINK' ? <Eye className="w-5 h-5" /> : r.tipe === 'FILE' ? <Paperclip className="w-5 h-5" /> : r.tipe === 'LINK' ? <Link2 className="w-5 h-5" /> : <Image className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm truncate transition-colors group-hover:text-blue-500 ${textPrimary}`}>
                                                    {r.caption || r.nama_file || (r.tipe === 'LINK' ? 'Buka Link' : 'File Hasil (Preview)')}
                                                </p>
                                                <p className={`text-[10px] uppercase font-bold ${textSecondary}`}>{isLocked ? 'Mode Preview' : r.tipe}</p>
                                            </div>
                                            {isLocked && r.tipe !== 'LINK' ? (
                                                <Eye className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'} group-hover:text-blue-500`} />
                                            ) : (
                                                <Download className={`w-4 h-4 ${textSecondary} group-hover:text-blue-500`} />
                                            )}
                                        </a>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className={`text-center py-6 ${textSecondary}`}>
                                <FileText className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
                                <p className="text-sm">Belum ada hasil dikirim worker</p>
                            </div>
                        )}
                    </motion.div>

                    {/* REVIEW ACTIONS: Accept / Revision */}
                    {order.status_pengerjaan === 'REVIEW' && (
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`p-6 rounded-2xl border shadow-xl ${cardBg}`}>
                            <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Review Hasil Tugas</h3>
                            <p className={`text-sm mb-5 ${textSecondary}`}>Worker sudah menandai tugas selesai. Silakan periksa file hasil lalu pilih aksi.</p>

                            {order.revision_count > 0 && (
                                <div className={`mb-4 p-3 rounded-xl text-xs font-medium border ${order.revision_count >= 3
                                    ? (isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600')
                                    : (isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700')
                                    }`}>
                                    Revisi sudah digunakan: {order.revision_count}/3.
                                    {order.revision_count >= 3 && ' Revisi tambahan akan dikenakan biaya.'}
                                </div>
                            )}

                            {showRevisionForm ? (
                                <div className="space-y-3">
                                    <textarea value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} rows={3} placeholder="Jelaskan apa yang perlu direvisi..."
                                        className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-1 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus:ring-blue-500/50' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:ring-blue-500/50'}`}
                                    />
                                    <div className="flex gap-3">
                                        <button onClick={handleRevision} disabled={revising}
                                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {revising ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Kirim Revisi
                                        </button>
                                        <button onClick={() => setShowRevisionForm(false)}
                                            className={`px-5 py-3 text-sm font-bold rounded-xl ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-gray-200 text-gray-700'}`}
                                        >Batal</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <button onClick={handleAccept} disabled={accepting}
                                        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {accepting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Terima Hasil
                                    </button>
                                    <button onClick={() => setShowRevisionForm(true)}
                                        className={`flex-1 py-3 font-bold text-sm rounded-xl border flex items-center justify-center gap-2 ${isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'}`}
                                    >
                                        <RotateCcw className="w-4 h-4" /> Minta Revisi
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* RIGHT: Payment + Info */}
                <div className="space-y-6">

                    {/* Nego Room Link */}
                    {['NEGOTIATION', 'ON_PROGRESS', 'REVIEW'].includes(order.status_pengerjaan) && (
                        <motion.div variants={fadeUp} initial="hidden" animate="visible">
                            <Link to={`/dashboard/nego/${order.id}`}
                                className={`w-full flex items-center justify-center gap-2 px-5 py-4 font-bold rounded-2xl shadow-xl transition-all border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}
                            >
                                <MessageCircle className="w-5 h-5" /> Chat dengan Worker
                            </Link>
                        </motion.div>
                    )}

                    {/* Payment Card */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`p-6 rounded-2xl border shadow-xl ${cardBg}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 ${textSecondary}`}>Informasi Tagihan</h3>
                        <div className="mb-4">
                            <p className={`text-3xl font-bold mb-1 ${textPrimary}`}>{formatRupiah(hargaDisplay)}</p>
                            {order.dp_amount && <p className={`text-sm ${textSecondary}`}>DP: {formatRupiah(order.dp_amount)}</p>}
                            <span className={`inline-flex mt-2 px-2.5 py-1 rounded-md text-xs font-semibold uppercase border ${order.status_pembayaran === 'LUNAS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : order.status_pembayaran === 'DP_DIBAYAR' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                {order.status_pembayaran.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Invoice List */}
                        {invoices.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {invoices.map(inv => (
                                    <div key={inv.id} className={`p-3 rounded-xl border flex items-center justify-between ${innerCardBg}`}>
                                        <div>
                                            <p className={`text-xs font-bold ${textPrimary}`}>{inv.tipe}</p>
                                            <p className={`text-xs ${textSecondary}`}>{formatRupiah(inv.jumlah)}</p>
                                        </div>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${inv.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                            {inv.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pay buttons (Midtrans Snap Integration) */}
                        {order.status_pembayaran === 'BELUM_DP' && order.deal_validated && (
                            <button onClick={() => handleBayarMidtrans('DP')}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                            >
                                <QrCode className="w-5 h-5" /> Bayar DP {formatRupiah(order.dp_amount)}
                            </button>
                        )}
                        {order.status_pembayaran === 'DP_DIBAYAR' && pelunasanInvoice && pelunasanInvoice.status !== 'VERIFIED' && (
                            <button onClick={() => handleBayarMidtrans('PELUNASAN')}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                            >
                                <QrCode className="w-5 h-5" /> Bayar Pelunasan {formatRupiah(pelunasanInvoice.jumlah)}
                            </button>
                        )}
                        {order.status_pembayaran === 'LUNAS' && (
                            <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                                <ShieldCheck className="w-4 h-4" /> Pembayaran sudah lunas
                            </div>
                        )}
                    </motion.div>

                    {/* Order Info */}
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`p-6 rounded-2xl border shadow-xl ${cardBg}`}>
                        <h3 className={`font-bold mb-4 line-clamp-2 ${textPrimary}`}>{order.judul_tugas}</h3>
                        <div className="space-y-4">
                            <div>
                                <p className={`text-[11px] mb-1.5 uppercase font-semibold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Deskripsi</p>
                                <p className={`text-xs leading-relaxed p-3.5 rounded-xl border whitespace-pre-line ${isDark ? 'bg-slate-800/40 border-slate-700/50 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>{cleanDesc}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className={`p-3.5 rounded-xl border ${innerCardBg}`}>
                                    <p className={`text-[10px] mb-1 uppercase font-semibold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Tipe</p>
                                    <p className="text-xs font-semibold text-blue-500">{type}</p>
                                </div>
                                <div className={`p-3.5 rounded-xl border ${innerCardBg}`}>
                                    <p className={`text-[10px] mb-1 uppercase font-semibold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Deadline</p>
                                    <p className="text-xs font-semibold text-red-500">{deadline}</p>
                                </div>
                            </div>
                            {order.file_tugas && (
                                <div className={`pt-4 mt-2 border-t ${borderColor}`}>
                                    <p className={`text-[11px] mb-2 uppercase font-semibold ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>File Referensi</p>
                                    <a href={order.file_tugas.replace('/upload/', '/upload/fl_attachment/')} target="_self" rel="noopener noreferrer"
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${isDark ? 'bg-slate-800/40 border-slate-700/50 hover:border-blue-500/50' : 'bg-gray-50 border-gray-200 hover:border-blue-400'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' : 'bg-blue-50 border-blue-200 text-blue-500'}`}>
                                            <Paperclip className="w-5 h-5" />
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <p className={`font-semibold text-sm truncate group-hover:text-blue-500 transition-colors ${textPrimary}`}>Unduh Lampiran</p>
                                            <p className={`text-xs ${textSecondary}`}>Klik untuk download</p>
                                        </div>
                                        <Download className={`w-4 h-4 ${textSecondary} group-hover:text-blue-500`} />
                                    </a>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewResult(null)}>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-200'}`}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-800' : 'border-gray-100'}`}>
                            <div>
                                <h3 className={`font-bold ${textPrimary}`}>Preview: {previewResult.caption || previewResult.nama_file || 'File Hasil'}</h3>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Unduh langsung tersedia setelah pembayaran lunas.</p>
                            </div>
                            <button onClick={() => setPreviewResult(null)} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-black/5 flex items-center justify-center p-4" style={{ minHeight: '60vh' }}>
                            {previewResult.tipe === 'PHOTO' || previewResult.url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                <img src={previewResult.url} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-lg" onContextMenu={e => e.preventDefault()} />
                            ) : previewResult.url.match(/\.(pdf)$/i) || previewResult.tipe === 'FILE' ? (
                                <iframe src={`${previewResult.url}#toolbar=0`} className="w-full h-full min-h-[70vh] rounded-lg bg-white" title="PDF Preview" />
                            ) : (
                                <div className={`text-center p-8 ${textSecondary}`}>
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Format file tidak dapat dipreview langsung.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}