import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import {
    BookOpen, Layers, ArrowLeft, Loader2, PlayCircle,
    Lock, Star, Clock, Award, BarChart, ChevronRight, Check, CheckCircle, Circle
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.bubble.css';

// Fungsi Generate Angka Acak Paten Berdasarkan ID
const getSeededRandom = (seedStr) => {
    let hash = 0;
    for (let i = 0; i < seedStr.length; i++) hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    return Math.abs(hash);
};

export default function CourseDetailPublic() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // State untuk Progress Real-time
    const [progress, setProgress] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [unlockedMap, setUnlockedMap] = useState({});

    // Bintang & Review Gacha
    const { rating, reviewCount } = useMemo(() => {
        if (!id) return { rating: "0.0", reviewCount: 0 };
        const seed = getSeededRandom(id);
        const r = (3.9 + (seed % 11) / 10).toFixed(1);
        const c = (seed % 100) + 45;
        return { rating: r, reviewCount: c };
    }, [id]);

    useEffect(() => {
        const fetchDetailAndProgress = async () => {
            try {
                // 1. Fetch Publik Dulu
                const publicRes = await axiosInstance.get(`/ideafast/public/course/${id}`);
                let courseData = publicRes.data.data;

                // 2. Cek Progress kalau Punya Token
                const token = localStorage.getItem('jokifast_token');
                if (token) {
                    try {
                        const learnRes = await axiosInstance.get(`/ideafast/learn/${id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        if (learnRes.data.success) {
                            setProgress(learnRes.data.progress || []);
                            setIsEnrolled(true);
                            // 🔥 TIMPA DATA PUBLIK PAKAI DATA FULL (Biar dapet list smallBranches)
                            courseData = learnRes.data.data;
                        }
                    } catch (e) {
                        console.log("Belum enroll course ini.");
                        setIsEnrolled(false);
                    }
                }

                setCourse(courseData);
            } catch (error) {
                console.error("Gagal load detail", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetailAndProgress();
    }, [id]);

    // Kalkulasi Lock/Unlock Syllabus secara Real-Time dengan PENGAMAN `?.`
    useEffect(() => {
        if (!course) return;
        const newUnlockedMap = {};
        let isCurrentlyUnlocked = true;

        course.classes?.forEach(cls => {
            cls.branchClasses?.forEach(branch => {
                // Cek apakah ada smallBranches (materi detailnya)
                branch.smallBranches?.forEach(materi => {
                    newUnlockedMap[materi.id] = isCurrentlyUnlocked;

                    if (!isEnrolled || !progress.includes(materi.id)) {
                        isCurrentlyUnlocked = false;
                    }
                });
            });
        });
        setUnlockedMap(newUnlockedMap);
    }, [course, progress, isEnrolled]);

    const handleEnroll = async () => {
        if (isEnrolled) {
            navigate(`/elearning/learn/${id}`);
            return;
        }

        const token = localStorage.getItem('jokifast_token');
        if (!token) {
            localStorage.setItem('redirect_after_login', '/elearning/course/' + id);
            alert("Login dulu ya Bang buat daftar kelas ini!");
            navigate('/login');
            return;
        }

        try {
            const res = await axiosInstance.post('/ideafast/enroll', { courseId: id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                if (res.data.redirect) navigate(res.data.redirect);
                else if (res.data.snapToken) {
                    window.snap.pay(res.data.snapToken, {
                        onSuccess: () => {
                            alert("Pembayaran Berhasil! Selamat Belajar! 🎉");
                            navigate(`/elearning/learn/${id}`);
                        },
                        onPending: () => alert("Selesaikan pembayaranmu di menu tagihan ya!"),
                        onError: () => alert("Pembayaran Gagal!"),
                        onClose: () => alert("Kok ditutup Bang? Nggak jadi beli?")
                    });
                }
            }
        } catch (error) {
            console.error("Gagal Enroll", error);
            alert("Terjadi kesalahan saat mencoba mendaftar. " + (error.response?.data?.message || ""));
        }
    };

    const handleSyllabusClick = (materiId, isUnlocked) => {
        if (!isEnrolled) {
            alert("🔒 Daftar atau Beli kelas ini dulu untuk mengakses materi!");
            document.getElementById('pricing-card')?.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (!isUnlocked) {
            alert("🔒 Materi ini masih terkunci! Selesaikan materi sebelumnya terlebih dahulu.");
            return;
        }
        navigate(`/elearning/learn/${id}`);
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;
    if (!course) return <div className="min-h-screen flex justify-center items-center text-slate-500">Kelas tidak ditemukan.</div>;

    const courseBenefits = course.benefits?.length > 0 ? course.benefits : [
        "Materi komprehensif dan terstruktur",
        "Akses seumur hidup ke materi",
        "Sertifikat kelulusan digital IDeFast"
    ];

    // 🔥 PENGAMAN PERHITUNGAN TOTAL (Anti Meledak kalau smallBranches belum ada)
    const totalMaterials = course.classes?.reduce((acc, cls) =>
        acc + (cls.branchClasses?.reduce((b, br) =>
            b + (br.smallBranches?.length || br._count?.smallBranches || 0)
            , 0) || 0)
        , 0) || 0;

    const progressPercentage = totalMaterials === 0 ? 0 : Math.round((progress.length / totalMaterials) * 100);

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 pt-20 pb-20 font-sans text-slate-900 dark:text-slate-100">

            <div className="max-w-[1220px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-8">

                {/* BREADCRUMB */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4" />
                    <Link to="/elearning" className="hover:text-indigo-600 transition-colors">Courses</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-slate-800 dark:text-slate-200 truncate max-w-[250px] font-medium">{course.title}</span>
                </div>

                <button onClick={() => navigate('/elearning')} className="sm:hidden flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Katalog
                </button>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">

                    {/* KIRI: KONTEN UTAMA */}
                    <div className="flex-1 w-full lg:max-w-[760px] bg-white dark:bg-slate-900 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm order-2 lg:order-1 overflow-hidden">

                        {/* Header Area */}
                        <div className="mb-6 flex flex-wrap items-center gap-4">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase ${course.type === 'FREE_ALL' ? 'bg-emerald-100 text-emerald-700' : 'bg-green-600 text-white'}`}>
                                {course.type === 'FREE_ALL' ? 'Free Course' : 'PRO'}
                            </span>
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/20">
                                <Star className="w-4 h-4 fill-amber-500" /> {rating} <span className="text-slate-600 dark:text-slate-400 font-medium ml-1">({reviewCount} reviews)</span>
                            </div>
                            {isEnrolled && progressPercentage === 100 && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-500 text-white shadow-lg shadow-amber-500/30 flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5" /> LULUS
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight text-slate-950 dark:text-white break-words">
                            {course.title}
                        </h1>

                        {/* VIDEO / BANNER PLAYER */}
                        <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 mb-8 sm:mb-10 shadow-xl sm:shadow-2xl shadow-slate-300 dark:shadow-none border border-slate-100 dark:border-slate-800">
                            {course.promoVideoUrl ? (
                                <video src={course.promoVideoUrl} controls poster={course.bannerUrl} className="w-full h-full object-cover" />
                            ) : course.bannerUrl ? (
                                <div className="group w-full h-full cursor-pointer relative">
                                    <img src={course.bannerUrl} alt="Course Banner" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-colors group-hover:bg-black/30 pointer-events-none">
                                        <div className="w-14 h-14 sm:w-20 sm:h-20 bg-white text-indigo-700 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 ease-out">
                                            <PlayCircle className="w-7 h-7 sm:w-10 sm:h-10 ml-0.5" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-700 flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-white/20" />
                                </div>
                            )}
                        </div>

                        {/* TABS NAVIGATION */}
                        <div className="flex items-center gap-6 sm:gap-8 border-b border-slate-200 dark:border-slate-800 mb-6 sm:mb-8 overflow-x-auto hide-scrollbar">
                            {['overview', 'syllabus'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 sm:pb-4 text-sm sm:text-base font-bold capitalize whitespace-nowrap border-b-2 transition-colors duration-200 ${activeTab === tab
                                        ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* TAB CONTENT: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="animate-in fade-in duration-300">
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-slate-950 dark:text-white">Deskripsi Kursus</h2>
                                {course.fullDescription ? (
                                    <div className="mb-8 sm:mb-12 font-sans w-full">
                                        <ReactQuill value={course.fullDescription} readOnly={true} theme="bubble" />
                                    </div>
                                ) : (
                                    <p className="text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 leading-relaxed">
                                        {course.description}
                                    </p>
                                )}

                                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-slate-950 dark:text-white">Yang Akan Anda Pelajari</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 sm:gap-x-8 mb-8 sm:mb-12">
                                    {courseBenefits.map((benefit, i) => (
                                        <div key={i} className="flex items-start gap-3.5 text-slate-700 dark:text-slate-300">
                                            <div className="mt-0.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-0.5 shrink-0">
                                                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="text-sm font-medium leading-snug break-words">{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* TAB CONTENT: SYLLABUS DENGAN REAL-TIME STATUS */}
                        {(activeTab === 'syllabus' || activeTab === 'overview') && (
                            <div className="animate-in fade-in duration-300 mt-6 sm:mt-10" id="syllabus">
                                <div className="flex items-center justify-between mb-4 sm:mb-6">
                                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white">Silabus Materi</h2>
                                    {isEnrolled && (
                                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                                            Progres Anda: {progressPercentage}%
                                        </span>
                                    )}
                                </div>

                                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                                    {course.classes?.length === 0 ? (
                                        <p className="p-10 text-center text-slate-500">Silabus sedang dalam tahap penyusunan.</p>
                                    ) : (
                                        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {course.classes?.map((cls) => (
                                                <div key={cls.id} className="p-4 sm:p-5 md:p-7 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-800 dark:text-slate-200 mb-3 sm:mb-5 flex items-center gap-2.5 sm:gap-3.5">
                                                        <span className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs sm:text-sm font-bold shrink-0">{cls.orderIndex}</span>
                                                        <span className="line-clamp-2">{cls.title}</span>
                                                    </h3>
                                                    <div className="pl-8 sm:pl-12 space-y-2.5 sm:space-y-3.5 divide-y divide-slate-100 dark:divide-slate-800/60">

                                                        {cls.branchClasses?.map((branch) => (
                                                            <div key={branch.id} className="pt-2.5 sm:pt-3.5 first:pt-0">

                                                                {/* CEK APAKAH BACKEND NGASIH MATERI DETAIL ATAU CUMA COUNT */}
                                                                {branch.smallBranches && branch.smallBranches.length > 0 ? (
                                                                    <>
                                                                        <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2.5">
                                                                            <Layers className="w-3.5 h-3.5" /> {branch.title}
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            {branch.smallBranches.map(materi => {
                                                                                const done = progress.includes(materi.id);
                                                                                const isUnlocked = unlockedMap[materi.id];

                                                                                return (
                                                                                    <button
                                                                                        key={materi.id}
                                                                                        onClick={() => handleSyllabusClick(materi.id, isUnlocked)}
                                                                                        className={`w-full flex items-center justify-between text-xs sm:text-sm p-2.5 sm:p-3 rounded-xl transition-all border ${done ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 hover:border-emerald-300'
                                                                                            : isUnlocked ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 shadow-sm'
                                                                                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-70 cursor-not-allowed'
                                                                                            }`}
                                                                                    >
                                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                                            {done ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                                                                : isUnlocked ? <PlayCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                                                                                                    : <Lock className="w-4 h-4 text-slate-400 shrink-0" />}
                                                                                            <span className={`font-semibold truncate ${done ? 'text-emerald-700 dark:text-emerald-400' : isUnlocked ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`}>
                                                                                                {materi.title}
                                                                                            </span>
                                                                                        </div>
                                                                                        {!isUnlocked && !isEnrolled && <span className="text-[10px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">PRO</span>}
                                                                                    </button>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    /* FALLBACK UI UNTUK USER YG BELUM ENROLL (Data List Materi Kosong) */
                                                                    <div className="flex items-center justify-between text-xs sm:text-sm pt-2.5 sm:pt-3.5 first:pt-0 gap-2">
                                                                        <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors min-w-0">
                                                                            <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0" />
                                                                            <span className="font-medium truncate">{branch.title}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs text-slate-400 font-medium shrink-0">
                                                                            <span>{branch._count?.smallBranches || 0} materi</span>
                                                                            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* KANAN: STICKY SIDEBAR (PRICING CARD) */}
                    <div id="pricing-card" className="w-full lg:w-[390px] lg:sticky lg:top-24 order-1 lg:order-2 shrink-0">
                        <div className="border border-indigo-100 dark:border-slate-800 bg-indigo-50/70 dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg shadow-indigo-100/50 dark:shadow-none">
                            <h3 className="text-lg font-bold mb-5 text-slate-950 dark:text-white">Detail Kelas</h3>

                            {/* PROGRESS BAR (MUNCUL KALAU UDAH BELI) */}
                            {isEnrolled && (
                                <div className="mb-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Progres Belajar</span>
                                        <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{progressPercentage}%</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-700" style={{ width: `${progressPercentage}%` }} />
                                    </div>
                                </div>
                            )}

                            <ul className="space-y-3 sm:space-y-4.5 text-xs sm:text-sm text-slate-700 dark:text-slate-400 mb-6 sm:mb-9">
                                <li className="flex items-center gap-3"><Clock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" /> Estimasi waktu {course.estimatedHours || 0} Jam</li>
                                <li className="flex items-center gap-3"><Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" /> {course.classes?.length || 0} Bab materi komprehensif</li>
                                <li className="flex items-center gap-3"><Award className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" /> Sertifikat kelulusan IDeFast</li>
                                <li className="flex items-center gap-3"><BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 shrink-0" /> Level: {course.level || 'Semua Tingkatan'}</li>
                            </ul>

                            {!isEnrolled && (
                                <div className="mb-5 sm:mb-7 mt-2">
                                    {course.price === 0 ? (
                                        <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 dark:text-white">GRATIS</div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            {course.originalPrice && course.originalPrice > course.price && (
                                                <span className="text-slate-400 line-through text-sm sm:text-base font-medium">Rp {course.originalPrice.toLocaleString('id-ID')}</span>
                                            )}
                                            <span className="text-3xl sm:text-4xl font-extrabold text-indigo-700 dark:text-indigo-400">Rp {course.price.toLocaleString('id-ID')}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tombol Utama Dinamis (Beli vs Lanjutkan) */}
                            <button onClick={handleEnroll} className={`w-full py-3.5 sm:py-4.5 font-bold rounded-xl shadow-lg transition-all active:scale-95 mb-3 flex items-center justify-center text-sm sm:text-base ${isEnrolled ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'}`}>
                                {isEnrolled ? <PlayCircle className="w-5 h-5 mr-2 shrink-0" /> : <Lock className="w-5 h-5 mr-2 shrink-0" />}
                                {isEnrolled ? 'Lanjutkan Belajar' : course.price === 0 ? 'Mulai Belajar Sekarang' : 'Beli Kelas (Buy Now)'}
                            </button>

                            {!isEnrolled && course.price > 0 && (
                                <button className="w-full py-3.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:border-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                    Beli Pakai Saldo JokiFast <ArrowLeft className="w-4 h-4 rotate-180" />
                                </button>
                            )}

                            <div className="mt-6 sm:mt-9 pt-5 sm:pt-7 border-t border-indigo-100 dark:border-slate-800">
                                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mb-3 sm:mb-4 tracking-wide uppercase">Secure payment system</p>
                                <div className="flex flex-wrap gap-2 sm:gap-2.5 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
                                    <div className="h-8 w-12 sm:h-9 sm:w-14 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-indigo-950">QRIS</div>
                                    <div className="h-8 w-12 sm:h-9 sm:w-14 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-indigo-600">BCA</div>
                                    <div className="h-8 w-12 sm:h-9 sm:w-14 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-orange-600">BNI</div>
                                    <div className="h-8 w-12 sm:h-9 sm:w-14 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md flex items-center justify-center text-[10px] sm:text-[11px] font-bold text-green-600">GoPay</div>
                                </div>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-4 sm:mt-5 flex items-center gap-1.5"><Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> Transaksi dilindungi enkripsi Midtrans</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* CSS Helpers */}
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .ql-editor { font-size: 1rem !important; line-height: 1.75 !important; padding: 0 !important; color: #475569 !important; }
                @media (min-width: 640px) { .ql-editor { font-size: 1.125rem !important; } }

                .dark .ql-editor, .dark .ql-editor p, .dark .ql-editor span, .dark .ql-editor li { color: #94a3b8 !important; }
                .dark .ql-editor h1, .dark .ql-editor h2, .dark .ql-editor h3, .dark .ql-editor strong { color: #f8fafc !important; }
                .dark .ql-editor [style*="color"]:not(pre):not(code) { color: inherit !important; }
            `}</style>
        </div>
    );
}