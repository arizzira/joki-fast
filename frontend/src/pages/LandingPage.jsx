import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Lenis from '@studio-freight/lenis';
import Spline from '@splinetool/react-spline';

/* ============================================================
   ANIMATION VARIANTS (SUPER SMOOTH)
============================================================ */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    }),
};

const floatAnim = (duration = 4, yOffset = 15, rot = 5) => ({
    animate: {
        y: [0, yOffset, 0],
        rotate: [0, rot, -rot, 0],
        scale: [1, 1.05, 1],
        transition: { duration, repeat: Infinity, ease: "easeInOut" }
    }
});

/* ============================================================
   DATA TUGAS & LAYANAN
============================================================ */
const availableTasks = [
    { title: "Pembuatan Web & Aplikasi", desc: "Bikin website full-stack pakai React, Express, atau Go. Lengkap dengan integrasi database tangguh seperti PostgreSQL.", icon: "💻", route: "/layanan/web-dev" },
    { title: "Laporan & Tugas Akhir IT", desc: "Menjamin memberikan kualitas Laporan dan hasil tugas sesuai dan memuaskan, Harga minimalis dan revisi yang dapat disesuaikan.", icon: "🎓", route: "/layanan/skripsi" },
    { title: "Tugas Koding & Algoritma", desc: "Stuck ngerjain tugas struktur data, OOP, atau algoritma? Kami bantu selesaikan pakai Python, Java, C++, dll.", icon: "⌨️", route: "/layanan/koding" },
    { title: "Makalah & PPT Akademik", desc: "Penyusunan makalah rapi, PPT yang mudah dibaca, difahami dan tentunya menarik untuk di anda presentasikan.", icon: "📄", route: "/layanan/makalah" },
    { title: "Desain UI/UX (Figma)", desc: "Bikin wireframe, mockup, sampai interactive prototype di Figma buat tugas Interaksi Manusia & Komputer (IMK).", icon: "🎨", route: "/layanan/ui-ux" },
    { title: "Tugas Harian (Disesuaikan)", desc: "Kami menjamin kelengkapan jasa kami terbuka untuk semua jurusan dan kalangan Kuliah/Sekolah, dapat kamu bantu.", icon: "🗄️", route: "/layanan/server" }
];

const langkahOrder = [
    { step: '01', title: 'Kirim Detail Tugas', desc: 'Konsultasikan deadline, format, dan lampirkan file soal ke admin kami. Kami akan berikan estimasi harga terbaik.' },
    { step: '02', title: 'Proses Pengerjaan', desc: 'Lakukan pembayaran DP, dan worker expert kami akan langsung mengeksekusi tugas lu dengan jaminan privasi aman.' },
    { step: '03', title: 'Terima Beres & Revisi', desc: 'File final dikirim tepat waktu. Ada yang kurang pas sama arahan dosen? Tinggal minta revisi, gratis!' }
];

export default function LandingPage() {

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
        return () => { lenis.destroy(); };
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">

            {/* =============== HERO SECTION =============== */}
            <section
                className="relative pt-32 pb-20 px-6 lg:px-12 flex flex-col items-center justify-center min-h-[90vh]"
                style={{
                    backgroundImage: 'radial-gradient(#e5e7eb 1.5px, transparent 1.5px)',
                    backgroundSize: '24px 24px'
                }}
            >
                <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none z-0">
                    <motion.img variants={floatAnim(6, 20, 5)} animate="animate" src="/images/float-1.webp" alt="Float 1" className="absolute top-[15%] left-[5%] w-20 sm:w-20 drop-shadow-2xl opacity-60 md:opacity-100" />
                    <motion.img variants={floatAnim(7, -15, -8)} animate="animate" src="/images/float-2.webp" alt="Float 2" className="absolute top-[15%] right-[-5%] w-22 sm:w-16 md:w-50 drop-shadow-2xl opacity-60 md:opacity-100" />
                    <motion.img variants={floatAnim(5.5, 25, 6)} animate="animate" src="/images/float-3.webp" alt="Float 3" className="absolute bottom-[35%] md:bottom-[20%] left-[8%] md:left-[10%] w-20 md:w-40 drop-shadow-2xl opacity-50 md:opacity-100" />
                </div>

                <div className="relative z-10 text-center max-w-4xl mx-auto flex flex-col items-center pt-10">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100">
                        <div className="grid grid-cols-2 gap-1 w-8 h-8">
                            <div className="bg-blue-500 rounded-full"></div>
                            <div className="bg-slate-800 rounded-full"></div>
                            <div className="bg-slate-800 rounded-full"></div>
                            <div className="bg-slate-800 rounded-full"></div>
                        </div>
                    </motion.div>

                    <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1} className="text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1] relative z-10">
                        Tugas, Project, dan Laprak <br className="hidden md:block" />
                        <span className="text-slate-400">semua beres di sini</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2} className="text-lg text-slate-500 mb-10 max-w-xl relative z-10 bg-white/50 backdrop-blur-md rounded-2xl p-2 md:bg-transparent md:backdrop-blur-none">
                        Kelola tenggat waktu dengan efisien dan serahkan tugas IT & Akademik Anda kepada expert kami.
                    </motion.p>

                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="relative z-20">
                        <Link to="/login" className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300">
                            Mulai Sekarang
                        </Link>
                    </motion.div>
                </div>

                <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="relative w-full max-w-[80rem] mx-auto mt-20 z-20">
                    <div className="rounded-[2rem] border border-slate-200/60 bg-white/50 p-2 backdrop-blur-sm shadow-2xl shadow-slate-200/50">
                        <img src="/images/hero-dashboard.webp" alt="Joki Fast Dashboard" className="w-full h-auto rounded-[1.5rem] border border-slate-100 object-cover" />
                    </div>
                </motion.div>
            </section>

            {/* =============== LOGO SECTION =============== */}
            <section className="py-12 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-medium text-slate-400 mb-8">Beberapa yang dapat kami lakukan</p>
                    <div className="flex flex-wrap justify-center items-center gap-6 md:gap-14">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                            <motion.div whileHover={{ scale: 1.1, rotate: Math.random() * 10 - 5 }} key={num} className="w-16 h-16 md:w-20 md:h-20 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center cursor-pointer transition-shadow">
                                <img src={`/images/logo-${num}.webp`} alt={`Tech Logo ${num}`} className="w-10 h-10 md:w-12 md:h-12 object-contain opacity-80" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== PROBLEM / AGITATE SECTION (POST 1 - DIPERBESAR) =============== */}
            <section className="py-20 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-12 lg:gap-16">
                    {/* Bagian Teks (Porsi lebih kecil agar padat) */}
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full md:w-5/12">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            #JKFastBantu
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-6">Overthinking gara-gara deadline numpuk?</h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                            Sudah saatnya berhenti begadang. Percayakan pengerjaan tugas kuliah atau project IT Anda kepada tim JokiFast. Anda dapat berfokus pada prioritas lain, sementara kami menangani sisanya.
                        </p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                            Coba Joki Fast <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>

                    {/* Bagian Gambar (Porsi dominan, ukuran maksimal) */}
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full md:w-7/12 relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-transparent rounded-[2.5rem] transform translate-x-4 translate-y-4 -z-10"></div>
                        <img src="/images/post-1.webp" alt="Jangan Pusing" className="w-full h-auto rounded-[2.5rem] shadow-2xl border border-slate-100 object-cover" />
                    </motion.div>
                </div>
            </section>

            {/* =============== FEATURES GRID SECTION =============== */}
            <section className="py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-14">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Fitur Layanan
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">Pantau semuanya dari satu tempat</h2>
                        <p className="text-slate-500 text-lg">Lupakan rasa cemas menunggu kabar tugas Anda.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div whileHover={{ y: -5 }} className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-center gap-8 transition-transform duration-300">
                            <div className="flex-1">
                                <h3 className="text-2xl font-medium text-slate-900 mb-3">Kolaborasi Seamless</h3>
                                <p className="text-slate-500 leading-relaxed mb-6">Kerja sama dengan worker kami secara efisien. Pantau progress, berikan revisi, dan terima update secara real-time langsung dari dashboard.</p>
                            </div>
                            <div className="flex-1 w-full relative">
                                <img src="/images/feat-ui-1.webp" alt="Feature UI" className="w-full rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 translate-x-4 md:translate-x-10" />
                            </div>
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between overflow-hidden relative transition-transform duration-300">
                            <div>
                                <h3 className="text-xl font-medium text-slate-900 mb-2">Manajemen Waktu</h3>
                                <p className="text-slate-500 text-sm">Sistem terintegrasi yang memastikan tidak ada deadline yang terlewat.</p>
                            </div>
                            <img src="/images/feat-ui-2.webp" alt="Time UI" className="w-full mt-8 rounded-t-xl shadow-lg border-x border-t border-slate-100 translate-y-4" />
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm overflow-hidden relative transition-transform duration-300">
                            <h3 className="text-xl font-medium text-slate-900 mb-2">Tracking Lanjutan</h3>
                            <p className="text-slate-500 text-sm mb-6">Lihat secara detail proses pengerjaan dari awal hingga akhir.</p>
                            <img src="/images/feat-ui-3.webp" alt="Track UI" className="w-full rounded-xl shadow-lg border border-slate-100" />
                        </motion.div>

                        <motion.div whileHover={{ y: -5 }} className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center transition-transform duration-300">
                            <h3 className="text-2xl font-medium text-slate-900 mb-3">Garansi Program 100% Running</h3>
                            <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                                Nggak perlu panik tiba-tiba ada pesan *error* pas demo di depan dosen penguji. Kami pastikan *source code* berjalan mulus, rapi (*clean code*), dan siap presentasi.
                            </p>
                            <div className="mt-8 flex flex-wrap justify-center gap-4">
                                {/* Ala ala Terminal Status */}
                                <div className="px-6 py-3 bg-slate-900 rounded-xl border border-slate-800 font-mono text-sm font-medium text-emerald-400 flex items-center gap-2 shadow-sm">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Build: Successful
                                </div>
                                {/* Badge Garansi */}
                                <div className="px-6 py-3 bg-blue-50 rounded-xl border border-blue-100 font-mono text-sm font-medium text-blue-600 flex items-center gap-2 shadow-sm">
                                    ✓ Support & Revisi Bug
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* =============== SERVICES SECTION =============== */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-14">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Layanan Kami
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-4">Tugas yang bisa kami kerjakan</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Dari penyusunan makalah mingguan hingga penyelesaian kompleksitas kode skripsi, tim kami siap mengeksekusi.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableTasks.map((task, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} custom={i % 3} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200 transition-all duration-500 flex flex-col h-full group cursor-pointer">
                                <div className="text-4xl mb-6 bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-100 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-sm">
                                    {task.icon}
                                </div>
                                <h3 className="text-xl font-medium text-slate-900 mb-3">{task.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow">{task.desc}</p>
                                <Link to={task.route} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                                    Baca lebih lanjut <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== TRUST BANNER SECTION (BANNER 1 - DIPERBESAR) =============== */}
            <section className="py-20 bg-slate-50 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/10 border border-slate-200 bg-white group">
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 transition-colors duration-500 z-10 pointer-events-none"></div>
                        <img src="/images/banner-1.webp" alt="Did You Know?" className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-700" />
                    </motion.div>
                </div>
            </section>

            {/* =============== CARA ORDER SECTION (Pengganti Testimoni) =============== */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-14">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Cara Pemesanan
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900">3 Langkah mudah menuju <br /> ketenangan batin</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {langkahOrder.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
                            >
                                {/* Efek Tipografi Angka Raksasa di Background */}
                                <div className="text-7xl font-black text-slate-200/50 absolute -top-4 -right-2 group-hover:text-blue-100 transition-colors duration-300 select-none">
                                    {item.step}
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-medium text-slate-900 mb-4 mt-6">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== RECRUITMENT SECTION (POST 2 - DIPERBESAR) =============== */}
            <section className="py-20 bg-slate-50 border-t border-slate-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-16">
                    {/* Bagian Gambar (Porsi dominan, lebar maksimal) */}
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full md:w-7/12 relative">
                        <div className="absolute inset-0 bg-gradient-to-bl from-blue-100 to-transparent rounded-[2.5rem] transform -translate-x-4 translate-y-4 -z-10"></div>
                        <img src="/images/post-2.webp" alt="Join Worker" className="w-full h-auto rounded-[2.5rem] shadow-2xl border border-slate-100 object-cover" />
                    </motion.div>

                    {/* Bagian Teks (Lebih padat dan terpusat) */}
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="w-full md:w-5/12">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-6">
                            Open Recruitment
                        </div>
                        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-slate-900 mb-6">Punya keahlian teknis? Konversi menjadi penghasilan.</h2>
                        <p className="text-slate-500 text-lg leading-relaxed mb-8">
                            JokiFast membuka kesempatan bagi para talenta IT, desainer, maupun akademisi untuk bergabung menjadi Elite Worker. Nikmati fleksibilitas waktu kerja dengan kompensasi yang transparan.
                        </p>
                        <Link to="/carrier/login" className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/30">
                            Join Jadi Worker <ArrowRight className="w-4 h-4" />
                        </Link>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}