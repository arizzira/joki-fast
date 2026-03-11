import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, RotateCcw, CheckCircle, Clock, ListChecks, AlertTriangle, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    }),
};

const garansiHighlights = [
    { icon: RotateCcw, value: '3×', label: 'Revisi Gratis', desc: 'Setiap pesanan mendapat 3 kali revisi gratis tanpa biaya tambahan.' },
    { icon: Clock, value: '7 Hari', label: 'Masa Garansi', desc: 'Garansi berlaku 7 hari sejak hasil kerja dikirimkan kepada Anda.' },
    { icon: CheckCircle, value: '100%', label: 'Sesuai Brief', desc: 'Revisi dikerjakan sampai hasilnya sesuai dengan brief awal.' },
];

const prosedurRevisi = [
    { step: '01', title: 'Ajukan Revisi', desc: 'Hubungi admin melalui WhatsApp atau halaman order dan sampaikan detail revisi yang diinginkan beserta referensi file original.' },
    { step: '02', title: 'Review oleh Tim', desc: 'Tim kami akan memeriksa apakah permintaan revisi sesuai dengan cakupan brief awal dan kebijakan garansi yang berlaku.' },
    { step: '03', title: 'Proses Pengerjaan', desc: 'Revisi dikerjakan oleh tim yang sama yang mengerjakan pesanan awal Anda untuk menjaga konsistensi kualitas.' },
    { step: '04', title: 'Kirim Hasil Revisi', desc: 'Hasil revisi dikirimkan melalui channel yang sama. Jika masih ada koreksi, Anda dapat mengajukan revisi ulang selama masih dalam masa garansi.' },
];

const cakupanRevisi = [
    'Perbaikan bug atau error pada kode/aplikasi yang tidak sesuai dengan spesifikasi awal',
    'Koreksi penulisan, format, atau referensi pada dokumen (makalah, skripsi, laporan)',
    'Penyesuaian desain UI/UX sesuai feedback yang masih dalam scope brief awal',
    'Penambahan minor yang sudah disepakati dalam brief tetapi terlewat',
    'Perbaikan struktur, alur logika, atau penjelasan dalam dokumen akademik',
];

const pengecualian = [
    'Perubahan konsep atau scope yang berbeda secara fundamental dari brief awal',
    'Penambahan fitur, halaman, atau komponen baru yang tidak ada dalam kesepakatan awal',
    'Perubahan yang diajukan setelah masa garansi 7 hari berakhir',
    'Kerusakan atau masalah yang terjadi akibat modifikasi oleh pengguna sendiri setelah penyerahan',
    'Permintaan revisi ke-4 dan seterusnya (dikenakan biaya tambahan dengan kesepakatan baru)',
];

export default function GaransiRevisi() {
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
                            <RotateCcw className="w-7 h-7 text-blue-600" />
                        </div>
                        <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Legalitas</span>
                    </motion.div>

                    <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-[1.1]">
                        Garansi<br />
                        <span className="text-slate-400">Revisi</span>
                    </motion.h1>

                    <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={3}
                        className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                        Kepuasan Anda adalah prioritas kami. Setiap pesanan di JokiFast dilindungi oleh garansi revisi untuk memastikan hasil kerja sesuai dengan harapan Anda.
                    </motion.p>

                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
                        className="mt-6 inline-block px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-400">
                        Terakhir diperbarui: 1 Maret 2026
                    </motion.div>
                </div>
            </section>

            {/* Highlight Cards */}
            <section className="py-16 px-6 lg:px-12 bg-white border-b border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <div className="grid sm:grid-cols-3 gap-6">
                        {garansiHighlights.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    custom={i}
                                    className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="text-3xl font-bold text-slate-900 mb-1">{item.value}</div>
                                    <div className="text-sm font-semibold text-blue-600 mb-2">{item.label}</div>
                                    <p className="text-sm text-slate-500">{item.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Prosedur Revisi */}
            <section className="py-20 px-6 lg:px-12 bg-white">
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            Prosedur
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900">
                            Cara mengajukan revisi
                        </h2>
                    </motion.div>

                    <div className="space-y-6">
                        {prosedurRevisi.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i % 3}
                                className="flex gap-6 p-6 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm transition-all duration-300"
                            >
                                <div className="text-3xl font-bold text-blue-100 shrink-0 w-12">{item.step}</div>
                                <div>
                                    <h3 className="font-medium text-slate-900 mb-1.5">{item.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cakupan & Pengecualian */}
            <section className="py-20 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Cakupan */}
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="bg-white rounded-2xl border border-slate-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center border border-green-100">
                                    <ListChecks className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Yang Termasuk Garansi</h3>
                            </div>
                            <ul className="space-y-4">
                                {cakupanRevisi.map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-1 shrink-0" />
                                        <p className="text-sm text-slate-500 leading-relaxed">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Pengecualian */}
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}
                            className="bg-white rounded-2xl border border-slate-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Pengecualian</h3>
                            </div>
                            <ul className="space-y-4">
                                {pengecualian.map((item, i) => (
                                    <li key={i} className="flex gap-3">
                                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-1 shrink-0" />
                                        <p className="text-sm text-slate-500 leading-relaxed">{item}</p>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-20 px-6 lg:px-12 bg-white border-t border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-12">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                            FAQ
                        </div>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900">
                            Pertanyaan umum
                        </h2>
                    </motion.div>

                    <div className="space-y-4">
                        {[
                            { q: 'Apakah revisi benar-benar gratis?', a: 'Ya, 3 kali revisi pertama sepenuhnya gratis selama masih dalam scope brief awal dan masa garansi 7 hari.' },
                            { q: 'Bagaimana jika saya butuh lebih dari 3 revisi?', a: 'Revisi ke-4 dan seterusnya akan dikenakan biaya tambahan yang disepakati bersama. Kami akan memberikan estimasi biaya sebelum melakukan pengerjaan.' },
                            { q: 'Apakah masa garansi bisa diperpanjang?', a: 'Masa garansi standar adalah 7 hari. Untuk project besar, kami menawarkan opsi perpanjangan garansi yang bisa didiskusikan saat pemesanan.' },
                            { q: 'Siapa yang mengerjakan revisi saya?', a: 'Revisi dikerjakan oleh tim yang sama yang mengerjakan pesanan awal Anda, sehingga konsistensi dan kualitas tetap terjaga.' },
                            { q: 'Berapa lama waktu pengerjaan revisi?', a: 'Revisi minor biasanya selesai dalam 1-2 hari kerja. Untuk revisi yang lebih kompleks, waktu pengerjaan akan dikomunikasikan terlebih dahulu.' },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i % 3}
                                className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-slate-200 transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-medium text-slate-900 mb-2">{item.q}</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 lg:px-12 bg-slate-50 border-t border-slate-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">
                            Siap order dengan tenang?
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
                            Setiap pesanan dilindungi garansi revisi. Konsultasikan tugas Anda sekarang.
                        </p>
                        <Link to="/order" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-300">
                            Mulai Order Sekarang <ArrowRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
