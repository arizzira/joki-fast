import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, RefreshCw, Code, Eye, Users, Zap, Heart, Target } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const coreValues = [
    {
        icon: Shield,
        title: 'Kerahasiaan 100%',
        desc: 'Privasi dan source code tugas Anda dijamin keamanannya. Tidak ada kebocoran ke pihak ketiga, dijamin dengan NDA internal.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200'
    },
    {
        icon: RefreshCw,
        title: 'Garansi Revisi',
        desc: 'Pengerjaan dilanjutkan hingga sesuai requirement awal tugas. Revisi gratis selama masih dalam scope brief yang disepakati.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200'
    },
    {
        icon: Code,
        title: 'Clean Code & Bebas Plagiasi',
        desc: 'Setiap baris kode ditulis secara eksklusif dan unik. Dokumen melewati pengecekan anti-plagiasi untuk standar akademis.',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200'
    },
    {
        icon: Eye,
        title: 'Transparan & Trackable',
        desc: 'Anda bisa memantau progress pengerjaan dan berkomunikasi langsung dengan tim. Tidak ada ghosting, tidak ada drama.',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200'
    }
];

const teamStats = [
    { value: '50+', label: 'Worker Aktif' },
    { value: '2.400+', label: 'Tugas Selesai' },
    { value: '98%', label: 'Tingkat Kepuasan' },
    { value: '24/7', label: 'Standby Admin' }
];

export default function TentangKami() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white pt-24 font-sans">

            {/* Hero Section */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-5xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-6">
                            Tentang Kami
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">
                            Lebih dari sekadar joki. <br />
                            <span className="text-slate-400">Kami adalah support system akademis Anda.</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Dibangun oleh mahasiswa, untuk mahasiswa. Kami tahu persis rasanya burnout, dan kami hadir untuk membantu.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Visi & Misi — The Problem & Solution */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-xs font-semibold text-red-600 uppercase tracking-wider mb-6">
                            <Target className="w-3.5 h-3.5" /> Masalahnya
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">
                            Tumpukan tugas, deadline mepet, burnout melanda.
                        </h2>
                        <p className="text-slate-500 text-base leading-relaxed mb-6">
                            Kami paham rasanya burnout karena tumpukan tugas, laporan praktikum, hingga error kodingan menjelang deadline. Waktu tidur hilang, kewarasan terganggu, dan IPK jadi taruhannya.
                        </p>
                        <p className="text-slate-500 text-base leading-relaxed">
                            Banyak mahasiswa yang akhirnya asal-asalan, copy-paste, atau malah telat kumpul. Padahal bukan karena mereka bodoh mereka cuma kehabisan waktu dan energi.
                        </p>
                    </motion.div>

                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-6">
                            <Zap className="w-3.5 h-3.5" /> Solusi Kami
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">
                            JokiFast mengembalikan waktu tidur dan kewarasan Anda.
                        </h2>
                        <p className="text-slate-500 text-base leading-relaxed mb-6">
                            JokiFast hadir untuk memberikan solusi pengerjaan tugas yang <strong className="text-slate-700">cepat, rapi, dan 100% running</strong>. Dari tugas harian hingga project akhir semester, kami kerjakan dengan standar profesional.
                        </p>
                        <p className="text-slate-500 text-base leading-relaxed">
                            Anda fokus pada hal yang benar-benar penting belajar, magang, organisasi, atau istirahat biar kami yang urus sisanya.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Tim Kami — The Elite Workers */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-y border-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-600 uppercase tracking-wider mb-6">
                                <Users className="w-3.5 h-3.5" /> Tim Elite
                            </div>
                            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">
                                Dikerjakan oleh yang sudah teruji.
                            </h2>
                            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                                Tugas Anda tidak dikerjakan oleh sembarang orang. Tim kami terdiri dari developer, desainer, dan akademisi berpengalaman yang sudah terbiasa menangani project rumit dengan standar tinggi.
                            </p>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {teamStats.map((stat, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm"
                            >
                                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.value}</div>
                                <div className="text-sm font-medium text-slate-500">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Roles */}
                    <motion.div
                        variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="mt-12 bg-white rounded-3xl border border-slate-200 p-10 shadow-sm"
                    >
                        <div className="grid sm:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="w-14 h-14 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">👨‍💻</div>
                                <h4 className="font-semibold text-slate-900 mb-2">Full-Stack Developer</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Menguasai React, Node.js, Python, Java, PHP, dan berbagai framework modern. Setiap baris kode melewati code review internal.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-14 h-14 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">🎨</div>
                                <h4 className="font-semibold text-slate-900 mb-2">UI/UX Designer</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Spesialis Figma dan prototyping interaktif. Desain tugas HCI dan IMK yang tidak sekadar bagus, tapi fungsional dan user-centered.</p>
                            </div>
                            <div className="text-center">
                                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-2xl mx-auto mb-4">📝</div>
                                <h4 className="font-semibold text-slate-900 mb-2">Akademisi & Penulis</h4>
                                <p className="text-sm text-slate-500 leading-relaxed">Tim penulis dengan pemahaman mendalam tentang struktur akademis, format APA/IEEE, dan metodologi penelitian. Anti-plagiasi.</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Nilai Utama (Core Values) */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-6">
                                <Heart className="w-3.5 h-3.5" /> Jaminan Kami
                            </div>
                            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">
                                4 Pilar yang menjadi fondasi layanan kami.
                            </h2>
                        </motion.div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-8">
                        {coreValues.map((value, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 ${value.bg} ${value.border} border rounded-xl flex items-center justify-center mb-5`}>
                                    <value.icon className={`w-6 h-6 ${value.color}`} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-3">{value.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{value.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">
                            Siap mengembalikan waktu tidur Anda?
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                            Bergabung dengan ribuan mahasiswa yang sudah mempercayakan tugas mereka kepada JokiFast.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/order" className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                                Mulai Konsultasi Gratis
                            </Link>
                            <Link to="/cara-order" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all duration-300">
                                Lihat Cara Order →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
