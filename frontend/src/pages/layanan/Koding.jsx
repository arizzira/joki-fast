import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Terminal, Cpu } from 'lucide-react';

/* ============================================================
   ANIMATION VARIANTS
============================================================ */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    }),
};

// Efek melayang (floating) khusus buat gambar Hero
const floatAnim = {
    animate: {
        y: [0, -10, 0],
        transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
};

const languages = ['Python', 'Java', 'C / C++', 'JavaScript', 'Go', 'PHP', 'Kotlin', 'Dart (Flutter)'];

const keunggulan = [
    { title: 'Solusi Step-by-Step', desc: 'Bukan cuma jawaban final. Kami jelaskan alur logika dan setiap langkah algoritmanya agar Anda paham.' },
    { title: 'Berbagai Mata Kuliah', desc: 'Struktur data, OOP, algoritma, basis data, pemrograman web, mobile, dan competitive programming.' },
    { title: 'Kode Bersih & Terdokumentasi', desc: 'Setiap kode diberi komentar penjelasan agar mudah dipresentasikan ke dosen atau dipahami sendiri.' },
    { title: 'Deadline Express', desc: 'Tugas mendadak besok pagi? Kami punya tim standby 24/7 untuk pengerjaan express.' },
];

export default function Koding() {
    return (
        <div className="min-h-screen bg-white pt-24 overflow-x-hidden">

            {/* =============== HERO SECTION (UKURAN GAMBAR SUDAH DI-ADJUST PAS) =============== */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                {/* Layout diseimbangkan jadi 50:50 */}
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

                    {/* Kiri: Teks & Tombol (Sekarang w-1/2) */}
                    <div className="w-full lg:w-1/2 text-left z-10">
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">
                                <Terminal className="w-7 h-7 text-emerald-600" />
                            </div>
                            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Paling Laris</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            Tugas Koding &<br />
                            <span className="text-slate-400">Algoritma</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                            className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                            Stuck di tugas struktur data? Bingung implementasi sorting, graph, atau dynamic programming?
                            Serahkan ke tim kami kode bersih, terdokumentasi, dan pasti jalan.
                        </motion.p>

                        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-wrap gap-4">
                            <Link to="/order" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300 flex items-center gap-2">
                                Konsultasi Tugas Ini <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link to="/harga" className="px-8 py-4 border-2 border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 bg-white font-medium rounded-xl transition-all duration-300 shadow-sm flex items-center gap-2">
                                Cek Harga
                            </Link>
                        </motion.div>
                    </div>

                    {/* Kanan: Gambar Banner Lu (Sekarang w-1/2) */}
                    <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0 flex justify-center lg:justify-end">

                        {/* KUNCI UKURAN: max-w-[500px] biar gambarnya ga kegedean, tapi tetep proper */}
                        <div className="relative w-full max-w-[400px] sm:max-w-[450px] lg:max-w-[500px]">

                            {/* Efek Ambient Glow */}
                            <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-[80px] transform scale-110 -z-10" />

                            <motion.div
                                variants={fadeUp} initial="hidden" animate="visible" custom={4}
                                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-100 group"
                            >
                                <motion.img
                                    variants={floatAnim}
                                    animate="animate"
                                    src="/images/tugascoding.webp"
                                    alt="Tugas Koding & Algoritma"
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </motion.div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =============== KEUNGGULAN =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16 text-center">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Kenapa Pilih Kami?
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Tugas koding selesai, nilai aman</h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {keunggulan.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 2}
                                className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-5 border border-blue-100">
                                    <Check className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== BAHASA PEMROGRAMAN =============== */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Bahasa Pemrograman
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Kami support banyak bahasa</h2>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {languages.map((lang, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 4}
                                className="px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                                <Cpu className="w-5 h-5 text-blue-600" />
                                <span className="font-medium text-slate-900">{lang}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== CTA =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">Tugas koding bikin pusing?</h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">Kirimkan soal atau requirement Anda. Kami kasih estimasi harga dan waktu pengerjaan dalam hitungan menit.</p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                            Konsultasi Gratis Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}