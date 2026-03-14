import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useTheme } from '../../context/ThemeContext';
import {
    BookOpen, Layers, CheckCircle, Circle,
    HelpCircle, ChevronDown, ChevronRight, Menu, X,
    ArrowLeft, ArrowRight, Loader2, Award, Clock,
    FileText, Link2, StickyNote, ChevronLeft,
    Flame, Star, PlayCircle, BarChart2, Sun, Moon, Lock
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';
import 'react-quill-new/dist/quill.snow.css';

/* ─── tiny helper ─── */
const estimateReadTime = (html = '') => {
    const words = html.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
};

/* ─── reusable tab button ─── */
const TabBtn = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`relative pb-3 text-sm md:text-base font-bold tracking-wide transition-colors ${active
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
    >
        {children}
        {active && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full" />
        )}
    </button>
);

export default function LearnCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    /* UI States */
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [expandedClasses, setExpandedClasses] = useState({});
    const [activeLesson, setActiveLesson] = useState(null);
    const [activeTab, setActiveTab] = useState('materi');
    const [markingDone, setMarkingDone] = useState(false);

    /* Validation States */
    const [allLessons, setAllLessons] = useState([]);
    const [unlockedMap, setUnlockedMap] = useState({}); // Nampung status lock/unlock per materi
    const [isBottomReached, setIsBottomReached] = useState(false); // Validasi scroll

    useEffect(() => {
        const fetchLearningData = async () => {
            try {
                const res = await axiosInstance.get(`/ideafast/learn/${id}`);
                if (res.data.success) {
                    const data = res.data.data;
                    setCourse(data);
                    setProgress(res.data.progress || []);

                    const flat = [];
                    data.classes.forEach(cls => {
                        cls.branchClasses.forEach(branch => {
                            branch.smallBranches.forEach(m => {
                                flat.push({ type: 'materi', data: m, classId: cls.id });
                            });
                        });
                        if (cls.quizzes?.length) {
                            flat.push({ type: 'quiz', title: `Evaluasi Bab ${cls.orderIndex}`, quizzes: cls.quizzes });
                        }
                    });
                    if (data.quizzes?.length) {
                        flat.push({ type: 'quiz', title: 'Ujian Akhir Kelulusan', quizzes: data.quizzes, isFinal: true });
                    }
                    setAllLessons(flat);

                    // Buka materi pertama otomatis
                    if (flat[0]) {
                        setActiveLesson(flat[0]);
                        if (flat[0].classId) setExpandedClasses({ [flat[0].classId]: true });
                    }
                }
            } catch (error) {
                console.error('Gagal load ruang kelas', error);
                alert(error.response?.data?.message || 'Akses ditolak. Pastikan kamu sudah mendaftar kelas ini.');
                navigate(`/elearning/course/${id}`);
            } finally {
                setLoading(false);
            }
        };
        fetchLearningData();
    }, [id, navigate]);

    // 🔥 LOGIKA LOCK/UNLOCK PROGRESSION (DI-RUN TIAP PROGRESS BERUBAH)
    useEffect(() => {
        if (allLessons.length === 0) return;

        const newUnlockedMap = {};
        let isCurrentlyUnlocked = true; // Materi ke-1 selalu kebuka

        allLessons.forEach((lesson) => {
            const key = lesson.type === 'materi' ? lesson.data.id : lesson.title;
            newUnlockedMap[key] = isCurrentlyUnlocked;

            // Kalau materi ini bertipe 'materi' dan belum selesai, KUNCI materi selanjutnya!
            if (lesson.type === 'materi' && !progress.includes(lesson.data.id)) {
                isCurrentlyUnlocked = false;
            }
        });

        setUnlockedMap(newUnlockedMap);
    }, [allLessons, progress]);


    // 🔥 LOGIKA SCROLL KE BAWAH
    const handleScroll = useCallback((e) => {
        const element = e.target;
        // Toleransi 20px biar gak terlalu kaku
        if (element.scrollHeight - Math.ceil(element.scrollTop) <= element.clientHeight + 20) {
            setIsBottomReached(true);
        }
    }, []);

    // Reset Scroll pas ganti materi
    useEffect(() => {
        setIsBottomReached(false);
        const contentArea = document.getElementById('main-content-area');
        if (contentArea) {
            contentArea.scrollTo(0, 0);

            // Cek otomatis, kalau isi materi sedikit dan ga perlu scroll, langsung unlock
            setTimeout(() => {
                if (contentArea.scrollHeight <= contentArea.clientHeight + 20) {
                    setIsBottomReached(true);
                }
            }, 300);
        }
    }, [activeLesson]);


    const toggleClass = classId => setExpandedClasses(prev => ({ ...prev, [classId]: !prev[classId] }));

    const currentIndex = allLessons.findIndex(l =>
        l.type === 'materi' ? l.data?.id === activeLesson?.data?.id : l.title === activeLesson?.title
    );
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    const goToLesson = useCallback((lesson) => {
        if (!lesson) return;

        // Cek Keamanan Lock
        const key = lesson.type === 'materi' ? lesson.data.id : lesson.title;
        if (!unlockedMap[key]) {
            alert("🔒 Materi ini masih terkunci! Selesaikan materi sebelumnya terlebih dahulu.");
            return;
        }

        setActiveLesson(lesson);
        setActiveTab('materi');
        if (lesson.classId) setExpandedClasses(prev => ({ ...prev, [lesson.classId]: true }));
        if (window.innerWidth < 1024) setSidebarOpen(false);
    }, [unlockedMap]);


    const handleMarkDone = async smallBranchId => {
        if (progress.includes(smallBranchId) || markingDone) return;
        setMarkingDone(true);
        try {
            const res = await axiosInstance.post('/ideafast/learn/progress', { courseId: id, smallBranchId });
            if (res.data.success) {
                setProgress(res.data.progress); // Update State Progress

                // Navigasi Otomatis (Bypass lock check karena barusan banget diselesaiin)
                if (nextLesson) {
                    setTimeout(() => {
                        setActiveLesson(nextLesson);
                        setActiveTab('materi');
                        if (nextLesson.classId) setExpandedClasses(prev => ({ ...prev, [nextLesson.classId]: true }));
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                    }, 400);
                }
            }
        } catch (e) {
            console.error('Gagal update progress', e);
        } finally {
            setMarkingDone(false);
        }
    };

    /* ─── LOADING ─── */
    if (loading) return (
        <div className={`min-h-screen flex flex-col justify-center items-center gap-4 ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            </div>
            <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">Memuat Ruang Kelas…</p>
        </div>
    );

    if (!course) return null;

    const totalMaterials = course.classes.reduce((acc, cls) =>
        acc + cls.branchClasses.reduce((b, br) => b + br.smallBranches.length, 0), 0);
    const progressPercentage = totalMaterials === 0 ? 0 : Math.round((progress.length / totalMaterials) * 100);
    const isDone = activeLesson?.type === 'materi' && progress.includes(activeLesson.data?.id);
    const readTime = activeLesson?.type === 'materi' ? estimateReadTime(activeLesson.data?.content) : 0;

    const lessonIndex = allLessons.filter(l => l.type === 'materi').findIndex(l => l.data?.id === activeLesson?.data?.id);
    const totalMateri = allLessons.filter(l => l.type === 'materi').length;

    // Cek apakah next button boleh diklik (Unlocked)
    const isNextUnlocked = nextLesson ? unlockedMap[nextLesson.type === 'materi' ? nextLesson.data.id : nextLesson.title] : false;

    return (
        <div className={`h-screen flex flex-col overflow-hidden font-sans ${isDark ? 'dark' : ''}`}>

            {/* ══════════════ TOPBAR (HEADER) ══════════════ */}
            <header className="h-14 sm:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 md:px-6 shrink-0 z-40 shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 sm:p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-all">
                        {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
                    </button>
                    <button onClick={() => navigate(`/elearning/course/${id}`)} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-bold tracking-wide transition-colors group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Kembali</span>
                    </button>
                    <span className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2" />
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hidden sm:block mb-0.5">IDeFast Learning</span>
                        <h1 className="text-xs sm:text-sm md:text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[120px] sm:max-w-xs md:max-w-md leading-tight">{course.title}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {progressPercentage === 100 && (
                        <span className="hidden sm:flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-400/20">
                            <Star className="w-3.5 h-3.5 fill-amber-500" /> LULUS
                        </span>
                    )}
                    <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full">
                        <div className="w-12 sm:w-20 md:w-32 h-2 sm:h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progressPercentage}%`, background: progressPercentage === 100 ? 'linear-gradient(90deg, #f59e0b, #f97316)' : 'linear-gradient(90deg, #4f46e5, #6366f1)' }} />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 tabular-nums w-7 sm:w-8">{progressPercentage}%</span>
                    </div>
                    <button onClick={toggleTheme} className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                        {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>
            </header>

            {/* ══════════════ BODY (SIDEBAR + MAIN CONTENT) ══════════════ */}
            <div className="flex flex-1 overflow-hidden relative bg-white dark:bg-slate-950">

                {/* ══ SIDEBAR SILABUS ══ */}
                <aside className={`
                    absolute lg:static inset-y-0 left-0 z-30 w-[260px] sm:w-[280px] lg:w-[320px]
                    bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                    overflow-y-auto flex flex-col hide-scrollbar
                    transform transition-transform duration-300 ease-in-out
                    shadow-[4px_0_24px_rgba(0,0,0,0.05)] lg:shadow-none
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase">Silabus Kursus</p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 font-bold">{progress.length} / {totalMaterials} Materi Selesai</p>
                        </div>
                        <Award className={`w-8 h-8 ${progressPercentage === 100 ? 'text-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    </div>

                    <div className="flex-1 pb-24">
                        {course.classes.map((cls, ci) => {
                            const classDone = cls.branchClasses.reduce((a, b) => a + b.smallBranches.filter(s => progress.includes(s.id)).length, 0);
                            const classTotal = cls.branchClasses.reduce((a, b) => a + b.smallBranches.length, 0);
                            const isExpanded = expandedClasses[cls.id];

                            return (
                                <div key={cls.id} className="border-b border-slate-200 dark:border-slate-800/60">
                                    <button onClick={() => toggleClass(cls.id)} className="w-full px-5 py-4 flex items-center gap-3.5 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-left group">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0 transition-colors ${classDone === classTotal && classTotal > 0 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : isExpanded ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:border-indigo-300'}`}>
                                            {classDone === classTotal && classTotal > 0 ? '✓' : ci + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{cls.title}</p>
                                        </div>
                                        {isExpanded ? <ChevronDown className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" /> : <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-600 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors" />}
                                    </button>

                                    {isExpanded && (
                                        <div className="pb-3 bg-white dark:bg-slate-950/50 pt-1">
                                            {cls.branchClasses.map(branch => (
                                                <div key={branch.id} className="mb-2">
                                                    <div className="pl-14 pr-4 py-2 flex items-center gap-2">
                                                        <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                                                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{branch.title}</span>
                                                    </div>

                                                    {branch.smallBranches.map(materi => {
                                                        const done = progress.includes(materi.id);
                                                        const active = activeLesson?.data?.id === materi.id;
                                                        const isUnlocked = unlockedMap[materi.id];

                                                        return (
                                                            <button
                                                                key={materi.id}
                                                                onClick={() => isUnlocked && goToLesson({ type: 'materi', data: materi, classId: cls.id })}
                                                                className={`w-full pl-14 pr-5 py-3 flex items-start gap-3.5 text-left transition-all border-l-4 group/item ${active ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-900/20'
                                                                    : !isUnlocked ? 'opacity-60 cursor-not-allowed border-transparent hover:bg-transparent'
                                                                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                    }`}
                                                            >
                                                                {done ? (
                                                                    <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 transition-colors text-emerald-600 dark:text-emerald-400`} />
                                                                ) : !isUnlocked ? (
                                                                    <Lock className="w-4 h-4 shrink-0 mt-0.5 text-slate-400 dark:text-slate-600" />
                                                                ) : (
                                                                    <Circle className={`w-4 h-4 shrink-0 mt-0.5 transition-colors ${active ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600 group-hover/item:text-slate-400'}`} />
                                                                )}
                                                                <span className={`text-sm leading-snug transition-colors ${active ? 'text-indigo-800 dark:text-indigo-200 font-bold'
                                                                    : done ? 'text-slate-500 dark:text-slate-500 line-through'
                                                                        : !isUnlocked ? 'text-slate-400 dark:text-slate-500'
                                                                            : 'text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white font-medium'
                                                                    }`}>
                                                                    {materi.title}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}

                                            {cls.quizzes?.length > 0 && (() => {
                                                const quizTitle = `Evaluasi Bab ${cls.orderIndex}`;
                                                const isQuizUnlocked = unlockedMap[quizTitle];
                                                return (
                                                    <button
                                                        onClick={() => isQuizUnlocked && goToLesson({ type: 'quiz', title: quizTitle, quizzes: cls.quizzes, classId: cls.id })}
                                                        className={`w-full pl-14 pr-5 py-3.5 flex items-center gap-3.5 border-l-4 transition-all mt-1 ${activeLesson?.title === quizTitle ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                            : !isQuizUnlocked ? 'opacity-60 cursor-not-allowed border-transparent hover:bg-transparent'
                                                                : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                            }`}
                                                    >
                                                        {!isQuizUnlocked ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : <HelpCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />}
                                                        <span className={`text-sm font-bold ${!isQuizUnlocked ? 'text-slate-400' : 'text-purple-700 dark:text-purple-300'}`}>{quizTitle}</span>
                                                    </button>
                                                )
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {course.quizzes?.length > 0 && (() => {
                            const finalTitle = 'Ujian Akhir Kelulusan';
                            const isFinalUnlocked = unlockedMap[finalTitle];
                            return (
                                <button
                                    onClick={() => isFinalUnlocked && goToLesson({ type: 'quiz', title: finalTitle, quizzes: course.quizzes, isFinal: true })}
                                    className={`w-full px-5 py-5 flex items-center gap-4 transition-all border-b border-slate-200 dark:border-slate-800/60 ${activeLesson?.isFinal ? 'bg-slate-100 dark:bg-slate-800 border-l-4 border-l-slate-500'
                                        : !isFinalUnlocked ? 'opacity-60 cursor-not-allowed'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${isFinalUnlocked ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        {!isFinalUnlocked ? <Lock className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                                    </div>
                                    <div className="text-left">
                                        <p className={`text-sm font-black uppercase tracking-widest ${isFinalUnlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>Ujian Akhir</p>
                                        <p className="text-xs font-semibold text-slate-500 mt-0.5">Raih Sertifikat Kelulusan</p>
                                    </div>
                                    {isFinalUnlocked && <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />}
                                </button>
                            )
                        })()}
                    </div>
                </aside>

                {/* Overlay Mobile */}
                {sidebarOpen && (
                    <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm" />
                )}

                {/* ══ MAIN CONTENT AREA (KANAN) ══ */}
                <main id="main-content-area" onScroll={handleScroll} className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 scroll-smooth pb-32 relative">

                    {/* ── KONDISI 1: BUKA MATERI ── */}
                    {activeLesson?.type === 'materi' && (
                        <div className="max-w-screen-xl w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-6 sm:py-10 lg:py-14">

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400">
                                    <BookOpen className="w-4 h-4 text-indigo-500" />
                                    <span className="hidden sm:inline">{course.title}</span>
                                    <ChevronRight className="w-4 h-4 hidden sm:inline" />
                                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{activeLesson.data.title}</span>
                                </div>
                                {lessonIndex >= 0 && (
                                    <span className="text-xs font-black tracking-widest text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                        {lessonIndex + 1} / {totalMateri}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-sans text-slate-950 dark:text-white leading-[1.15] tracking-tight mb-4 sm:mb-6">
                                {activeLesson.data.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-3 sm:gap-5 mb-10">
                                {isDone && (
                                    <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3.5 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                                        <CheckCircle className="w-4 h-4" /> Selesai Dibaca
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                                    <Clock className="w-4 h-4" /> Estimasi {readTime} menit membaca
                                </span>
                            </div>

                            <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 mb-10 overflow-x-auto hide-scrollbar">
                                <TabBtn active={activeTab === 'materi'} onClick={() => setActiveTab('materi')}>
                                    <span className="flex items-center gap-2.5"><FileText className="w-4 h-4" />Materi Inti</span>
                                </TabBtn>
                                <TabBtn active={activeTab === 'resources'} onClick={() => setActiveTab('resources')}>
                                    <span className="flex items-center gap-2.5"><Link2 className="w-4 h-4" />Sumber Daya</span>
                                </TabBtn>
                            </div>

                            {/* RENDER MATERI */}
                            {activeTab === 'materi' && (
                                <div className="animate-[fadeUp_0.4s_ease_both]">
                                    <div className={`w-full font-sans ${isDark ? 'dark-canvas' : ''}`}>
                                        <ReactQuill
                                            value={activeLesson.data.content}
                                            readOnly={true}
                                            theme="bubble"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'resources' && (
                                <div className="py-32 text-center animate-[fadeUp_0.3s_ease_both] bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 mt-8">
                                    <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200 dark:border-slate-700">
                                        <Link2 className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                    </div>
                                    <h3 className="text-slate-900 dark:text-white font-bold text-xl mb-3">Sumber Daya Kosong</h3>
                                    <p className="text-slate-500 text-base max-w-sm mx-auto leading-relaxed">Instruktur tidak melampirkan file referensi tambahan untuk materi ini.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── KONDISI 2: BUKA KUIS (UI DICODING STYLE / FORMAL) ── */}
                    {activeLesson?.type === 'quiz' && (
                        <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-10 pb-32">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden text-left animate-[fadeUp_0.3s_ease_both]">

                                {/* Quiz Header */}
                                <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 sm:px-8 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 w-fit">
                                        <FileText className="w-7 h-7 text-slate-700 dark:text-slate-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Ujian: {activeLesson.title}</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Evaluasi Pemahaman Materi Kursus</p>
                                    </div>
                                </div>

                                {/* Quiz Body */}
                                <div className="p-6 sm:p-8">
                                    <div className="mb-8">
                                        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-3">Informasi Ujian</h3>
                                        <ul className="space-y-4">
                                            <li className="flex items-center gap-3.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md"><HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                                <span className="font-medium">Total Soal: <strong className="text-slate-900 dark:text-white font-extrabold ml-1">{activeLesson.quizzes.length} Pilihan Ganda</strong></span>
                                            </li>
                                            <li className="flex items-center gap-3.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md"><Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                                <span className="font-medium">Estimasi Waktu: <strong className="text-slate-900 dark:text-white font-extrabold ml-1">{activeLesson.quizzes.length * 1.5 | 0} Menit</strong></span>
                                            </li>
                                            <li className="flex items-center gap-3.5 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md"><Award className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
                                                <span className="font-medium">Syarat Kelulusan: <strong className="text-slate-900 dark:text-white font-extrabold ml-1">Minimal Nilai 80</strong></span>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Rules Box */}
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/50 rounded-xl p-5 mb-8">
                                        <h4 className="text-sm font-bold text-amber-800 dark:text-amber-500 flex items-center gap-2 mb-3">
                                            <HelpCircle className="w-4 h-4" /> Ketentuan Pelaksanaan Ujian
                                        </h4>
                                        <ul className="list-none text-sm text-amber-700 dark:text-amber-600/90 space-y-2.5 font-medium">
                                            <li className="flex items-start gap-2"><span className="text-amber-400">•</span> Ujian bersifat mandiri, pastikan koneksi internet Anda stabil.</li>
                                            <li className="flex items-start gap-2"><span className="text-amber-400">•</span> Pilih salah satu jawaban yang menurut Anda paling tepat dari opsi yang tersedia.</li>
                                            <li className="flex items-start gap-2"><span className="text-amber-400">•</span> Anda dapat mengulang ujian ini kembali jika belum mencapai nilai minimum kelulusan.</li>
                                        </ul>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => navigate('/elearning/quiz-play', {
                                                state: {
                                                    title: activeLesson.title,
                                                    quizzes: activeLesson.quizzes,
                                                    isFinal: activeLesson.isFinal,
                                                    courseId: id
                                                }
                                            })}
                                            className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-md active:scale-95"
                                        >
                                            Mulai Ujian Sekarang <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── KONDISI 3: BELUM ADA YG DIPILIH (WELCOME SCREEN) ── */}
                    {!activeLesson && (
                        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
                            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner">
                                <BookOpen className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Selamat Datang di Ruang Kelas</h2>
                            <p className="text-slate-500 text-lg max-w-md leading-relaxed mb-10">
                                Pilih materi pertama dari menu silabus di sebelah kiri untuk memulai perjalanan belajarmu.
                            </p>
                            <button onClick={() => allLessons[0] && goToLesson(allLessons[0])} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/25 active:scale-95 flex items-center gap-3">
                                <PlayCircle className="w-6 h-6" /> Mulai Belajar Sekarang
                            </button>
                        </div>
                    )}
                </main>

                {/* ══════════════ BOTTOM ACTION BAR (STICKY NAVIGASI & VALIDASI) ══════════════ */}
                {activeLesson?.type === 'materi' && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-8 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">

                        {/* Tombol Back (Bebas diklik) */}
                        <button onClick={() => goToLesson(prevLesson)} disabled={!prevLesson} className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:block">Materi Sebelumnya</span>
                            <span className="sm:hidden">Back</span>
                        </button>

                        {/* Tombol Selesai (Divalidasi dari Scroll) */}
                        <button
                            onClick={() => handleMarkDone(activeLesson.data.id)}
                            disabled={isDone || markingDone || !isBottomReached}
                            className={`flex items-center gap-1.5 sm:gap-2.5 px-4 sm:px-8 md:px-10 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm md:text-base transition-all active:scale-95 shrink-0 ${isDone ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 cursor-default'
                                : !isBottomReached ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30'
                                }`}
                        >
                            {markingDone ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                : isDone ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                    : !isBottomReached ? <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce text-slate-400" />
                                        : <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />}

                            <span className="hidden sm:block">{isDone ? 'Materi Selesai Dibaca' : !isBottomReached ? 'Scroll Ke Bawah Untuk Selesai' : 'Tandai Selesai & Lanjut'}</span>
                            <span className="sm:hidden">{isDone ? 'Selesai' : !isBottomReached ? 'Scroll Dulu' : 'Selesai'}</span>
                        </button>

                        {/* Tombol Next (Cek Status Lock) */}
                        <button onClick={() => goToLesson(nextLesson)} disabled={!isNextUnlocked} className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
                            <span className="hidden sm:block">Materi Berikutnya</span>
                            <span className="sm:hidden">Next</span>
                            {isNextUnlocked ? <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />}
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

                .ql-editor {
                    font-size: 1.15rem !important;
                    line-height: 1.8 !important;
                    padding: 0 !important;
                }

                .dark-canvas .ql-editor,
                .dark-canvas .ql-editor p,
                .dark-canvas .ql-editor span,
                .dark-canvas .ql-editor li {
                    color: #cbd5e1 !important; 
                }
                .dark-canvas .ql-editor h1,
                .dark-canvas .ql-editor h2,
                .dark-canvas .ql-editor h3,
                .dark-canvas .ql-editor strong {
                    color: #f8fafc !important;
                }
                .dark-canvas .ql-editor [style*="color"]:not(pre):not(code) {
                    color: inherit !important;
                }
            `}</style>
        </div>
    );
}