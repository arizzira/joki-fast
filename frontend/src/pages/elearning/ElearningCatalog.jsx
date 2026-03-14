import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { motion } from 'framer-motion';
import {
    BookOpen, Users, Layers, ArrowRight, Loader2,
    Sparkles, Star, Clock, TrendingUp, Search,
    ChevronRight, Zap, Award, Filter
} from 'lucide-react';

// 👇 1. IMPORT KOMPONEN COUNTUP YANG BARU DIBIKIN (Sesuaikan path-nya ya Bang!)
import CountUp from '../../components/CountUp';

/* ── category pills ── */
const CATEGORIES = ['Semua', 'Web Development', 'UI/UX Design', 'Mobile Development', 'Data Science', 'DevOps', 'Business'];

/* ── STAT CARDS DIUBAH BIAR BISA DIPAKE SAMA COUNTUP ── */
const STATS = [
    // num: angka yang mau dianimasiin, suffix: huruf di belakangnya
    { icon: BookOpen, num: 21, suffix: 'Jam+', label: 'Materi Gratis' },
    { icon: Users, num: 247, suffix: '', label: 'Siswa Terdaftar' },
    { icon: Award, num: 98, suffix: '%', label: 'Tingkat Lulus' },
];

/* ── Animation Variants ── */
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', duration: 0.8, bounce: 0.3 } }
};

const fadeScale = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', duration: 0.6 } }
};

export default function ElearningCatalog() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const res = await axiosInstance.get('/ideafast/public/catalog');
                if (res.data.success) setCourses(res.data.data);
            } catch (e) {
                console.error('Gagal load catalog', e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleCourseClick = (courseId) => {
        const token = localStorage.getItem('jokifast_token');
        if (!token) {
            alert('Login dulu ya Bang buat akses E-Learning!');
            navigate('/login');
        } else {
            navigate(`/elearning/course/${courseId}`);
        }
    };

    // Filter dinamis berdasarkan Pencarian DAN Kategori
    const filtered = courses.filter(c => {
        const matchSearch = c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = activeCategory === 'Semua' || c.category === activeCategory;
        return matchSearch && matchCategory;
    });

    return (
        <div className="min-h-screen bg-[#f8f7f4]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

            {/* ══════════ HERO WITH BACKGROUND IMAGE ══════════ */}
            <section className="relative pt-32 pb-36 sm:pt-36 sm:pb-44 overflow-hidden">

                <motion.div
                    initial={{ scale: 1.05, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <img
                        src="/elarning/bg-1.jpeg"
                        alt=""
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0" style={{
                        background: 'linear-gradient(to bottom, rgba(2,6,23,0.82) 0%, rgba(2,6,23,0.70) 50%, rgba(248,247,244,0.6) 85%, #f8f7f4 100%)'
                    }} />
                </motion.div>

                <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{
                    background: 'linear-gradient(to bottom, transparent, #f8f7f4)'
                }} />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="max-w-3xl mx-auto text-center"
                    >

                        <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-black uppercase tracking-[0.15em] border border-white/15 mb-7 shadow-lg shadow-black/10">
                            IDeFast | JokiFast
                        </motion.span>

                        <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-[3.5rem] font-extrabold text-white leading-[1.1] tracking-tight mb-6">
                            Tingkatkan Skill, Fast Learn, Faster Scale.
                        </motion.h1>

                        <motion.p variants={fadeUp} className="text-white/80 text-lg leading-relaxed max-w-xl mx-auto mb-10 font-medium">
                            Belajar banyak hal gak perlu modal. Banyak gratisnya lagi.
                            Pilih kursus yang sesuai kebutuhanmu.
                        </motion.p>

                        <motion.div variants={fadeUp} className="relative max-w-lg mx-auto mb-10 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/40 pointer-events-none group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Cari kursus, topik, skill…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/50 text-sm font-medium shadow-xl shadow-black/10 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/15 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold transition-colors"
                                >✕</button>
                            )}
                        </motion.div>

                        <motion.button
                            variants={fadeUp}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-extrabold rounded-2xl shadow-xl shadow-white/10 hover:shadow-white/20 hover:bg-slate-50 transition-all text-sm tracking-wide"
                        >
                            Jelajahi Kursus <ArrowRight className="w-4 h-4" />
                        </motion.button>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.5 } }
                        }}
                        className="flex items-center justify-center gap-4 sm:gap-6 mt-14 flex-wrap relative z-10"
                    >
                        {/* 👇 2. RENDER COUNTUP DI SINI 👇 */}
                        {STATS.map(({ icon: Icon, num, suffix, label }) => (
                            <motion.div key={label} variants={fadeScale} className="flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 hover:border-white/30 shadow-lg shadow-black/5 rounded-2xl px-5 sm:px-6 py-3.5 sm:py-4 transition-all hover:-translate-y-1 cursor-default">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0 shadow-inner">
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xl sm:text-2xl font-black text-white leading-none tracking-tight flex items-center">
                                        <CountUp
                                            from={0}
                                            to={num}
                                            direction="up"
                                            duration={2}
                                            className="inline-block"
                                        />
                                        {suffix}
                                    </p>
                                    <p className="text-[11px] sm:text-xs text-white/70 font-semibold mt-1 tracking-wide uppercase">{label}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ══════════ CATALOG ══════════ */}
            <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 relative z-10">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10"
                >
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                            {searchQuery ? `Hasil untuk "${searchQuery}"` : 'Semua Kursus'}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            {filtered.length} kursus tersedia untuk dipelajari
                        </p>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all active:scale-95 ${activeCategory === cat
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                        <p className="text-slate-500 text-sm font-bold tracking-wide">Memuat kursus terbaik…</p>
                    </motion.div>
                )}

                {!loading && filtered.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                            <Search className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl text-slate-900 font-extrabold mb-2 tracking-tight">Kursus tidak ditemukan</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">Mungkin coba gunakan kata kunci yang lebih spesifik atau ubah filter pencarianmu.</p>
                    </motion.div>
                )}

                {!loading && filtered.length > 0 && (
                    <motion.div
                        variants={{
                            hidden: { opacity: 0 },
                            show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                        }}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
                    >
                        {filtered.map((course, i) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                index={i}
                                onClick={() => handleCourseClick(course.id)}
                            />
                        ))}
                    </motion.div>
                )}
            </section>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
            `}</style>
        </div>
    );
}

function CourseCard({ course, index, onClick }) {
    const isFree = course.type === 'FREE_ALL';

    const gradients = [
        'from-violet-500 to-indigo-600',
        'from-cyan-500 to-blue-600',
        'from-rose-500 to-pink-600',
        'from-amber-500 to-orange-500',
        'from-emerald-500 to-teal-600',
        'from-fuchsia-500 to-purple-600',
    ];
    const gradient = gradients[index % gradients.length];

    return (
        <motion.div
            variants={fadeUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={onClick}
            className="group bg-white rounded-3xl border border-slate-100 overflow-hidden
                shadow-sm hover:shadow-2xl hover:shadow-slate-200/80 transition-all duration-300
                cursor-pointer flex flex-col h-full"
        >
            <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-100 shrink-0">
                {course.bannerUrl ? (
                    <img
                        src={course.bannerUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
                    />
                ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-700 ease-in-out`}>
                        <BookOpen className="w-14 h-14 text-white/30" />
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${isFree
                        ? 'bg-emerald-500/90 text-white border border-emerald-400/50 shadow-emerald-900/20'
                        : 'bg-amber-500/90 text-white border border-amber-400/50 shadow-amber-900/20'
                        }`}>
                        {isFree ? <Zap className="w-3.5 h-3.5 fill-white" /> : <Star className="w-3.5 h-3.5 fill-white" />}
                        {isFree ? 'Gratis' : 'Premium'}
                    </span>

                    {course.category && course.category !== 'Semua' && (
                        <span className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold">
                            {course.category}
                        </span>
                    )}
                </div>

                <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-[11px] font-black text-slate-800 shadow-lg">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        {course._count?.classes || 0} Bab Materi
                    </span>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col bg-white">
                <h3 className="text-lg font-extrabold text-slate-900 leading-snug mb-2.5 line-clamp-2 group-hover:text-indigo-600 transition-colors tracking-tight">
                    {course.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-5 flex-1 font-medium">
                    {course.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-slate-500 font-bold mb-5 bg-slate-50 py-2.5 px-4 rounded-xl border border-slate-100/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        {course.level || 'Semua Level'}
                    </span>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-slate-100/80">
                    <div>
                        {isFree ? (
                            <span className="text-xl font-black text-emerald-600 tracking-tight">GRATIS</span>
                        ) : (
                            <div className="flex flex-col">
                                {course.originalPrice && course.originalPrice > course.price && (
                                    <span className="text-[10px] text-slate-400 font-bold line-through">
                                        Rp {course.originalPrice.toLocaleString('id-ID')}
                                    </span>
                                )}
                                <span className="text-lg font-black text-indigo-700 tracking-tight">
                                    Rp {course.price?.toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                    </div>
                    <button className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                        <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}