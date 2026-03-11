import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, ShieldAlert, CheckCircle2, Loader2, XCircle, AlertTriangle, DollarSign, ShieldCheck, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosInstance';
import axios from 'axios';


export default function NegoRoom() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [inputMsg, setInputMsg] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    // File Upload State
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const fileInputRef = useRef(null);

    const ws = useRef(null);
    const messagesEndRef = useRef(null);

    // Deal submission state
    const [showDealForm, setShowDealForm] = useState(false);
    const [dpAmount, setDpAmount] = useState('');
    const [hargaDeal, setHargaDeal] = useState('');
    const [submittingDeal, setSubmittingDeal] = useState(false);
    const [validating, setValidating] = useState(false);
    const [dealSubmitted, setDealSubmitted] = useState(false);
    const [validationResult, setValidationResult] = useState(null);

    const { isDark } = useTheme();

    const isWorkerMode = location.pathname.includes('/carrier/dashboard/nego');
    const linkKembali = isWorkerMode ? '/carrier/dashboard/tugas-aktif' : '/dashboard/pesanan';

    const currentUser = useMemo(() => {
        const userStr = localStorage.getItem('jokifast_user');
        return userStr ? JSON.parse(userStr) : null;
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => { scrollToBottom(); }, [messages]);

    // Fetch order to check deal status
    // 2. WEBSOCKET (Udah Fix URL + Auto Reconnect)
    useEffect(() => {
        if (!currentUser) return;

        let reconnectInterval;

        const connectWebSocket = () => {
            // Langsung comot dari .env lu (Atau localhost kalau lagi ngoding di laptop tanpa .env)
            const wsBaseUrl = import.meta.env.VITE_CHAT_WS_URL || 'ws://localhost:8080/chat';
            const wsUrl = `${wsBaseUrl}?order_id=${id}`;

            ws.current = new WebSocket(wsUrl);

            ws.current.onopen = () => {
                setIsConnected(true);
                clearInterval(reconnectInterval); // Sukses nyambung? Stop hitungan mundur

                // Biar tulisan "Sistem" nggak dobel-dobel pas HP reconnect
                setMessages(prev => {
                    if (!prev.some(m => m.text.includes("masuk ke ruang negosiasi"))) {
                        return [...prev, { text: `Sistem: Anda masuk ke ruang negosiasi.`, sender: "system", isFile: false }];
                    }
                    return prev;
                });
            };

            ws.current.onmessage = (event) => {
                try {
                    const incomingMsg = JSON.parse(event.data);
                    if (incomingMsg.sender_id !== currentUser.id) {
                        const isFile = incomingMsg.text.startsWith('FILE:');
                        setMessages(prev => [...prev, {
                            text: incomingMsg.text,
                            sender: 'other',
                            role: incomingMsg.role,
                            isFile: isFile,
                            fileUrl: isFile ? incomingMsg.text.replace('FILE:', '') : null
                        }]);
                        markMessagesAsRead();
                    }
                } catch (error) {
                    console.error("Gagal parse pesan JSON:", error);
                }
            };

            ws.current.onclose = () => {
                setIsConnected(false);
                console.log("🔴 Koneksi terputus! Coba nyambung lagi dalam 3 detik...");
                // Jurus Anti-Putus buat HP:
                reconnectInterval = setTimeout(connectWebSocket, 3000);
            };
        };

        connectWebSocket();

        return () => {
            if (ws.current) {
                // Matiin onclose sementara biar nggak loop pas pindah halaman
                ws.current.onclose = null;
                ws.current.close();
            }
            clearTimeout(reconnectInterval);
        };
    }, [id, currentUser]);

    // 2. WEBSOCKET
    useEffect(() => {
        if (!currentUser) return;

        // Cek VITE_API_URL, kalo http jadi ws, kalo https jadi wss
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const wsProtocol = API_URL.startsWith('https') ? 'wss:' : 'ws:';
        // Buang '/api' di belakang kalau ada untuk ambil base domainnya, asumsi go chat ada di port 8080 (kalau lokal)
        let wsBaseParams = API_URL.replace('/api', '').replace('http:', '').replace('https:', '');

        // Kalo di production, biasanya WS di sub path, disesuaikan. Kalo lokal kita pake localhost:8080
        const wsUrl = API_URL.includes('localhost')
            ? `ws://localhost:8080/chat?order_id=${id}`
            : `${wsProtocol}${wsBaseParams}/chat-ws?order_id=${id}`; // Sesuaikan dengan config nginx prod

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            setIsConnected(true);
            setMessages(prev => [...prev, { text: `Sistem: Anda masuk ke ruang negosiasi.`, sender: "system", isFile: false }]);
        };

        ws.current.onmessage = (event) => {
            try {
                const incomingMsg = JSON.parse(event.data);
                if (incomingMsg.sender_id !== currentUser.id) {
                    const isFile = incomingMsg.text.startsWith('FILE:');
                    setMessages(prev => [...prev, {
                        text: incomingMsg.text,
                        sender: 'other',
                        role: incomingMsg.role,
                        isFile: isFile,
                        fileUrl: isFile ? incomingMsg.text.replace('FILE:', '') : null
                    }]);
                    markMessagesAsRead();
                }
            } catch (error) {
                console.error("Gagal parse pesan JSON:", error);
            }
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            setMessages(prev => [...prev, { text: "Sistem: Koneksi terputus.", sender: "system", isFile: false }]);
        };

        return () => { if (ws.current) ws.current.close(); };
    }, [id, currentUser]);

    // 3A. SEND TEXT MESSAGE
    const sendMessage = async (e) => {
        e?.preventDefault();
        if (inputMsg.trim() !== '' && isConnected && currentUser) {
            await sendPayloadToServer(inputMsg);
            setInputMsg('');
        }
    };

    // 3B. UPLOAD & SEND FILE MESSAGE
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Batasi ukuran 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB.');
            return;
        }

        setIsUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            // ========================================================
            // ⚠️ PENTING: GANTI 2 BARIS INI PAKE PUNYA CLOUDINARY LU ⚠️
            // ========================================================
            formData.append('upload_preset', 'jokifast_filenego');
            const cloudName = 'dncj5irc9';
            // ========================================================

            const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData);
            const fileUrl = res.data.secure_url;

            // Kasih penanda "FILE:" biar UI frontend tau kalau ini link file
            await sendPayloadToServer(`FILE:${fileUrl}`);

        } catch (error) {
            console.error("Gagal upload file:", error);
            alert("Gagal mengupload file ke server.");
        } finally {
            setIsUploadingFile(false);
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    // 3C. CORE SEND FUNCTION
    const sendPayloadToServer = async (textPayload) => {
        const roleInRoom = isWorkerMode ? 'WORKER' : 'USER';
        const isFile = textPayload.startsWith('FILE:');

        const messagePayload = {
            order_id: id,
            sender_id: currentUser.id,
            role: roleInRoom,
            text: textPayload
        };

        setMessages(prev => [...prev, {
            text: textPayload,
            sender: 'me',
            role: roleInRoom,
            isFile: isFile,
            fileUrl: isFile ? textPayload.replace('FILE:', '') : null
        }]);

        ws.current.send(JSON.stringify(messagePayload));

        try {
            await axiosInstance.post(`/chat/save`, messagePayload);
        } catch (error) {
            console.error("Gagal menyimpan pesan ke database:", error);
        }
    };

    // 4. SUBMIT DEAL (Worker Only)
    const handleSubmitDeal = async () => {
        if (!dpAmount || !hargaDeal) return;
        setSubmittingDeal(true);
        const cleanDp = dpAmount.replace(/\D/g, '');
        const cleanDeal = hargaDeal.replace(/\D/g, '');

        try {
            const payload = {
                harga_deal: parseInt(cleanDeal),
                dp_amount: parseInt(cleanDp)
            };

            // ⚠️ FIX: Endpoint Deal harus sesuai dengan backend /orders/:id/submit-deal
            const res = await axiosInstance.post(`/orders/${id}/submit-deal`, payload);

            if (res.data.success) {
                setDealSubmitted(true);
                setShowDealForm(false);
                setValidationResult(null);
                alert("Kesepakatan DP & Harga Total berhasil diajukan ke klien!");
            } else {
                alert(res.data.message);
            }
        } catch (error) {
            console.error("Error submit deal:", error);
            alert("Gagal mengajukan deal. Silakan coba lagi.");
        } finally {
            setSubmittingDeal(false);
        }
    };

    // 5. VALIDATE DEAL (Worker Only)
    const handleValidateDeal = async () => {
        setValidating(true);
        setValidationResult(null);
        try {
            // ⚠️ FIX: Endpoint Validasi Deal harus sesuai backend /orders/:id/validate-deal
            const res = await axiosInstance.post(`/orders/${id}/validate-deal`);
            const result = res.data;
            if (result.success) {
                setValidationResult(result);
            } else {
                setValidationResult({ validated: false, validation: { reasons: [result.message] } });
            }
        } catch (error) {
            console.error("Error validate deal:", error);
            setValidationResult({ validated: false, validation: { reasons: ['Gagal menghubungi server.'] } });
        } finally {
            setValidating(false);
        }
    };

    // 6. CANCEL DEAL
    const handleCancelDeal = async () => {
        if (!confirm('Yakin batalkan negosiasi ini? Order akan kembali ke bursa.')) return;
        try {
            // ⚠️ FIX: Endpoint Batal Deal harus sesuai backend /orders/:id/cancel-deal
            await axiosInstance.put(`/orders/${id}/cancel-deal`);
            navigate(isWorkerMode ? '/carrier/dashboard' : '/dashboard/pesanan');
        } catch (error) {
            console.error("Error cancel deal:", error);
            alert("Gagal membatalkan negosiasi.");
        }
    };

    // Component Helper: Render Chat Bubble
    const renderMessageBubble = (msg) => {
        if (msg.isFile) {
            const isImage = msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i);
            return (
                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-2 p-2 rounded-xl border ${msg.sender === 'me' ? 'bg-white/20 border-white/30 text-white hover:bg-white/30' : isDark ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700' : 'bg-white border-gray-200 text-blue-600 hover:bg-gray-50'}`}>
                    <div className={`p-2 rounded-lg ${msg.sender === 'me' ? 'bg-white/20' : isDark ? 'bg-slate-900' : 'bg-gray-100'}`}>
                        {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col pr-2">
                        <span className="text-sm font-bold truncate max-w-[150px]">{isImage ? 'Gambar Terlampir' : 'Dokumen Terlampir'}</span>
                        <span className="text-[10px] opacity-80 uppercase tracking-widest">Klik untuk buka</span>
                    </div>
                </a>
            );
        }
        return <p>{msg.text}</p>;
    };

    // Theme variables
    const headerBg = isDark ? 'bg-slate-900/80 backdrop-blur-xl border-slate-800/60' : 'bg-white border-gray-200 shadow-sm';
    const chatAreaBg = isDark ? 'bg-slate-900/60 backdrop-blur-xl border-slate-800/60' : 'bg-white border-gray-200';
    const inputAreaBg = isDark ? 'bg-slate-950/50 border-slate-800/60' : 'bg-gray-50 border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-gray-50 border-gray-200';

    const myBubble = isWorkerMode
        ? 'bg-emerald-500 text-white rounded-tr-sm font-medium'
        : 'bg-blue-500 text-white rounded-tr-sm font-medium';

    const otherBubble = isDark
        ? 'bg-slate-800 text-slate-200 rounded-tl-sm border border-slate-700/50'
        : 'bg-gray-100 text-gray-800 rounded-tl-sm border border-gray-200';

    const senderAccent = isWorkerMode ? 'text-emerald-500' : 'text-blue-500';
    const inputBorderFocus = isWorkerMode ? 'focus:border-emerald-500/50 focus:ring-emerald-500/50' : 'focus:border-blue-500/50 focus:ring-blue-500/50';
    const sendBtnClass = isWorkerMode ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20' : 'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20';
    const accentBtn = isWorkerMode ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20' : 'bg-blue-500 hover:bg-blue-400 shadow-blue-500/20';

    const formatRp = (v) => v ? `Rp ${parseInt(v).toLocaleString('id-ID')}` : '-';

    return (
        <div className="max-w-4xl mx-auto h-[85vh] flex flex-col space-y-3">
            {/* Header */}
            <div className={`flex items-center justify-between border p-4 rounded-2xl shadow-xl ${headerBg}`}>
                <div className="flex items-center gap-4">
                    <Link to={linkKembali} className={`p-2 rounded-xl transition-colors ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'}`}>
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h2 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                            Ruang Negosiasi
                            <span className={`px-2 py-0.5 text-[10px] uppercase rounded border ${isWorkerMode
                                ? (isDark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200')
                                : (isDark ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-blue-50 text-blue-600 border-blue-200')
                                }`}>
                                {id.substring(0, 8)}...
                            </span>
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                            <span className="relative flex h-2 w-2">
                                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                            </span>
                            <span className={isConnected ? "text-emerald-500" : "text-red-400"}>
                                {isConnected ? "Terhubung" : "Terputus"}
                            </span>
                        </div>
                    </div>
                </div>
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    <ShieldAlert className="w-4 h-4" /> Jangan kirim data pribadi!
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 border rounded-2xl overflow-hidden flex flex-col shadow-xl ${chatAreaBg}`}>
                <div className={`flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide ${isDark ? '' : 'bg-gray-50/50'}`}>
                    <AnimatePresence>
                        {messages.map((msg, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex flex-col max-w-[75%] ${msg.sender === 'me' ? 'ml-auto items-end' : msg.sender === 'system' ? 'mx-auto items-center' : 'mr-auto items-start'}`}
                            >
                                {msg.sender === 'system' ? (
                                    <span className={`px-3 py-1 text-[10px] rounded-full uppercase tracking-wider font-semibold border ${isDark ? 'bg-slate-800 text-slate-400 border-slate-700/50' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>
                                        {msg.text}
                                    </span>
                                ) : (
                                    <div className={`p-3.5 rounded-2xl text-sm shadow-lg ${msg.sender === 'me' ? myBubble : otherBubble}`}>
                                        {msg.sender === 'other' && (
                                            <div className={`text-[10px] font-bold mb-1 opacity-80 uppercase tracking-wider ${senderAccent}`}>
                                                {msg.role === 'USER' ? 'Klien' : 'Worker'}
                                            </div>
                                        )}
                                        {renderMessageBubble(msg)}
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className={`p-4 border-t ${inputAreaBg}`}>
                    <form onSubmit={sendMessage} className="flex items-center gap-3">

                        {/* Tombol Attach File */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!isConnected || isUploadingFile}
                            className={`p-3 rounded-xl transition-all border ${isDark ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800' : 'border-gray-300 text-gray-500 hover:text-gray-800 hover:bg-gray-100'} disabled:opacity-50`}
                        >
                            {isUploadingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
                        </button>

                        <input type="text" value={inputMsg} onChange={(e) => setInputMsg(e.target.value)}
                            disabled={!isConnected || isUploadingFile} placeholder={isConnected ? (isUploadingFile ? "Mengupload file..." : "Ketik pesan negosiasi...") : "Menunggu koneksi..."}
                            className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 disabled:opacity-50 transition-all ${isDark
                                ? `bg-slate-900 border-slate-700/50 text-white placeholder:text-slate-500 ${inputBorderFocus}`
                                : `bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 ${inputBorderFocus}`}`}
                        />
                        <button type="submit" disabled={!isConnected || inputMsg.trim() === '' || isUploadingFile}
                            className={`p-3 rounded-xl transition-all shadow-lg disabled:shadow-none ${isDark
                                ? `${sendBtnClass} disabled:bg-slate-800 disabled:text-slate-500`
                                : `${sendBtnClass} disabled:bg-gray-200 disabled:text-gray-400`}`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* === RENDER BERDASARKAN MODE (WORKER ATAU KLIEN) === */}
            {isWorkerMode ? (
                // PANEL KHUSUS WORKER (Tombol Ajukan Deal, Validasi AI, dll)
                <div className={`border p-5 rounded-2xl shadow-xl space-y-4 ${headerBg}`}>
                    {validationResult && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border ${validationResult.validated
                                ? (isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                                : (isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {validationResult.validated
                                    ? <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                    : <XCircle className="w-5 h-5 text-red-500" />
                                }
                                <h4 className={`font-bold text-sm ${validationResult.validated ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {validationResult.validated ? 'Validasi Berhasil! ✅' : 'Validasi Gagal ❌'}
                                </h4>
                            </div>
                            {validationResult.validation?.reasons?.length > 0 && (
                                <ul className={`text-xs space-y-1 ${textSecondary}`}>
                                    {validationResult.validation.reasons.map((r, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="mt-0.5">•</span> {r}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {validationResult.validated && (
                                <p className={`text-xs mt-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                    Deal berhasil! Menunggu klien membayar DP. Status order sudah diupdate.
                                </p>
                            )}
                            {!validationResult.validated && (
                                <div className="flex gap-2 mt-3">
                                    <button onClick={() => { setDealSubmitted(false); setValidationResult(null); setShowDealForm(true); }}
                                        className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                                    >
                                        Coba Lagi
                                    </button>
                                    <button onClick={handleCancelDeal}
                                        className="px-4 py-2 text-xs font-bold rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                    >
                                        Batalkan Negosiasi
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {showDealForm && !dealSubmitted && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 overflow-hidden">
                            <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${isDark ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <p>Masukkan harga yang sudah disepakati di chat. AI akan memverifikasi kesesuaian harga dengan percakapan.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={`text-xs font-bold mb-1 block ${textSecondary}`}>DP (Down Payment)</label>
                                    <input type="number" value={dpAmount} onChange={(e) => setDpAmount(e.target.value)} placeholder="50000"
                                        className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 ${isDark ? `bg-slate-900 border-slate-700 text-white ${inputBorderFocus}` : `bg-white border-gray-200 text-gray-900 ${inputBorderFocus}`}`}
                                    />
                                </div>
                                <div>
                                    <label className={`text-xs font-bold mb-1 block ${textSecondary}`}>Harga Akhir (Total)</label>
                                    <input type="number" value={hargaDeal} onChange={(e) => setHargaDeal(e.target.value)} placeholder="100000"
                                        className={`w-full px-3 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-1 ${isDark ? `bg-slate-900 border-slate-700 text-white ${inputBorderFocus}` : `bg-white border-gray-200 text-gray-900 ${inputBorderFocus}`}`}
                                    />
                                </div>
                            </div>
                            <button onClick={handleSubmitDeal} disabled={submittingDeal || !dpAmount || !hargaDeal}
                                className={`w-full py-3 ${accentBtn} text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {submittingDeal ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
                                {submittingDeal ? 'Submitting...' : 'Submit Harga Deal'}
                            </button>
                        </motion.div>
                    )}

                    {dealSubmitted && !validationResult && (
                        <div className={`p-4 rounded-xl border ${cardBg}`}>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className={`font-bold text-sm ${textPrimary}`}>Deal Submitted</h4>
                                <button onClick={() => { setDealSubmitted(false); setShowDealForm(true); }}
                                    className={`text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-800'}`}>
                                    Edit
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                                    <p className={`text-[10px] font-bold uppercase ${textSecondary}`}>DP</p>
                                    <p className={`text-sm font-bold ${textPrimary}`}>{formatRp(dpAmount)}</p>
                                </div>
                                <div className={`p-3 rounded-lg border ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-gray-200'}`}>
                                    <p className={`text-[10px] font-bold uppercase ${textSecondary}`}>Harga Total</p>
                                    <p className={`text-sm font-bold ${textPrimary}`}>{formatRp(hargaDeal)}</p>
                                </div>
                            </div>
                            <button onClick={handleValidateDeal} disabled={validating}
                                className={`w-full py-3 ${accentBtn} text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
                            >
                                {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                {validating ? 'AI sedang memvalidasi...' : 'Validasi dengan AI'}
                            </button>
                        </div>
                    )}

                    {!showDealForm && !dealSubmitted && !validationResult && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <h3 className={`font-bold text-sm mb-1 ${textPrimary}`}>Sudah sepakat harga & DP?</h3>
                                <p className={`text-xs ${textSecondary}`}>Input harga deal lalu AI kami validasi dari chat.</p>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button onClick={() => setShowDealForm(true)}
                                    className={`flex-1 sm:flex-none px-6 py-2.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${accentBtn} text-white shadow-lg`}
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Ajukan Deal
                                </button>
                                <button onClick={handleCancelDeal}
                                    className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-colors ${isDark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // PANEL KHUSUS USER/KLIEN (Cuma Notif/Info Doang, Gak Bisa Klik Deal)
                <div className={`border p-5 rounded-2xl shadow-xl ${headerBg}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-50 border border-blue-200'}`}>
                            <DollarSign className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h3 className={`font-bold text-sm ${textPrimary}`}>Negosiasi Sedang Berlangsung</h3>
                            <p className={`text-xs ${textSecondary}`}>Diskusikan harga dan jobdesk dengan worker. Worker akan mengajukan harga deal setelah kesepakatan.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}