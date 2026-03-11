import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, MessageCircle, AlertCircle, FileText, Code2, PenTool, Globe, BookOpen } from 'lucide-react';

/* ============================================================
   ANIMATION VARIANTS
=========================================================== */
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

/* ============================================================
   DATA HARGA & LAYANAN
=========================================================== */
const pricingCategories = [
    {
        id: 'makalah',
        title: 'Tugas Harian, Makalah & PPT',
        desc: 'Solusi cepat untuk tugas berbasis dokumen dengan kuantitas tinggi. Kualitas format terjamin.',
        icon: <FileText className="w-6 h-6" />,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        glow: 'shadow-emerald-500/20',
        items: [
            {
                name: 'Makalah / Esai / Resume Jurnal',
                price: 'Rp 50.000 - Rp 150.000',
                detail: 'Tergantung jumlah halaman & bahasa (ID/EN)'
            },
            {
                name: 'Presentasi PPT (Estetik + Materi)',
                price: 'Rp 50.000 - Rp 100.000',
                detail: 'Desain profesional & materi terstruktur'
            }
        ]
    },
    {
        id: 'koding',
        title: 'Tugas Koding & Algoritma',
        desc: 'Bantuan praktikum mingguan atau perbaikan bug (error) pada program Anda.',
        icon: <Code2 className="w-6 h-6" />,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        glow: 'shadow-blue-500/20',
        popular: true,
        items: [
            {
                name: 'Bug Fixing / Error Kecil',
                price: 'Rp 50.000 - Rp 100.000',
                detail: 'Analisis & perbaikan kode yang bermasalah'
            },
            {
                name: 'Tugas Praktikum (CLI Based)',
                price: 'Rp 100.000 - Rp 250.000',
                detail: 'Cakupan 1-3 modul praktikum'
            }
        ]
    },
    {
        id: 'uiux',
        title: 'UI/UX Design (Figma)',
        desc: 'Perancangan antarmuka pengguna (UI) untuk tugas rekayasa perangkat lunak maupun sistem informasi.',
        icon: <PenTool className="w-6 h-6" />,
        color: 'text-pink-600',
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        glow: 'shadow-pink-500/20',
        items: [
            {
                name: 'Wireframe / Desain UI',
                price: 'Rp 100.000 - Rp 250.000',
                detail: 'Desain antarmuka 1-5 screen (halaman)'
            },
            {
                name: 'Full App Prototype',
                price: 'Rp 300.000 - Rp 700.000+',
                detail: 'Desain presisi tinggi & interaktif'
            }
        ]
    },
    {
        id: 'webdev',
        title: 'Web & Aplikasi Full-Stack',
        desc: 'Pengembangan sistem dari hulu ke hilir (Frontend, Backend, Database, hingga Deployment).',
        icon: <Globe className="w-6 h-6" />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        glow: 'shadow-indigo-500/20',
        items: [
            {
                name: 'Web Sederhana (CRUD Basic)',
                price: 'Rp 300.000 - Rp 600.000',
                detail: 'Sistem dasar berbasis HTML/CSS/PHP'
            },
            {
                name: 'Sistem Menengah / Kompleks',
                price: 'Rp 1.000.000 - Rp 2.500.000',
                detail: 'Manajemen organisasi, bot otomatisasi, logic kompleks'
            }
        ]
    },
    {
        id: 'skripsi',
        title: 'Laporan Praktikum & Tugas Akhir',
        desc: 'Layanan holistik untuk proyek akhir atau skripsi. Dukungan penuh hingga tahap implementasi dan revisi.',
        icon: <BookOpen className="w-6 h-6" />,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        glow: 'shadow-amber-500/20',
        items: [
            {
                name: 'Laporan / Bab 1-3',
                price: 'Rp 500.000 - Rp 1.500.000',
                detail: 'Penyusunan riset, metodologi, dan dasar teori'
            },
            {
                name: 'Full All-in (App + Laporan + Support)',
                price: 'Rp 3.000.000 - Rp 6.000.000+',
                detail: 'Pengembangan Web/App + Dokumen Skripsi + Support Sidang'
            }
        ]
    }
];

export default function Harga() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white pt-24 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* =============== HEADER SECTION =============== */}
            <section className="py-20 px-6 lg:px-12 bg-white text-center relative overflow-hidden">
                {/* Background Ambient Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-64 bg-blue-50 rounded-full blur-[100px] -z-10 opacity-70"></div>

                <div className="max-w-4xl mx-auto z-10 relative">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-sm font-semibold text-blue-600 mb-8 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Estimasi Transparansi Harga
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-slate-900 mb-6 leading-[1.15]">
                            Investasi Terbaik untuk <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                Kesuksesan Akademik Anda.
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
                            Penetapan harga berbasis nilai (value-based pricing). Kami memastikan Anda mendapatkan kualitas pengerjaan level profesional dengan harga yang masuk akal.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* =============== DISCLAIMER NEGO =============== */}
            <section className="px-6 lg:px-12 -mt-4 relative z-20">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        variants={fadeUp} initial="hidden" animate="visible" custom={1}
                        className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-xl shadow-slate-200/40 relative overflow-hidden"
                    >
                        {/* Decorative background accent */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 transition-transform duration-500 ease-out group-hover:scale-110"></div>

                        <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200 shadow-sm">
                            <AlertCircle className="w-7 h-7 text-amber-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Fleksibilitas Negosiasi Project</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Rentang harga di bawah ini adalah estimasi awal. Biaya akhir akan disesuaikan dengan <b>tingkat kompleksitas instruksi</b>, <b>persyaratan sistem</b>, dan <b>urgensi tenggat waktu (deadline)</b>. Silakan konsultasikan anggaran (budget) Anda dengan tim kami.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* =============== PRICING CATEGORIES =============== */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 mt-16 border-t border-slate-100 relative">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.h2 variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
                            className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
                            Katalog Layanan & Harga
                        </motion.h2>
                    </div>

                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start"
                    >
                        {pricingCategories.map((category, index) => (
                            <motion.div
                                key={category.id}
                                variants={fadeUp}
                                className={`relative bg-white rounded-3xl p-8 border hover:-translate-y-2 transition-all duration-300 ease-out flex flex-col h-full ${category.popular
                                    ? 'border-blue-500 shadow-2xl shadow-blue-900/10 lg:-translate-y-4 lg:hover:-translate-y-6 z-10 ring-1 ring-blue-500/20'
                                    : 'border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 hover:shadow-slate-200/50'
                                    }`}
                            >
                                {category.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-lg">
                                        Paling Diminati
                                    </div>
                                )}

                                <div>
                                    <div className={`w-14 h-14 ${category.bg} ${category.border} ${category.color} border rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                                        {category.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">{category.title}</h3>
                                    <p className="text-slate-500 text-sm mb-8 leading-relaxed h-[60px]">{category.desc}</p>
                                </div>

                                <div className="space-y-6 mb-8 flex-1">
                                    {category.items.map((item, i) => (
                                        <div key={i} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-slate-300 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                                            <div className="font-semibold text-slate-900 mb-1">{item.name}</div>
                                            <div className={`text-lg font-bold mb-2 ${category.color}`}>{item.price}</div>
                                            <div className="text-xs text-slate-500 leading-relaxed font-medium">{item.detail}</div>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/login"
                                    className={`mt-auto w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${category.popular
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 hover:border-slate-300'
                                        }`}
                                >
                                    Pesan Sekarang <ArrowRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* =============== CTA SECTION =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-slate-900 to-blue-900 p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-6">
                            Memiliki Spesifikasi Sistem yang Unik?
                        </h2>
                        <p className="text-blue-100/80 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                            Abaikan tabel harga di atas. Kirimkan dokumen Requirement atau instruksi tugas Anda secara langsung. Tim ahli kami akan memberikan penawaran eksklusif dalam beberapa menit.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://wa.me/6282316877935" // TODO: Update WhatsApp number
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-xl shadow-lg shadow-[#25D366]/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Konsultasi via WhatsApp
                            </a>
                            <Link
                                to="/login"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all duration-300 backdrop-blur-sm"
                            >
                                Buat Akun Dulu
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}