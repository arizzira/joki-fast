import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Send, CreditCard, Rocket, FileCheck, MessageCircle, ChevronDown, HelpCircle } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

const steps = [
    {
        number: '01',
        icon: UserPlus,
        title: 'Daftar Akun & Login',
        desc: 'Buat akun gratis di JokiFast dalam hitungan detik. Setelah terdaftar, login untuk mengakses seluruh layanan dan memantau pesanan Anda.',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        accent: 'bg-blue-600'
    },
    {
        number: '02',
        icon: Send,
        title: 'Konsultasi & Kirim Brief',
        desc: 'Kirimkan file soal, modul panduan, atau deskripsi project Anda ke Admin via WhatsApp. Jelaskan deadline dan format output yang diinginkan.',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        accent: 'bg-emerald-600'
    },
    {
        number: '03',
        icon: CreditCard,
        title: 'Penawaran & Pembayaran DP',
        desc: 'Tim kami akan menganalisis tingkat kesulitan dan memberikan estimasi harga terbaik. Pembayaran DP (Down Payment) dilakukan sebagai tanda jadi.',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        accent: 'bg-purple-600'
    },
    {
        number: '04',
        icon: Rocket,
        title: 'Proses Eksekusi & Tracking',
        desc: 'Worker kami langsung mengeksekusi tugas Anda. Anda bisa memantau progress dan berdiskusi secara berkala melalui platform kami.',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        accent: 'bg-amber-600'
    },
    {
        number: '05',
        icon: FileCheck,
        title: 'Pelunasan & Penyerahan File',
        desc: 'Setelah tugas selesai 100% dan Anda puas dengan demonya, lakukan pelunasan. File final source code atau dokumen akan langsung dikirimkan beserta garansi revisi.',
        color: 'text-rose-600',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        accent: 'bg-rose-600'
    }
];

const faqs = [
    {
        q: 'Gimana kalau dosen minta revisi setelah dikumpulin?',
        a: 'Tenang, kami kasih garansi revisi selama masih dalam scope brief awal yang disepakati. Tinggal kirim feedback dosen, kami kerjakan ulang tanpa biaya tambahan.'
    },
    {
        q: 'Gimana kalau programnya error di laptop saya?',
        a: 'Kami menjamin setiap kode sudah running dan ditest sebelum dikirim. Jika ada masalah setup di perangkat Anda, tim kami akan membantu via remote session sampai berjalan sempurna.'
    },
    {
        q: 'Apakah tugas saya bisa terdeteksi plagiasi?',
        a: 'Setiap tugas ditulis secara eksklusif dari nol. Untuk dokumen, kami cek melalui tool anti-plagiasi. Untuk kode, kami pastikan original, bukan copy-paste dari repository publik manapun.'
    },
    {
        q: 'Berapa lama waktu pengerjaan?',
        a: 'Tergantung tingkat kesulitan. Tugas harian bisa selesai dalam 1-3 jam. Tugas besar atau web fullstack biasanya 3-7 hari kerja. Deadline darurat? Chat admin, kami usahakan selesai.'
    },
    {
        q: 'Bagaimana kalau saya belum punya brief yang jelas?',
        a: 'Tidak masalah! Konsultasi awal bersama admin kami gratis. Kami akan membantu Anda merumuskan requirement dari soal atau modul yang Anda punya.'
    },
    {
        q: 'Pembayarannya lewat apa?',
        a: 'Kami menerima transfer Bank (BCA, BNI, Mandiri, dll), E-Wallet (GoPay, OVO, DANA, ShopeePay), dan QRIS. Fleksibel sesuai kenyamanan Anda.'
    }
];

export default function CaraOrder() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white pt-24 font-sans">

            {/* Hero */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-6">
                            Cara Order
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">
                            Mulai kebebasan Anda <br />
                            <span className="text-slate-400">dalam 5 langkah mudah.</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Alur transaksi kami dibuat transparan, gampang, dan aman. Tidak ada langkah yang membingungkan.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Timeline / Stepper */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-6 lg:left-8 top-0 bottom-0 w-px bg-slate-200 hidden sm:block" />

                        <div className="space-y-12">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    custom={i}
                                    className="relative flex gap-6 sm:gap-8"
                                >
                                    {/* Step Number Badge */}
                                    <div className="relative z-10 shrink-0">
                                        <div className={`w-12 h-12 lg:w-16 lg:h-16 ${step.accent} rounded-2xl flex items-center justify-center shadow-lg`}>
                                            <step.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                                        </div>
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`text-xs font-bold ${step.color} ${step.bg} ${step.border} border px-3 py-1 rounded-full uppercase tracking-wider`}>
                                                Langkah {step.number}
                                            </span>
                                        </div>
                                        <h3 className="text-xl lg:text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                        <p className="text-slate-500 text-base leading-relaxed max-w-xl">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-y border-slate-100">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-600 uppercase tracking-wider mb-6">
                                <HelpCircle className="w-3.5 h-3.5" /> FAQ
                            </div>
                            <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">
                                Pertanyaan yang sering muncul.
                            </h2>
                            <p className="text-slate-500 text-lg max-w-xl mx-auto">
                                Jawaban untuk keraguan yang biasa ada di kepala klien baru.
                            </p>
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <motion.details
                                key={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i}
                                className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                            >
                                <summary className="flex items-center justify-between cursor-pointer px-8 py-6 text-base font-semibold text-slate-900 hover:text-blue-600 transition-colors select-none list-none">
                                    {faq.q}
                                    <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-4" />
                                </summary>
                                <div className="px-8 pb-6 text-slate-500 text-sm leading-relaxed -mt-2">
                                    {faq.a}
                                </div>
                            </motion.details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Bottom */}
            <section className="py-24 px-6 lg:px-12 bg-white">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <h2 className="text-3xl md:text-4xl font-medium tracking-tight text-slate-900 mb-5">
                            Masih ragu? Konsultasi dulu, gratis!
                        </h2>
                        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                            Kirimkan detail tugas Anda ke admin kami. Kami analisis gratis dan berikan estimasi harga serta timeline pengerjaan yang transparan.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://wa.me/6282316877935"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white font-medium rounded-xl shadow-lg shadow-[#25D366]/20 transition-all duration-300"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Chat Admin Sekarang
                            </a>
                            <Link to="/harga" className="px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-all duration-300">
                                Lihat Estimasi Harga →
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
