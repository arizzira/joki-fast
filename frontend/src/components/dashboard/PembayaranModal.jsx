import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Copy, CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';

export default function PembayaranModal({ isOpen, onClose, amount = "Rp 1.500.000", orderId = "ORD-20231015-01", type = "DP" }) {
    const [step, setStep] = useState(1);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 mins

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setStep(1), 300); // Reset after close animation
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-800/60 bg-slate-900/50">
                            <div>
                                <h2 className="text-xl font-bold text-white">Pembayaran {type}</h2>
                                <p className="text-sm text-slate-400 mt-1">{orderId}</p>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {step === 1 ? (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Total Tagihan</span>
                                            <span className="font-bold text-emerald-400">{amount}</span>
                                        </div>
                                        <hr className="border-slate-700/50" />
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Metode</span>
                                            <span className="text-white flex items-center gap-1.5"><QrCode className="w-4 h-4 text-emerald-500" /> QRIS Semua Bank</span>
                                        </div>
                                    </div>
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 flex gap-2">
                                        <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <p>Pembayaran diteruskan ke sistem JokiFast dan aman. Transaksi akan otomatis terverifikasi oleh sistem.</p>
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                                    >
                                        Lanjut Bayar
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 flex flex-col items-center">
                                    <div className="flex flex-col items-center">
                                        <p className="text-sm font-medium text-slate-400 mb-1">Total Tagihan</p>
                                        <h3 className="text-2xl font-bold text-emerald-400">{amount}</h3>
                                    </div>

                                    <div className="p-3 pb-2 bg-white rounded-2xl w-48 shadow-lg shadow-emerald-500/10">
                                        {/* Mockup QR Code */}
                                        <div className="w-full aspect-square bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
                                            <QrCode className="w-24 h-24 text-slate-900" strokeWidth={1} />
                                        </div>
                                        <p className="text-center font-bold text-slate-800 mt-2 text-sm tracking-widest">QRIS</p>
                                    </div>

                                    <div className="flex flex-col items-center w-full space-y-3">
                                        <p className="text-sm flex items-center gap-2 text-slate-300">
                                            <Clock className="w-4 h-4 text-slate-500" /> Sisa Waktu: <span className="font-bold text-amber-500 tabular-nums">{formatTime(timeLeft)}</span>
                                        </p>

                                        <div className="w-full p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-sm">
                                            <span className="text-slate-400 pl-2 text-xs truncate">Ref: JK-2023-X9Y8Z</span>
                                            <button onClick={handleCopy} className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 font-medium rounded-lg transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300 hover:text-white hover:bg-slate-600'}`}>
                                                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copied ? 'Tersalin' : 'Salin Ref'}
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="text-sm text-emerald-500 hover:text-emerald-400 font-medium pb-2 select-none"
                                    >
                                        Saya Sudah Transfer
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
