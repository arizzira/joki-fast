import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, Database, ShieldCheck, UserCheck, Mail } from 'lucide-react';
import { useEffect } from 'react';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
};

const sections = [
    {
        icon: Database,
        title: '1. Data yang Kami Kumpulkan',
        items: [
            { label: 'Informasi Pribadi', desc: 'Nama lengkap, alamat email, nomor WhatsApp, dan nama institusi pendidikan yang Anda berikan saat melakukan pemesanan.' },
            { label: 'Detail Pesanan', desc: 'Deskripsi tugas, file lampiran, instruksi khusus, dan deadline yang Anda kirimkan untuk keperluan pengerjaan.' },
            { label: 'Data Transaksi', desc: 'Riwayat pembayaran, metode pembayaran, dan bukti transfer yang terkait dengan pesanan Anda.' },
            { label: 'Data Teknis', desc: 'Alamat IP, jenis browser, dan informasi perangkat yang dikumpulkan secara otomatis saat Anda mengakses website kami.' },
        ],
    },
    {
        icon: Eye,
        title: '2. Penggunaan Data',
        items: [
            { label: 'Pemrosesan Pesanan', desc: 'Kami menggunakan data Anda untuk memproses, mengerjakan, dan mengirimkan hasil pesanan sesuai dengan permintaan Anda.' },
            { label: 'Komunikasi', desc: 'Menghubungi Anda terkait status pesanan, klarifikasi tugas, dan pemberitahuan penting lainnya melalui WhatsApp atau email.' },
            { label: 'Peningkatan Layanan', desc: 'Menganalisis pola penggunaan untuk meningkatkan kualitas layanan, website, dan pengalaman pengguna secara keseluruhan.' },
            { label: 'Keamanan', desc: 'Mendeteksi, mencegah, dan mengatasi potensi penipuan, penyalahgunaan, atau aktivitas tidak sah lainnya.' },
        ],
    },
    {
        icon: ShieldCheck,
        title: '3. Keamanan Data',
        items: [
            { label: 'Enkripsi', desc: 'Semua data sensitif dienkripsi saat transmisi menggunakan protokol SSL/TLS untuk mencegah intersepsi oleh pihak ketiga.' },
            { label: 'Akses Terbatas', desc: 'Hanya tim JokiFast yang berwenang yang memiliki akses ke data pribadi Anda, dan mereka terikat oleh perjanjian kerahasiaan.' },
            { label: 'Tidak Dijual', desc: 'Kami TIDAK pernah menjual, menyewakan, atau mendistribusikan data pribadi Anda kepada pihak ketiga untuk tujuan komersial apapun.' },
            { label: 'Penghapusan Berkala', desc: 'Data pesanan yang sudah selesai akan dihapus dari sistem kami dalam waktu 90 hari setelah penyelesaian, kecuali diminta lain oleh pengguna.' },
        ],
    },
    {
        icon: UserCheck,
        title: '4. Hak Pengguna',
        items: [
            { label: 'Hak Akses', desc: 'Anda berhak meminta salinan data pribadi yang kami simpan tentang Anda kapan saja.' },
            { label: 'Hak Koreksi', desc: 'Anda berhak meminta perbaikan atas data pribadi yang tidak akurat atau tidak lengkap.' },
            { label: 'Hak Penghapusan', desc: 'Anda berhak meminta penghapusan data pribadi Anda dari sistem kami, dengan pengecualian data yang diperlukan untuk kewajiban hukum.' },
            { label: 'Hak Penarikan Persetujuan', desc: 'Anda dapat menarik persetujuan penggunaan data kapan saja dengan menghubungi kami, tanpa mempengaruhi legalitas pengolahan yang dilakukan sebelumnya.' },
        ],
    },
    {
        icon: Mail,
        title: '5. Kontak & Pertanyaan',
        items: [
            { label: 'Email', desc: 'Untuk pertanyaan terkait privasi data, Anda dapat menghubungi kami melalui email di privacy@jokifast.com.' },
            { label: 'WhatsApp', desc: 'Hubungi admin kami melalui halaman "Hubungi Admin" di website untuk respons yang lebih cepat.' },
            { label: 'Waktu Respons', desc: 'Kami berkomitmen untuk merespons setiap permintaan terkait data pribadi dalam waktu maksimal 3 hari kerja.' },
        ],
    },
];

export default function KebijakanPrivasi() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-white pt-24">
            {/* Hero */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors mb-8">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                        </Link>
                    </motion.div>

                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                            <Lock className="w-7 h-7 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Legalitas</span>
                    </motion.div>

                    <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                        Kebijakan<br />
                        <span className="text-slate-400">Privasi</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={3}
                        className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                        JokiFast berkomitmen untuk melindungi privasi dan keamanan data pribadi Anda. Kebijakan ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda.
                    </motion.p>

                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                        className="mt-6 inline-block px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-400">
                        Terakhir diperbarui: 1 Maret 2026
                    </motion.div>
                </div>
            </section>

            {/* Highlight */}
            <section className="py-12 px-6 lg:px-12 bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium text-slate-900 mb-1">Privasi Anda adalah Prioritas Kami</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Kami tidak pernah menjual data Anda. Semua informasi dienkripsi dan hanya digunakan untuk memproses pesanan Anda. Data dihapus otomatis 90 hari setelah pesanan selesai.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Konten */}
            <section className="py-20 px-6 lg:px-12 bg-white">
                <div className="max-w-4xl mx-auto space-y-8">
                    {sections.map((section, i) => {
                        const Icon = section.icon;
                        return (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i % 3}
                                className="bg-white rounded-2xl border border-slate-100 p-8 hover:border-slate-200 hover:shadow-sm transition-all duration-300"
                            >
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                                        <Icon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-medium text-slate-900 pt-1.5">{section.title}</h2>
                                </div>
                                <div className="space-y-5 pl-14">
                                    {section.items.map((item, j) => (
                                        <div key={j} className="flex gap-3">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2.5 shrink-0"></span>
                                            <div>
                                                <span className="font-medium text-slate-900">{item.label}</span>
                                                <span className="text-slate-400 mx-1.5">—</span>
                                                <span className="text-slate-500 leading-relaxed">{item.desc}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <p className="text-slate-500 text-lg mb-8">
                            Punya pertanyaan terkait kebijakan privasi kami?
                        </p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                            Hubungi Admin
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
