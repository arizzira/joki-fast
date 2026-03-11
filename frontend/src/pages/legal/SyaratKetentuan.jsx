import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertCircle, CreditCard, Shield, Scale, Users } from 'lucide-react';
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
        icon: FileText,
        title: '1. Ruang Lingkup Layanan',
        items: [
            'JokiFast menyediakan jasa pengerjaan tugas akademik, project IT, pembuatan website & aplikasi, desain UI/UX, penulisan makalah, skripsi, dan layanan terkait lainnya.',
            'Setiap layanan yang dipesan tunduk pada deskripsi, spesifikasi, dan batasan yang telah disepakati pada saat pemesanan.',
            'JokiFast berhak menolak pesanan yang dinilai melanggar hukum, etika akademik institusi tertentu, atau yang berada di luar kapabilitas tim kami.',
        ],
    },
    {
        icon: Users,
        title: '2. Kewajiban Pengguna',
        items: [
            'Pengguna wajib memberikan informasi yang lengkap, akurat, dan jelas terkait tugas yang dipesan termasuk deadline, format, referensi, dan ketentuan khusus dari dosen/kampus.',
            'Pengguna bertanggung jawab penuh atas penggunaan hasil kerja yang diterima dari JokiFast. Kami tidak bertanggung jawab atas konsekuensi akademik yang mungkin timbul.',
            'Pengguna dilarang menyebarluaskan, menjual kembali, atau mengklaim hasil kerja sebagai karya pihak lain selain untuk keperluan pribadinya.',
        ],
    },
    {
        icon: CreditCard,
        title: '3. Pembayaran & Pembatalan',
        items: [
            'Pembayaran dilakukan di muka (full payment) atau dengan skema DP sesuai kesepakatan. Pengerjaan dimulai setelah pembayaran diterima.',
            'Pembatalan setelah pengerjaan dimulai tidak dapat di-refund. Jika pembatalan dilakukan sebelum pengerjaan dimulai, refund diberikan sebesar 80% dari total pembayaran.',
            'Harga yang tertera bersifat estimasi. Harga final ditentukan setelah konsultasi dan kesepakatan antara pengguna dan admin JokiFast.',
        ],
    },
    {
        icon: Shield,
        title: '4. Hak Kekayaan Intelektual',
        items: [
            'Setelah pembayaran lunas, hak atas hasil kerja berpindah sepenuhnya kepada pengguna.',
            'JokiFast menjamin bahwa setiap hasil kerja dibuat secara original dan bukan hasil plagiasi. Namun, kami tidak bertanggung jawab jika pengguna memodifikasi hasil kerja sehingga menimbulkan masalah plagiasi.',
            'JokiFast berhak menyimpan salinan hasil kerja untuk keperluan internal (quality control) tanpa mempublikasikannya.',
        ],
    },
    {
        icon: AlertCircle,
        title: '5. Batasan Tanggung Jawab',
        items: [
            'JokiFast tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, atau kerusakan yang timbul dari penggunaan layanan kami.',
            'Tanggung jawab maksimal JokiFast terbatas pada jumlah yang telah dibayarkan oleh pengguna untuk pesanan terkait.',
            'JokiFast tidak menjamin hasil atau nilai akademik tertentu. Hasil kerja disediakan sebagai bahan referensi dan bantuan belajar.',
        ],
    },
    {
        icon: Scale,
        title: '6. Penyelesaian Sengketa',
        items: [
            'Segala perselisihan yang timbul akan diselesaikan secara musyawarah untuk mufakat antara pengguna dan JokiFast.',
            'Jika musyawarah tidak mencapai kesepakatan, kedua belah pihak sepakat untuk menyelesaikan sengketa melalui mediasi.',
            'Syarat & Ketentuan ini tunduk pada hukum yang berlaku di Republik Indonesia.',
        ],
    },
];

export default function SyaratKetentuan() {
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
                            <FileText className="w-7 h-7 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Legalitas</span>
                    </motion.div>

                    <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                        Syarat &<br />
                        <span className="text-slate-400">Ketentuan</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={3}
                        className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                        Dengan menggunakan layanan JokiFast, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku di bawah ini.
                    </motion.p>

                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                        className="mt-6 inline-block px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-400">
                        Terakhir diperbarui: 1 Maret 2026
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
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                                        <Icon className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-medium text-slate-900 pt-1.5">{section.title}</h2>
                                </div>
                                <ul className="space-y-4 pl-14">
                                    {section.items.map((item, j) => (
                                        <li key={j} className="flex gap-3">
                                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2.5 shrink-0"></span>
                                            <p className="text-slate-500 leading-relaxed">{item}</p>
                                        </li>
                                    ))}
                                </ul>
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
                            Punya pertanyaan terkait syarat & ketentuan kami?
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
