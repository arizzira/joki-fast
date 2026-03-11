import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, FileText, MonitorPlay } from 'lucide-react';

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
    { title: 'Format Makalah Standar Kampus', desc: 'Mulai dari margin, font, daftar isi otomatis, sampai sitasi dan daftar pustaka rapi. Lu tinggal kumpul.' },
    { title: 'Desain PPT Estetik & Modern', desc: 'Say no to template jadul. Kami bikinin desain PPT yang clean, profesional, plus animasi transisi yang smooth.' },
    { title: 'Anti-Plagiat (Turnitin Safe)', desc: 'Setiap makalah diuji dengan Turnitin Premium sebelum dikirim. Kami lampirkan bukti similarity report yang aman.' },
    { title: 'Materi Sinkron & Padat', desc: 'Isi PPT disarikan langsung dari makalah. Poin-poinnya padat dan jelas, lu tinggal modal baca aja pas presentasi depan kelas.' },
];

const jenisDokumen = [
    'Makalah Kelompok', 'Makalah Individu', 'PPT Presentasi Tugas',
    'PPT Sidang / Seminar', 'Resume Jurnal / Buku', 'Desain Template PPT'
];

export default function Makalah() {
    return (
        <div className="min-h-screen bg-white pt-24 overflow-x-hidden">

            {/* =============== HERO SECTION (UPGRADED TO 2-COLUMNS WITH IMAGE) =============== */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                {/* Layout diseimbangkan jadi 50:50 agar teks tidak tertutup gambar */}
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

                    {/* Kiri: Teks & Tombol (w-1/2, Left Aligned) */}
                    <div className="w-full lg:w-1/2 text-left z-10">
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shadow-sm">
                                <FileText className="w-7 h-7 text-purple-600" />
                            </div>
                            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wider">Tugas Harian</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            Makalah & Presentasi<br />
                            <span className="text-slate-400">(PPT)</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                            className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg">
                            Deadline makalah besok tapi belum nyari referensi? Atau disuruh presentasi tapi pusing bikin desain PPT yang nggak kaku?
                            Biar kami yang susun makalah berbobotnya, lengkap dengan PPT estetik yang siap tampil.
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

                    {/* Kanan: Gambar Kolom (w-1/2, centered/right aligned) */}
                    <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0 flex justify-center lg:justify-end">

                        {/* KUNCI UKURAN: max-w-[500px] pada desktop agar pas */}
                        <div className="relative w-full max-w-[400px] sm:max-w-[450px] lg:max-w-[500px]">

                            {/* Efek Ambient Glow menggunakan warna Ungu sesuai icon layanan */}
                            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-[80px] transform scale-110 -z-10" />

                            <motion.div
                                variants={fadeUp} initial="hidden" animate="visible" custom={4}
                                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-100 group"
                            >
                                {/* Efek floating diterapkan */}
                                <motion.img
                                    variants={floatAnim}
                                    animate="animate"
                                    src="/images/makalah.webp" // Path gambar dummy lu
                                    alt="Makalah & Presentasi (PPT)"
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
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Paket lengkap siap presentasi</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">Nggak cuma bikin dokumen panjang yang ngebosenin, kami buatin materi presentasi yang bikin dosen dan temen sekelas lu fokus.</p>
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

            {/* =============== JENIS DOKUMEN =============== */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Jenis Dokumen
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Kami bisa mengerjakan</h2>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-4">
                        {jenisDokumen.map((doc, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3}
                                className="px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                                <MonitorPlay className="w-5 h-5 text-purple-600" />
                                <span className="font-medium text-slate-900">{doc}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== CTA =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">Siap tampil pede di depan kelas?</h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">Kirimkan topik tugasnya. Kami siap bantu riset makalahnya sekaligus nge-desain PPT-nya biar lu dapet nilai A.</p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                            Pesan Paket Makalah + PPT <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}