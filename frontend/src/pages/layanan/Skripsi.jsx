import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, FileText } from 'lucide-react';

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

const keunggulan = [
    { title: 'Source Code + Dokumentasi Lengkap', desc: 'Tidak hanya mengirimkan program, kami juga menyediakan file laporan atau dokumentasi (.docx) yang menjelaskan alur aplikasi secara detail.' },
    { title: 'Sesuai Format Kampus/Modul', desc: 'Laporan praktikum atau project akhir akan dikerjakan mengikuti template dan ketentuan format dari dosen atau asisten laboratorium Anda.' },
    { title: 'Garansi Program Berjalan (Running)', desc: 'Kami pastikan program tidak ada error saat didemokan. Jika terjadi kendala saat presentasi tugas besar, kami siap bantu perbaiki.' },
    { title: 'Pengerjaan Cepat (Kebut Semalam)', desc: 'Deadline besok pagi? Tim kami siap mengeksekusi tugas coding dan penyusunan laporan dalam waktu kurang dari 24 jam.' },
];

const alurKerja = [
    { step: '01', title: 'Kirim Modul / Soal', desc: 'Kirimkan PDF tugas, panduan praktikum, atau deskripsi project akhir yang diberikan oleh dosen Anda.' },
    { step: '02', title: 'Estimasi Waktu & Harga', desc: 'Tim JokiFast akan menganalisis tingkat kesulitan dan memberikan penawaran harga serta estimasi waktu pengerjaan.' },
    { step: '03', title: 'Proses Eksekusi', desc: 'Worker kami langsung mengerjakan program dan menyusun laporan secara bersamaan sesuai requirement.' },
    { step: '04', title: 'Penyerahan File Final', desc: 'Anda akan menerima file zip berisi source code yang bersih (clean code) beserta dokumen laporan yang siap dikumpulkan.' },
];

export default function LaporanDanTugasAkhir() {
    return (
        <div className="min-h-screen bg-white pt-24 overflow-x-hidden">

            {/* =============== HERO SECTION (UPGRADED TO 2-COLUMNS WITH IMAGE) =============== */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

                    {/* Kiri: Teks & Tombol (w-1/2) */}
                    <div className="w-full lg:w-1/2 text-left z-10">
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm">
                                <FileText className="w-7 h-7 text-amber-600" />
                            </div>
                            <span className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Layanan Akademik</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            Laporan Praktikum <br />
                            <span className="text-slate-400">& Tugas Akhir IT</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                            className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed">
                            Tugas koding numpuk ditambah kewajiban bikin laporan berlembar-lembar?
                            Serahkan pada kami. Mulai dari aplikasi sederhana hingga project akhir semester, kami berikan hasil yang rapi dan program yang dijamin berjalan lancar.
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

                    {/* Kanan: Gambar Banner Lu (w-1/2) */}
                    <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0 flex justify-center lg:justify-end">

                        {/* Wrapper gambar dengan max-width terukur biar presisi */}
                        <div className="relative w-full max-w-[400px] sm:max-w-[450px] lg:max-w-[500px]">

                            {/* Efek Ambient Glow warna Emerald (Hijau) menyesuaikan gambar */}
                            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px] transform scale-110 -z-10" />

                            <motion.div
                                variants={fadeUp} initial="hidden" animate="visible" custom={4}
                                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-100 group"
                            >
                                <motion.img
                                    variants={floatAnim}
                                    animate="animate"
                                    src="/images/laporan.webp"
                                    alt="Laporan Praktikum & Tugas Akhir"
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
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Kenapa Pilih Kami?
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Solusi Instan Tugas IT Anda</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Kami paham betul standar tugas kampus. Program harus jalan, laporan harus rapi, dan semua harus sesuai dengan modul yang diberikan dosen.</p>
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

            {/* =============== ALUR KERJA =============== */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Cara Pemesanan
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Alur Kerja Cepat & Transparan</h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {alurKerja.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-3xl font-bold text-blue-600/20 mb-4">{item.step}</div>
                                <h3 className="font-medium text-slate-900 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== CTA =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">Deadline sudah di depan mata?</h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">Jangan buang waktu lagi. Kirimkan soal atau panduan tugas Anda sekarang, dan biarkan kami yang menyelesaikannya malam ini juga.</p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                            Lempar Tugas Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}