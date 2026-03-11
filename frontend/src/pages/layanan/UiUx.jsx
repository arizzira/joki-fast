import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Palette, Layers } from 'lucide-react';

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
    { title: 'Wireframe to Prototype', desc: 'Dari sketsa kasar sampai interactive prototype yang bisa diklik dan di-presentasikan langsung di depan dosen.' },
    { title: 'Design System Lengkap', desc: 'Komponen UI, color palette, typography, dan spacing semua dibikin dalam design system yang rapi di Figma.' },
    { title: 'Sesuai Standar IMK', desc: 'Desain dibuat berdasarkan prinsip Interaksi Manusia & Komputer: usability, accessibility, dan user-centered design.' },
    { title: 'File Figma Siap Pakai', desc: 'Anda dapatkan file Figma editable, siap dipresentasikan atau dilanjutkan untuk development.' },
];

const deliverables = [
    'User Flow Diagram', 'Wireframe (Lo-fi & Hi-fi)', 'UI Design (Desktop & Mobile)',
    'Interactive Prototype', 'Design System / Style Guide', 'Usability Testing Report'
];

export default function UiUx() {
    return (
        <div className="min-h-screen bg-white pt-24 overflow-x-hidden">

            {/* =============== HERO SECTION (UPGRADED TO 2-COLUMNS WITH IMAGE) =============== */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-12">

                    {/* Kiri: Teks & Tombol (w-1/2) */}
                    <div className="w-full lg:w-1/2 text-left z-10">
                        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="flex items-center gap-3 mb-6">
                            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center border border-pink-100 shadow-sm">
                                <Palette className="w-7 h-7 text-pink-600" />
                            </div>
                            <span className="text-sm font-semibold text-pink-600 uppercase tracking-wider">Desain Kreatif</span>
                        </motion.div>

                        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                            className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                            Desain UI/UX<br /><span className="text-slate-400">di Figma</span>
                        </motion.h1>

                        <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                            className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed">
                            Tugas IMK butuh mockup Figma tapi belum pernah buka Figma seumur hidup? Kami bikin dari wireframe, desain UI responsif, sampai prototype interaktif yang bisa diklik.
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

                    {/* Kanan: Gambar UI/UX (w-1/2) */}
                    <div className="w-full lg:w-1/2 relative mt-12 lg:mt-0 flex justify-center lg:justify-end">

                        {/* Kunci Lebar Max Gambar biar ga kegedean */}
                        <div className="relative w-full max-w-[400px] sm:max-w-[450px] lg:max-w-[500px]">

                            {/* Efek Ambient Glow Pink */}
                            <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-[80px] transform scale-110 -z-10" />

                            <motion.div
                                variants={fadeUp} initial="hidden" animate="visible" custom={4}
                                className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-100 group"
                            >
                                <motion.img
                                    variants={floatAnim}
                                    animate="animate"
                                    src="/images/uiux.webp"
                                    alt="Desain UI/UX Figma"
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
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Desain profesional, nilai maksimal</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        {keunggulan.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 2}
                                className="p-8 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:-translate-y-1 hover:border-slate-200 transition-all duration-300">
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

            {/* =============== DELIVERABLES =============== */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-6 shadow-sm">
                            Deliverables
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-4">Yang Anda terima</h2>
                    </motion.div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {deliverables.map((item, i) => (
                            <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={i % 3}
                                className="px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                                <Layers className="w-5 h-5 text-pink-600" />
                                <span className="font-medium text-slate-900">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* =============== CTA =============== */}
            <section className="py-24 px-6 lg:px-12 bg-white border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">Butuh desain UI/UX keren?</h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">Kirimkan brief tugas Anda. Kami siap bikin desain yang bikin dosen terkesan.</p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                            Konsultasi Gratis Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}