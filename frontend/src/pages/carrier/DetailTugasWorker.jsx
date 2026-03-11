import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, CreditCard, Briefcase, User, CheckCircle2, Loader2, AlertTriangle, FileText, Paperclip, Download, Upload, MessageSquare, ShieldCheck, Link2, Image, Trash2, Send, Edit3, XCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function DetailTugasWorker() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [takingJob, setTakingJob] = useState(false);
    const [completing, setCompleting] = useState(false);

    // Multi-format delivery
    const [sendMode, setSendMode] = useState(null); // 'FILE', 'LINK', 'PHOTO'
    const [resultFile, setResultFile] = useState(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [caption, setCaption] = useState('');
    const [sending, setSending] = useState(false);

    // Progress update
    const [progressNote, setProgressNote] = useState('');
    const [updatingProgress, setUpdatingProgress] = useState(false);
    const [showProgressForm, setShowProgressForm] = useState(false);

    const token = localStorage.getItem('jokifast_token');

    const fetchOrder = async () => {
        try {
            const res = await fetch(`${API_URL}/api/orders/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) {
                setOrder(result.data);
                setProgressNote(result.data.progress_note || '');
            }
        } catch (error) { console.error("Gagal fetch:", error); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchOrder(); }, [id]);

    const handleTakeJob = async () => {
        setTakingJob(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/${id}/take`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) navigate(`/carrier/dashboard/nego/${id}`);
            else { alert(result.message); navigate('/carrier/dashboard'); }
        } catch (e) { console.error(e); }
        finally { setTakingJob(false); }
    };

    const handleSendResult = async () => {
        setSending(true);
        try {
            if (sendMode === 'LINK') {
                if (!linkUrl.trim()) { alert('URL wajib diisi'); setSending(false); return; }
                const res = await fetch(`${API_URL}/api/orders/${id}/add-result`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ tipe: 'LINK', url: linkUrl, caption })
                });
                const result = await res.json();
                if (!result.success) { alert(result.message); setSending(false); return; }
            } else {
                if (!resultFile) { alert('Pilih file terlebih dahulu'); setSending(false); return; }
                const formData = new FormData();
                formData.append('file', resultFile);
                formData.append('tipe', sendMode);
                formData.append('caption', caption);
                const res = await fetch(`${API_URL}/api/orders/${id}/add-result`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });
                const result = await res.json();
                if (!result.success) { alert(result.message); setSending(false); return; }
            }
            setSendMode(null); setResultFile(null); setLinkUrl(''); setCaption('');
            await fetchOrder();
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const handleDeleteResult = async (resultId) => {
        if (!confirm('Hapus hasil ini?')) return;
        try {
            await fetch(`${API_URL}/api/orders/${id}/result/${resultId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            await fetchOrder();
        } catch (e) { console.error(e); }
    };

    const handleUpdateProgress = async () => {
        setUpdatingProgress(true);
        try {
            await fetch(`${API_URL}/api/orders/${id}/progress`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ progress_note: progressNote })
            });
            setShowProgressForm(false);
            await fetchOrder();
        } catch (e) { console.error(e); }
        finally { setUpdatingProgress(false); }
    };

    const handleComplete = async () => {
        if (!confirm('Tandai tugas selesai? Klien akan diminta me-review.')) return;
        setCompleting(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/${id}/complete`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            const result = await res.json();
            if (result.success) await fetchOrder();
            else alert(result.message);
        } catch (e) { console.error(e); }
        finally { setCompleting(false); }
    };

    // Theme
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800/60' : 'bg-white border-gray-200 shadow-sm';
    const innerBg = isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-gray-50 border-gray-200';

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
    if (!order) return (
        <div className={`text-center py-20 ${textSecondary}`}>
            <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-gray-300'}`} />
            <p className="font-medium">Tugas tidak ditemukan.</p>
            <Link to="/carrier/dashboard" className="text-emerald-500 hover:underline text-sm mt-2 inline-block">Kembali</Link>
        </div>
    );

    const extractInfo = (d) => {
        const m = d?.match(/\[Tipe: (.*?) \| Deadline: (.*?)\]/);
        return { type: m?.[1] || '-', deadline: m?.[2] || '-', cleanDesc: d?.replace(/\[Tipe:.*?\]/, '').trim() || '-' };
    };
    const { type, deadline, cleanDesc } = extractInfo(order.deskripsi);

    const statusMap = {
        'WAITING_WORKER': { label: 'Menunggu Worker', color: isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200' },
        'NEGOTIATION': { label: 'Negosiasi', color: isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200' },
        'ON_PROGRESS': { label: 'Dikerjakan', color: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'REVIEW': { label: 'Review Klien', color: isDark ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-50 text-purple-700 border-purple-200' },
        'DONE': { label: 'Selesai', color: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    };
    const status = statusMap[order.status_pengerjaan] || statusMap['WAITING_WORKER'];
    const hargaDisplay = order.harga_deal || order.harga_total;
    const dpInvoice = order.invoices?.find(i => i.tipe === 'DP');
    const dpPaid = dpInvoice?.status === 'VERIFIED' || order.status_pembayaran === 'DP_DIBAYAR' || order.status_pembayaran === 'LUNAS';

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2">
                <Link to="/carrier/dashboard/tugas-aktif" className={`p-2.5 rounded-xl border transition-colors ${isDark ? 'text-slate-400 hover:text-white bg-slate-900/50 border-slate-800/60 hover:bg-slate-800' : 'text-gray-400 hover:text-gray-900 bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-2`}>
                    <Briefcase className="w-6 h-6 text-emerald-500" /> Detail Tugas
                </h1>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`p-6 md:p-8 border rounded-3xl shadow-xl ${cardBg}`}>
                {/* Top Section */}
                <div className={`flex flex-col md:flex-row justify-between gap-6 mb-8 pb-8 border-b ${isDark ? 'border-slate-800/60' : 'border-gray-200'}`}>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{type}</span>
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${status.color}`}>{status.label}</span>
                            {/* Payment badge */}
                            <span className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border ${dpPaid ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-700 border-red-200')}`}>
                                {dpPaid ? '💰 DP Dibayar' : '⏳ DP Belum Dibayar'}
                            </span>
                        </div>
                        <h2 className={`text-xl md:text-2xl font-bold ${textPrimary}`}>{order.judul_tugas}</h2>
                        <div className={`flex items-center gap-2 mt-3 text-sm ${textSecondary}`}><User className="w-4 h-4" /> Klien: <span className="text-emerald-500 font-medium">{order.client?.nama || order.nama_klien}</span></div>
                        {order.revision_count > 0 && <div className={`mt-2 text-xs font-medium ${order.revision_count > 3 ? 'text-red-500' : 'text-amber-500'}`}>Revisi: {order.revision_count}/3</div>}
                    </div>
                    <div className="flex flex-col gap-3 md:items-end">
                        <div className={`p-4 rounded-2xl border text-right ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-emerald-50 border-emerald-200'}`}>
                            <p className={`text-xs font-bold uppercase flex items-center gap-1.5 md:justify-end mb-1 ${textSecondary}`}><CreditCard className="w-4 h-4" /> {order.harga_deal ? 'Harga Deal' : 'Tawaran Harga'}</p>
                            <p className="text-2xl font-bold text-emerald-500">
                                {hargaDisplay === 0 ? "Harga Nego" : `Rp ${hargaDisplay.toLocaleString('id-ID')}`}
                            </p>
                            {order.dp_amount && <p className={`text-xs mt-1 ${textSecondary}`}>DP: Rp {order.dp_amount.toLocaleString('id-ID')}</p>}
                        </div>
                        <div className={`flex items-center gap-2 text-sm ${textSecondary}`}><Clock className="w-4 h-4" /> Deadline: <span className={`font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>{deadline}</span></div>
                    </div>
                </div>

                {/* Deskripsi */}
                <div className="mb-6">
                    <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${textSecondary}`}>Deskripsi</h3>
                    <div className={`p-5 rounded-2xl border text-sm leading-relaxed whitespace-pre-line ${isDark ? 'bg-slate-950/50 border-slate-800/60 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>{cleanDesc}</div>
                </div>

                {/* Catatan Revisi (if any) */}
                {order.catatan_revisi && order.status_pengerjaan === 'ON_PROGRESS' && (
                    <div className={`flex items-start gap-3 p-4 border rounded-2xl mb-6 text-sm ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold mb-1">Catatan Revisi dari Klien:</p>
                            <p className="opacity-90">{order.catatan_revisi}</p>
                        </div>
                    </div>
                )}

                {/* File Referensi Klien */}
                {order.file_tugas && (
                    <div className={`mb-6 pb-6 border-b ${isDark ? 'border-slate-800/60' : 'border-gray-200'}`}>
                        <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${textSecondary}`}>File Referensi Klien</h3>
                        <a href={order.file_tugas.replace('/upload/', '/upload/fl_attachment/')} target="_blank" rel="noopener noreferrer"
                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all group ${isDark ? 'bg-slate-800/40 border-slate-700/50 hover:border-emerald-500/50' : 'bg-gray-50 border-gray-200 hover:border-emerald-500/50'}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Paperclip className="w-5 h-5" /></div>
                            <div className="flex-1"><p className={`font-semibold text-sm group-hover:text-emerald-500 transition-colors ${textPrimary}`}>Unduh File Referensi</p></div>
                            <Download className={`w-4 h-4 ${textSecondary} group-hover:text-emerald-500`} />
                        </a>
                    </div>
                )}

                {/* === STATUS-BASED ACTIONS === */}

                {/* WAITING_WORKER */}
                {order.status_pengerjaan === 'WAITING_WORKER' && (
                    <>
                        <div className={`flex items-start gap-3 p-4 border rounded-2xl mb-6 text-sm ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>Dengan mengambil tugas ini, Anda setuju menyelesaikannya sesuai deadline & masuk ke ruang negosiasi.</p>
                        </div>
                        <button onClick={handleTakeJob} disabled={takingJob}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >{takingJob ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Kunci Tugas Ini</>}</button>
                    </>
                )}

                {/* NEGOTIATION */}
                {order.status_pengerjaan === 'NEGOTIATION' && (
                    <div className="space-y-4">
                        <div className={`flex items-start gap-3 p-4 border rounded-2xl text-sm ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                            <MessageSquare className="w-5 h-5 shrink-0 mt-0.5" />
                            <p>Anda dalam tahap negosiasi. Masuk ke ruang negosiasi untuk diskusi & submit deal.</p>
                        </div>
                        <Link to={`/carrier/dashboard/nego/${id}`} className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                            <MessageSquare className="w-6 h-6" /> Masuk Ruang Negosiasi
                        </Link>
                    </div>
                )}

                {/* ON_PROGRESS */}
                {order.status_pengerjaan === 'ON_PROGRESS' && (
                    <div className="space-y-5">
                        {/* DP status alert */}
                        {!dpPaid && (
                            <div className={`flex items-start gap-3 p-4 border rounded-2xl text-sm ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                                <p><strong>DP belum dibayar.</strong> Klien perlu membayar DP sebelum Anda mulai mengerjakan. Anda bisa tetap komunikasi via chat.</p>
                            </div>
                        )}
                        {dpPaid && (
                            <div className={`flex items-start gap-3 p-4 border rounded-2xl text-sm ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                <p><strong>DP sudah dibayar!</strong> Silakan kerjakan tugas, kirim hasil, lalu tandai selesai.</p>
                            </div>
                        )}

                        {/* Progress Update */}
                        <div className={`p-5 rounded-2xl border ${innerBg}`}>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className={`text-sm font-bold ${textPrimary}`}>📊 Update Progress</h4>
                                <button onClick={() => setShowProgressForm(!showProgressForm)} className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'} hover:underline`}>
                                    <Edit3 className="w-3.5 h-3.5 inline mr-1" />{showProgressForm ? 'Tutup' : 'Edit'}
                                </button>
                            </div>
                            {order.progress_note && !showProgressForm && (
                                <p className={`text-sm p-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-700 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`}>{order.progress_note}</p>
                            )}
                            {showProgressForm && (
                                <div className="space-y-2">
                                    <textarea value={progressNote} onChange={(e) => setProgressNote(e.target.value)} rows={2} placeholder="Sudah selesai 50%..."
                                        className={`w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-1 ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-emerald-500/50' : 'bg-white border-gray-200 text-gray-900 focus:ring-emerald-500/50'}`}
                                    />
                                    <button onClick={handleUpdateProgress} disabled={updatingProgress}
                                        className="px-4 py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                                    >{updatingProgress ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Kirim Update</button>
                                </div>
                            )}
                        </div>

                        {/* Existing Results */}
                        {order.results?.length > 0 && (
                            <div className={`p-5 rounded-2xl border ${innerBg}`}>
                                <h4 className={`text-sm font-bold mb-3 ${textPrimary}`}>📁 Hasil yang Sudah Dikirim ({order.results.length})</h4>
                                <div className="space-y-2">
                                    {order.results.map(r => (
                                        <div key={r.id} className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.tipe === 'FILE' ? 'bg-blue-500/10 text-blue-500' : r.tipe === 'LINK' ? 'bg-purple-500/10 text-purple-500' : 'bg-pink-500/10 text-pink-500'}`}>
                                                {r.tipe === 'FILE' ? <FileText className="w-4 h-4" /> : r.tipe === 'LINK' ? <Link2 className="w-4 h-4" /> : <Image className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium truncate ${textPrimary}`}>{r.caption || r.nama_file || r.url}</p>
                                                <p className={`text-[10px] uppercase font-bold ${textSecondary}`}>{r.tipe}</p>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <a href={r.tipe === 'FILE' ? r.url.replace('/upload/', '/upload/fl_attachment/') : r.url} target="_blank" rel="noopener noreferrer"
                                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:bg-slate-800 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-800'}`}>
                                                    <Download className="w-4 h-4" />
                                                </a>
                                                <button onClick={() => handleDeleteResult(r.id)}
                                                    className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:bg-red-500/10 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'}`}>
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Send Result */}
                        <div className={`p-5 rounded-2xl border ${innerBg}`}>
                            <h4 className={`text-sm font-bold mb-3 ${textPrimary}`}>📤 Kirim Hasil Tugas</h4>

                            {!sendMode ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { mode: 'FILE', icon: Upload, label: 'File', desc: 'PDF, ZIP, dll' },
                                        { mode: 'LINK', icon: Link2, label: 'Link', desc: 'Google Drive, dll' },
                                        { mode: 'PHOTO', icon: Image, label: 'Foto', desc: 'Screenshot, dsb' }
                                    ].map(opt => (
                                        <button key={opt.mode} onClick={() => setSendMode(opt.mode)}
                                            className={`p-4 rounded-xl border text-center transition-all hover:scale-105 ${isDark ? 'bg-slate-900/50 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800' : 'bg-white border-gray-200 hover:border-emerald-400 hover:bg-emerald-50'}`}
                                        >
                                            <opt.icon className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                            <p className={`text-sm font-bold ${textPrimary}`}>{opt.label}</p>
                                            <p className={`text-[10px] ${textSecondary}`}>{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <AnimatePresence>
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-xs font-bold uppercase ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                                {sendMode === 'FILE' ? 'Upload File' : sendMode === 'LINK' ? 'Kirim Link' : 'Upload Foto'}
                                            </p>
                                            <button onClick={() => { setSendMode(null); setResultFile(null); setLinkUrl(''); setCaption(''); }}
                                                className={`p-1 rounded-lg ${isDark ? 'text-slate-500 hover:text-white' : 'text-gray-400 hover:text-gray-800'}`}><XCircle className="w-4 h-4" /></button>
                                        </div>

                                        {sendMode === 'LINK' ? (
                                            <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/..."
                                                className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-emerald-500/50' : 'bg-white border-gray-200 text-gray-900 focus:ring-emerald-500/50'}`}
                                            />
                                        ) : (
                                            <input type="file" accept={sendMode === 'PHOTO' ? 'image/*' : undefined} onChange={(e) => setResultFile(e.target.files[0])}
                                                className={`w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:text-sm ${isDark ? 'text-slate-400 file:bg-slate-800 file:text-slate-200' : 'text-gray-500 file:bg-gray-200 file:text-gray-800'}`}
                                            />
                                        )}

                                        <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Keterangan (opsional)"
                                            className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:ring-emerald-500/50' : 'bg-white border-gray-200 text-gray-900 focus:ring-emerald-500/50'}`}
                                        />

                                        <button onClick={handleSendResult} disabled={sending}
                                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                                        >{sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Kirim</button>
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>

                        {/* Mark Complete */}
                        <button onClick={handleComplete} disabled={completing || (order.results?.length === 0 && !order.file_hasil)}
                            className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >{completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6" /> Tandai Tugas Selesai</>}</button>
                    </div>
                )}

                {/* REVIEW */}
                {order.status_pengerjaan === 'REVIEW' && (
                    <div className={`flex items-start gap-3 p-5 border rounded-2xl text-sm ${isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700'}`}>
                        <Clock className="w-5 h-5 shrink-0 mt-0.5" />
                        <div><p className="font-bold">Menunggu Review Klien</p><p className="mt-1 opacity-80">Menunggu klien menerima atau meminta revisi.</p></div>
                    </div>
                )}

                {/* DONE */}
                {order.status_pengerjaan === 'DONE' && (
                    <div className={`flex items-start gap-3 p-5 border rounded-2xl text-sm ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                        <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                        <div><p className="font-bold">Tugas Selesai! 🎉</p><p className="mt-1 opacity-80">Klien sudah menerima & pembayaran lunas.</p></div>
                    </div>
                )}

                {/* Chat Link */}
                {['NEGOTIATION', 'ON_PROGRESS', 'REVIEW'].includes(order.status_pengerjaan) && (
                    <Link to={`/carrier/dashboard/nego/${id}`}
                        className={`mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-colors ${isDark ? 'text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white' : 'text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-900'}`}
                    ><MessageSquare className="w-4 h-4" /> Buka Ruang Chat</Link>
                )}
            </motion.div>
        </div>
    );
}