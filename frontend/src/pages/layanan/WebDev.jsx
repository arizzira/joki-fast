import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Code, Database, Globe, Server, Smartphone, Zap } from 'lucide-react';

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

const techStack = [
    { name: 'React / Next.js', desc: 'Frontend modern & SPA' },
    { name: 'Express / Hono', desc: 'Backend REST API' },
    { name: 'Go (Golang)', desc: 'High-performance backend' },
    { name: 'PostgreSQL / MySQL', desc: 'Database relasional' },
    { name: 'MongoDB', desc: 'NoSQL database' },
    { name: 'Tailwind CSS', desc: 'Utility-first styling' },
];

const keunggulan = [
    { title: 'Source Code 100% Original', desc: 'Bukan copy-paste dari GitHub. Setiap baris kode ditulis khusus untuk kebutuhan project Anda.' },
    { title: 'Garansi Jalan & Revisi', desc: 'Kami pastikan aplikasi berjalan sempurna. Revisi gratis sampai Anda puas dan lolos sidang.' },
    { title: 'Dokumentasi Lengkap', desc: 'Dilengkapi README, panduan instalasi, ERD, dan penjelasan fitur untuk keperluan presentasi.' },
    { title: 'Deploy-Ready', desc: 'Aplikasi siap di-deploy ke hosting. Kami bantu setup domain, VPS, atau Vercel jika dibutuhkan.' },
];

export default function WebDev() {
    return (
        <div className="min-h-screen bg-white pt-24 overflow-x-hidden">

            {/* =============== HERO SECTION (UPGRADED TO 2-COLUMNS WITH IMAGE) =============== */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

                    {/* Kiri: Teks & Tombol (w-1/2) */}
                    <div className="w-full lg:w-1/2 text-left z-10">
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">
                                <Globe className="w-7 h-7 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Layanan Unggulan</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            Pembuatan Web &<br />
                            <span className="text-slate-400">Aplikasi Full-Stack</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                            className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed">
                            Butuh website company profile, e-commerce, dashboard admin, atau aplikasi berbasis API untuk tugas akhir?
                            Tim developer kami siap membangun dari nol sampai jadi lengkap dengan source code dan dokumentasi.
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

                        {/* Wrapper gambar dengan max-width agar proporsional */}
                        <div className="relative w-full max-w-[400px] sm:max-w-[450px] lg:max-w-[500px]">

                            {/* Efek Ambient Glow warna biru */}
                            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-[80px] transform scale-110 -z-10" />

                            <motion.div
                                variants={fadeUp} initial="hidden" animate="visible" custom={4}
                                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-100 group"
                            >
                                <motion.img
                                    variants={floatAnim}
                                    animate="animate"
                                    src="/images/website.webp" // Pastikan gambar ada di path ini
                                    alt="Pembuatan Web & Aplikasi"
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                            </motion.div>
                        </div>
                    </div>

                </div>
            </section>

            {/* =============== KENAPA BUTUH SECTION =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="min-w-0 w-full">
                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                                    Kenapa Mahasiswa Butuh Ini?
                                </div>
                                <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-6">
                                    Deadline mepet, tapi project belum jalan?
                                </h2>
                                <p className="text-slate-500 leading-relaxed mb-8">
                                    Bikin web app dari nol itu butuh waktu berminggu-minggu mulai dari setup environment, desain database, coding backend-frontend, sampai debugging.
                                    Kalau deadline tinggal hitungan hari, serahkan ke kami. Tim kami sudah berpengalaman handle ratusan project mahasiswa.
                                </p>
                            </motion.div>

                            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
                                className="space-y-4">
                                {keunggulan.map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 shadow-sm">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                            <Check className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="font-medium text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-sm text-slate-500">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* Code Editor Mockup */}
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2}
                            className="bg-slate-50 rounded-3xl p-5 sm:p-8 border border-slate-100 shadow-sm min-w-0 w-full">
                            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 font-mono text-xs sm:text-sm shadow-xl shadow-slate-900/10 min-w-0 overflow-hidden w-full">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                    <span className="text-slate-500 text-xs ml-2 border-l border-slate-700 pl-2">App.jsx</span>
                                </div>
                                <pre className="text-green-400 overflow-x-auto pb-2"><code>{`import express from 'express';
const app = express();

app.get('/api/tasks', async (req, res) => {
  const tasks = await db.query(
    'SELECT * FROM tasks WHERE status = $1',
    ['completed']
  );
  res.json({ data: tasks.rows });
});

app.listen(3000, () => {
  console.log('🚀 Server running');
});`}</code></pre>
                            </div>
                            <p className="text-center text-sm text-slate-400 mt-4">Contoh kode backend yang kami buat</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* =============== TECH STACK =============== */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Tech Stack
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Teknologi yang kami kuasai</h2>
                        <p className="text-slate-500 max-w-xl mx-auto">Framework dan bahasa terkini yang dipakai di industri bukan teknologi usang.</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {techStack.map((tech, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100">
                                    <Code className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="font-medium text-slate-900 mb-1">{tech.name}</h3>
                                <p className="text-sm text-slate-500">{tech.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== CTA =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">
                            Siap bikin web app impian?
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
                            Konsultasikan requirement project Anda gratis. Kami akan kasih estimasi waktu, harga, dan scope pengerjaan.
                        </p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                            Konsultasi Gratis Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}