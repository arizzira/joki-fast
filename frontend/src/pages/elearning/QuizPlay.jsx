import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Clock, ArrowLeft, ArrowRight, CheckCircle,
    XCircle, AlertCircle, Award, Home, LayoutGrid, Download, Zap, BookOpen, Sparkles, FileText
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function QuizPlay() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { isDark = false } = useTheme() || {};

    // Pastikan user masuk bawa data (nggak nembak URL langsung)
    useEffect(() => {
        if (!state || !state.quizzes) {
            navigate('/elearning');
        }
    }, [state, navigate]);

    if (!state || !state.quizzes) return null;

    const { title, quizzes, isFinal, courseId } = state;

    // States
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // nyimpen jawaban user: { 0: 'A', 1: 'C' }
    const [timeLeft, setTimeLeft] = useState(quizzes.length * 90); // 1.5 menit per soal (dalam detik)
    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);

    // Timer Logic
    useEffect(() => {
        if (isFinished || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, isFinished]);

    // Auto-submit kalau waktu habis
    useEffect(() => {
        if (timeLeft <= 0 && !isFinished) {
            handleSubmit();
        }
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleSelectOption = (opt) => {
        setAnswers(prev => ({ ...prev, [currentIndex]: opt }));
    };

    const handleSubmit = () => {
        if (!window.confirm("Yakin ingin mengumpulkan ujian sekarang?")) return;

        let correctCount = 0;
        quizzes.forEach((q, index) => {
            const correctAns = q.correctAnswer || q.answer;
            if (answers[index] === correctAns) {
                correctCount++;
            }
        });

        const finalScore = Math.round((correctCount / quizzes.length) * 100);
        setScore(finalScore);
        setIsFinished(true);

        // TODO: Tembak Axios post ke backend di sini buat nyimpen kelulusan & generate sertifikat
        // axiosInstance.post('/ideafast/learn/submit-quiz', { courseId, isFinal, score: finalScore });
    };

    const currentQ = quizzes[currentIndex];
    const isPassed = score >= 80;

    // ─── RENDER HASIL UJIAN (REMODELING TOTAL, UKURAN LEBIH ELEGAN) ───
    if (isFinished) {
        // Teks Pendukung & Analisis Berdasarkan Hasil
        const passText = {
            subtitle: "Selamat! Anda Lulus Ujian.",
            description: `Luar biasa! Anda telah berhasil menyelesaikan ${isFinal ? 'Ujian Akhir Kelulusan' : 'Evaluasi Bab'} untuk kursus ${title} dengan hasil yang sangat memuaskan. Ini membuktikan pemahaman Anda terhadap materi yang diajarkan sangat baik.`,
            note: "Silakan klaim sertifikat kompetensi Anda sebagai bukti pencapaian ini, atau kembali ke kelas untuk review materi.",
            bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
            textColor: "text-emerald-600 dark:text-emerald-400",
            icon: <Award className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        };

        const failText = {
            subtitle: "Ujian Belum Berhasil.",
            description: `Jangan berkecil hati! Skor Anda belum mencapai batas minimum kelulusan 80. Ingat, ujian ini hanyalah bagian dari proses belajar. Kegagalan hari ini adalah langkah menuju kesuksesan besok.`,
            note: "Kami menyarankan Anda untuk meninjau kembali materi-materi di modul sebelumnya, fokus pada bagian yang dirasa sulit, dan mencoba kembali ujian saat Anda merasa siap.",
            bgColor: "bg-rose-50 dark:bg-rose-950/30",
            textColor: "text-rose-600 dark:text-rose-400",
            icon: <AlertCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
        };

        const content = isPassed ? passText : failText;

        return (
            <div
                className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 md:p-6 font-sans relative"
                style={{ backgroundImage: "url(/elarning/bg-3.jpeg)" }}
            >
                {/* Overlay Gelap agar Teks Terbaca */}
                <div className="absolute inset-0 bg-slate-950/75 dark:bg-slate-950/85 z-0"></div>

                {/* Central Card - Ukuran Diperkecil jadi max-w-3xl */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-10 rounded-[2rem] shadow-2xl max-w-3xl w-full flex flex-col items-center relative z-10 animate-[fadeUp_0.4s_ease_both]">

                    {/* Header: Status & Icon */}
                    <div className="flex flex-col items-center text-center mb-8 w-full">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 shadow-inner ${content.bgColor}`}>
                            {content.icon}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white tracking-tight mb-2.5">
                            {content.subtitle}
                        </h2>
                        <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-slate-200 dark:border-slate-700">
                            KURSUS: {title} {isFinal ? '(UJIAN AKHIR)' : '(EVALUASI)'}
                        </span>
                    </div>

                    {/* Middle Section: Score & Supportive Text (Gap dan Padding dikecilin) */}
                    <div className="grid grid-cols-1 md:grid-cols-[1fr,1.8fr] gap-6 md:gap-8 w-full bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 mb-8">

                        {/* Besar Skor Display */}
                        <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 pb-6 md:pb-0 md:pr-4">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skor Akhir</p>
                            <div className={`text-6xl md:text-7xl font-black leading-none ${content.textColor}`}>
                                {score}
                            </div>
                            <div className={`flex items-center gap-1.5 mt-3 font-bold px-3 py-1 rounded-full text-xs ${isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {isPassed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                {isPassed ? 'Dinyatakan LULUS' : 'TIDAK LULUS'}
                            </div>
                            <p className="text-[10px] font-semibold text-slate-400 mt-4">Syarat Kelulusan: 80</p>
                        </div>

                        {/* Analisis & Motivasi Text */}
                        <div className="space-y-4 py-1">
                            <h4 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" /> Analisis & Motivasi
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                {content.description}
                            </p>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold italic flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                    {content.note}
                                </p>
                            </div>
                            {!isPassed && (
                                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 rounded-lg border border-amber-200 dark:border-amber-800/50 text-xs font-medium flex items-center gap-2.5">
                                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                    Bisa diulang setelah review materi. Tanpa batas percobaan.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section: Serious Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <button
                            onClick={() => navigate(`/elearning/learn/${courseId}`)}
                            className="flex-1 py-3 bg-white hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl border-2 border-slate-200 dark:border-slate-700/50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm text-sm"
                        >
                            <BookOpen className="w-4 h-4" /> Kembali ke Kelas
                        </button>

                        {/* 👇 TOMBOL SERTIFIKAT MUNCUL KALAU LULUS & UJIAN AKHIR 👇 */}
                        {/* 👇 TOMBOL SERTIFIKAT MUNCUL TIAP KALI LULUS UJIAN APAPUN 👇 */}
                        {isPassed && (
                            <button
                                onClick={() => {
                                    // alert("Fitur Generate PDF Sertifikat segera hadir Bang! 🔥"); HAPUS INI
                                    navigate(`/elearning/certificate/${courseId}`); // NYALAIN INI
                                }}
                                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl shadow-lg shadow-amber-500/40 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                <Award className="w-4 h-4" /> Klaim Sertifikat {isFinal ? 'Kelulusan' : 'Materi'}
                            </button>
                        )}

                        {!isPassed && (
                            <button
                                onClick={() => {
                                    setCurrentIndex(0);
                                    setAnswers({});
                                    setTimeLeft(quizzes.length * 90);
                                    setIsFinished(false);
                                    setScore(0);
                                }}
                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
                            >
                                <Zap className="w-4 h-4" /> Ulangi Ujian
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const options = [
        currentQ.optionA,
        currentQ.optionB,
        currentQ.optionC,
        currentQ.optionD
    ].filter(Boolean);

    const labels = ['A', 'B', 'C', 'D'];

    // ─── RENDER HALAMAN UJIAN (Pake Header & Pake Gambar) ───
    return (
        <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>

            {/* Header Ujian */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg">
                        <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white leading-tight">{title}</h1>
                        <p className="text-[10px] md:text-xs font-bold text-slate-500">{isFinal ? 'Ujian Akhir Kelulusan' : 'Evaluasi Bab'}</p>
                    </div>
                </div>

                <div className={`flex items-center gap-2.5 px-4 py-1.5 rounded-full font-bold text-sm border ${timeLeft < 60 ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                </div>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-6 gap-6 overflow-hidden">

                {/* Area Soal (Kiri) */}
                <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col overflow-y-auto">
                    <div className="p-6 md:p-10 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-800/20 flex-1">
                        <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-black tracking-widest uppercase rounded-md mb-4">
                            Pertanyaan {currentIndex + 1} dari {quizzes.length}
                        </span>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
                            {currentQ.question}
                        </h2>

                        {/* 👇 RENDER GAMBAR KALAU ADA (Fungsional & Responsif) 👇 */}
                        {currentQ.imageUrl && (
                            <div className="mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-center p-4 shadow-inner">
                                <img
                                    src={currentQ.imageUrl}
                                    alt={`Ilustrasi Soal ${currentIndex + 1}`}
                                    className="max-h-64 sm:max-h-80 md:max-h-[400px] w-auto object-contain rounded-lg shadow-sm"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            {options.length === 0 ? (
                                <div className="p-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-2xl text-rose-600 dark:text-rose-400">
                                    <AlertCircle className="w-6 h-6 mb-2" />
                                    <span className="font-bold block">⚠️ Pilihan Ganda Kosong!</span>
                                    <span className="text-sm">Opsi A, B, C, D tidak ditemukan pada database untuk soal ini.</span>
                                </div>
                            ) : (
                                options.map((opt, i) => {
                                    const label = labels[i]; // A, B, C, D
                                    const isSelected = answers[currentIndex] === label; // Cocokkan jawaban dengan huruf A/B/C/D

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleSelectOption(label)} // Simpan huruf A/B/C/D ke state
                                            className={`w-full flex items-center gap-4 p-4 md:p-5 rounded-2xl border-2 transition-all text-left group ${isSelected
                                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors font-bold text-sm ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600'}`}>
                                                {label}
                                            </div>
                                            <span className={`text-base font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {opt}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Navigasi Bawah */}
                    <div className="p-4 md:p-6 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0 border-t border-slate-100 dark:border-slate-800/50 sticky bottom-0 z-10">
                        <button
                            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentIndex === 0}
                            className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                        >
                            <ArrowLeft className="w-4 h-4" /> Sebelumnya
                        </button>

                        {currentIndex === quizzes.length - 1 ? (
                            <button onClick={handleSubmit} className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                                <CheckCircle className="w-4 h-4" /> Kumpulkan Ujian
                            </button>
                        ) : (
                            <button onClick={() => setCurrentIndex(prev => Math.min(quizzes.length - 1, prev + 1))} className="flex items-center gap-2 px-8 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-white font-bold rounded-xl transition-all shadow-md active:scale-95">
                                Selanjutnya <ArrowRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid Nomor Soal (Kanan) */}
                <div className="w-full lg:w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6 shrink-0 h-fit lg:sticky lg:top-24">
                    <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white mb-6">
                        <LayoutGrid className="w-5 h-5 text-indigo-500" /> Navigasi Soal
                    </div>

                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                        {quizzes.map((_, idx) => {
                            const isAnswered = !!answers[idx];
                            const isActive = currentIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-full aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all ${isActive ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900' : ''
                                        } ${isAnswered
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-8 space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 hover:border-slate-200 transition-colors">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-2 font-medium"><div className="w-3.5 h-3.5 rounded-full bg-indigo-600" /> Sudah Dijawab</span>
                            <span className="font-bold text-slate-800 dark:text-white">{Object.keys(answers).length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 flex items-center gap-2 font-medium"><div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-700" /> Belum Dijawab</span>
                            <span className="font-bold text-slate-800 dark:text-white">{quizzes.length - Object.keys(answers).length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 👇 Keyframes for FadeUp Animation 👇 */}
            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
            `}</style>
        </div>
    );
}