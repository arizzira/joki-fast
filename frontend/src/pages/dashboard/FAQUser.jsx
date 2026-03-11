import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, Shield, Clock, CreditCard, CheckCircle2, FileText, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const faqData = [
    {
        category: 'Memulai & Cara Order',
        icon: CheckCircle2,
        items: [
            {
                q: 'Bagaimana cara memesan tugas di JokiFast?',
                a: 'Klik menu "Buat Pesanan" di sidebar. Isi detail tugas seperti judul, tipe layanan, deadline, dan deskripsi. Sistem AI kami akan memberikan estimasi harga otomatis. Setelah selesai, klik "Kirim Permintaan Order" dan pesanan Anda akan masuk ke sistem.'
            },
            {
                q: 'Apakah saya bisa mengupload file referensi saat membuat pesanan?',
                a: 'Ya! Saat membuat pesanan, terdapat area upload file referensi (opsional). Anda bisa upload file berformat PDF, DOCX, ZIP, atau gambar (JPG/PNG) dengan ukuran maksimal 10MB. File ini akan membantu worker memahami tugas Anda lebih baik.'
            },
            {
                q: 'Berapa lama pesanan saya diproses?',
                a: 'Setelah pesanan dibuat, tugas akan masuk ke Bursa Tugas untuk diambil oleh worker yang sesuai. Biasanya tugas sudah diambil dalam waktu 1-6 jam tergantung jenis dan kompleksitas tugas. Anda bisa memantau status di menu "Pesanan Saya".'
            },
        ]
    },
    {
        category: 'Status & Pengerjaan',
        icon: Clock,
        items: [
            {
                q: 'Apa arti setiap status pengerjaan?',
                a: '• Menunggu Worker — Tugas sedang menunggu worker yang cocok untuk mengambilnya.\n• Dikerjakan — Worker sudah mengambil tugas dan sedang mengerjakan.\n• Direview — Hasil tugas sedang dalam tahap pengecekan kualitas.\n• Selesai — Tugas sudah selesai dan file hasil siap diunduh.'
            },
            {
                q: 'Bagaimana cara berkomunikasi dengan worker yang mengerjakan tugas saya?',
                a: 'Buka detail pesanan di menu "Pesanan Saya", lalu klik tombol "Masuk Ruang Negosiasi". Di sana Anda bisa chat langsung dengan worker untuk mendiskusikan detail, memberikan klarifikasi, atau meminta revisi.'
            },
            {
                q: 'Apakah saya bisa meminta revisi?',
                a: 'Ya, Anda bisa meminta revisi melalui Ruang Negosiasi. Diskusikan langsung dengan worker mengenai perubahan yang diinginkan. Revisi minor biasanya termasuk dalam paket harga. Untuk revisi major yang mengubah scope tugas, mungkin ada biaya tambahan.'
            },
        ]
    },
    {
        category: 'Pembayaran & Harga',
        icon: CreditCard,
        items: [
            {
                q: 'Bagaimana sistem pembayaran di JokiFast?',
                a: 'JokiFast menggunakan sistem escrow (penahanan dana). Anda membayar DP 50% di awal saat pesanan dibuat, dan pelunasan 50% sisanya setelah tugas selesai dan Anda puas dengan hasilnya. Pembayaran dilakukan melalui QRIS yang tersedia di halaman detail pesanan.'
            },
            {
                q: 'Apakah estimasi harga AI akurat?',
                a: 'Estimasi harga AI memberikan kisaran harga awal berdasarkan tipe layanan dan deskripsi tugas Anda. Harga final bisa dinegosiasikan dengan worker melalui Ruang Negosiasi. Estimasi berfungsi sebagai referensi awal agar Anda memiliki gambaran biaya.'
            },
            {
                q: 'Bagaimana jika saya tidak puas dengan hasil tugas?',
                a: 'Anda bisa meminta revisi melalui Ruang Negosiasi. Jika setelah revisi Anda masih tidak puas, hubungi tim support kami. Tim admin akan meninjau kasus dan memberikan solusi yang adil, termasuk kemungkinan refund sesuai kebijakan platform.'
            },
        ]
    },
    {
        category: 'Layanan & Tipe Tugas',
        icon: FileText,
        items: [
            {
                q: 'Tipe tugas apa saja yang bisa dikerjakan?',
                a: '• Tugas Koding — Website, aplikasi, debugging, instalasi server\n• Makalah & Laporan — Esai, resume jurnal, laporan penelitian\n• Presentasi PPT — Desain slide estetik dengan materi lengkap\n• Skripsi & Tugas Akhir — Bab per bab atau keseluruhan\n• Desain UI/UX — Mockup, wireframe, prototype\n• Dan layanan lainnya sesuai kebutuhan Anda'
            },
            {
                q: 'Apakah ada jaminan kualitas?',
                a: 'Ya! Setiap worker JokiFast telah melalui proses seleksi. Selain itu, setiap tugas melewati tahap Review sebelum dikirimkan ke Anda. Kami juga menyediakan garansi revisi untuk memastikan hasil sesuai ekspektasi.'
            },
        ]
    },
    {
        category: 'Keamanan & Privasi',
        icon: Shield,
        items: [
            {
                q: 'Apakah data dan tugas saya aman?',
                a: 'Sangat aman. Kami menggunakan enkripsi end-to-end untuk semua komunikasi, otentikasi JWT untuk akses akun, dan password disimpan dalam bentuk hash. File tugas Anda disimpan di cloud yang terenkripsi dan hanya bisa diakses oleh Anda dan worker yang ditugaskan.'
            },
            {
                q: 'Apakah tugas saya bisa dilihat orang lain?',
                a: 'Tidak. Detail tugas Anda hanya bisa dilihat oleh Anda dan worker yang mengambil tugas tersebut. Worker lain hanya bisa melihat informasi umum (judul dan tipe) di Bursa Tugas, tanpa akses ke deskripsi lengkap atau file referensi.'
            },
            {
                q: 'Bagaimana cara menghubungi support jika ada masalah?',
                a: 'Anda bisa menghubungi tim support kami melalui WhatsApp di tombol "Hubungi Support" di bawah halaman ini, atau melalui menu "Hubungi Admin" di website utama. Tim kami siap membantu 24/7.'
            },
        ]
    },
];

function FAQItem({ item, isDark }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`border-b ${isDark ? 'border-slate-800/60' : 'border-gray-200'} last:border-b-0`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-gray-50'}`}
            >
                <span className={`text-sm font-semibold pr-4 ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>{item.q}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                    <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-blue-500' : isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className={`px-6 pb-5 text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {item.a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQUser() {
    const { isDark } = useTheme();

    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200';

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                    <HelpCircle className="w-8 h-8 text-blue-500" /> Pusat Bantuan
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Temukan jawaban untuk pertanyaan umum seputar layanan JokiFast.
                </p>
            </motion.div>

            {/* Quick Info Banner */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}
                className={`rounded-2xl border p-5 flex items-start gap-4 ${isDark ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-50 border-blue-200'}`}
            >
                <Zap className="w-6 h-6 text-blue-500 shrink-0 mt-0.5" />
                <div>
                    <h3 className={`text-sm font-bold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Tips Cepat</h3>
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        Semakin detail deskripsi tugas yang Anda berikan, semakin cepat worker mengambil dan semakin akurat hasilnya. Jangan lupa sertakan file referensi jika ada!
                    </p>
                </div>
            </motion.div>

            {faqData.map((section, idx) => (
                <motion.div key={section.category} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: idx * 0.08 }}
                    className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}
                >
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-gray-100 bg-gray-50'} flex items-center gap-3`}>
                        <section.icon className="w-5 h-5 text-blue-500" />
                        <h2 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{section.category}</h2>
                    </div>
                    {section.items.map((item, i) => (
                        <FAQItem key={i} item={item} isDark={isDark} />
                    ))}
                </motion.div>
            ))}

            {/* Contact Support */}
            <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}
                className={`rounded-2xl border p-6 sm:p-8 text-center ${cardBg}`}
            >
                <MessageCircle className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Masih Ada Pertanyaan?</h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Hubungi tim support kami melalui WhatsApp untuk bantuan lebih lanjut.
                </p>
                <a href="https://wa.me/6282316877935" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
                >
                    <MessageCircle className="w-5 h-5" /> Hubungi Support
                </a>
            </motion.div>
        </div>
    );
}
