import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle, Shield, Clock, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const faqData = [
    {
        category: 'Memulai',
        icon: CheckCircle2,
        items: [
            {
                q: 'Bagaimana cara mulai mengambil tugas?',
                a: 'Buka halaman "Bursa Tugas" di dashboard worker Anda. Di sana Anda akan melihat daftar tugas yang tersedia. Klik "Ambil Tugas" pada tugas yang sesuai dengan keahlian Anda, lalu konfirmasi untuk mengunci tugas tersebut.'
            },
            {
                q: 'Apa saja syarat untuk menjadi Worker JokiFast PRO?',
                a: 'Anda harus memiliki akun dengan role WORKER, mengisi profil lengkap termasuk keahlian dan informasi rekening bank untuk penarikan dana. Pastikan juga Anda memiliki keahlian di bidang yang relevan.'
            },
            {
                q: 'Bisakah saya mengambil lebih dari satu tugas sekaligus?',
                a: 'Ya, Anda bisa mengambil beberapa tugas sekaligus. Namun pastikan Anda mampu menyelesaikan semuanya tepat waktu. Keterlambatan berulang dapat mempengaruhi reputasi akun Anda.'
            },
        ]
    },
    {
        category: 'Pengerjaan Tugas',
        icon: Clock,
        items: [
            {
                q: 'Berapa lama waktu yang diberikan untuk mengerjakan tugas?',
                a: 'Setiap tugas memiliki deadline yang berbeda-beda, ditentukan oleh klien saat membuat pesanan. Anda bisa melihat deadline di detail tugas sebelum mengambilnya. Pastikan Anda hanya mengambil tugas yang deadlinenya bisa Anda penuhi.'
            },
            {
                q: 'Bagaimana jika saya tidak sanggup menyelesaikan tugas yang sudah diambil?',
                a: 'Hubungi admin segera melalui fitur chat atau kontak support. Admin akan membantu mengembalikan tugas ke Bursa agar worker lain bisa mengambilnya. Namun, pembatalan berulang akan berdampak pada akun Anda.'
            },
            {
                q: 'Bagaimana cara berkomunikasi dengan klien?',
                a: 'Setelah mengunci tugas, Anda akan diarahkan ke Ruang Negosiasi (chat room) di mana Anda bisa berkomunikasi langsung dengan klien untuk mendiskusikan detail tugas, klarifikasi, dan revisi.'
            },
        ]
    },
    {
        category: 'Pembayaran & Pendapatan',
        icon: CreditCard,
        items: [
            {
                q: 'Berapa persentase upah yang saya terima?',
                a: 'Worker menerima 80% dari harga total tugas. Sisanya 20% merupakan fee platform JokiFast untuk operasional dan pengembangan layanan.'
            },
            {
                q: 'Kapan saya bisa menarik saldo?',
                a: 'Saldo bisa ditarik setelah tugas berstatus "DONE" (selesai dan diterima klien). Proses penarikan ke rekening bank membutuhkan waktu 1-3 hari kerja.'
            },
            {
                q: 'Metode pembayaran apa saja yang tersedia untuk penarikan?',
                a: 'Saat ini kami mendukung transfer ke rekening bank (BCA, Mandiri, BNI, BRI) dan e-wallet (GoPay, OVO, Dana). Silakan update informasi rekening Anda di halaman Profil.'
            },
        ]
    },
    {
        category: 'Keamanan & Aturan',
        icon: Shield,
        items: [
            {
                q: 'Apakah data saya aman?',
                a: 'Ya, kami menggunakan enkripsi dan sistem otentikasi JWT untuk melindungi data Anda. Password disimpan dalam bentuk hash dan tidak pernah disimpan dalam teks biasa.'
            },
            {
                q: 'Apa yang terjadi jika ada sengketa dengan klien?',
                a: 'Anda bisa melaporkan masalah melalui fitur support. Tim admin kami akan meninjau bukti chat dan file yang dipertukarkan untuk menyelesaikan sengketa secara adil.'
            },
            {
                q: 'Apakah ada sistem rating untuk worker?',
                a: 'Saat ini kami sedang mengembangkan sistem rating dan review. Nantinya, klien bisa memberikan rating setelah tugas selesai, dan worker dengan rating tinggi akan mendapat prioritas di Bursa Tugas.'
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
                    <ChevronDown className={`w-5 h-5 ${isOpen ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
                        <div className={`px-6 pb-5 text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {item.a}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FAQ() {
    const { isDark } = useTheme();

    const cardBg = isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200';

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
                    <HelpCircle className="w-8 h-8 text-emerald-500" /> Frequently Asked Questions
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Temukan jawaban untuk pertanyaan umum seputar Worker JokiFast PRO.
                </p>
            </motion.div>

            {faqData.map((section, idx) => (
                <motion.div key={section.category} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: idx * 0.1 }}
                    className={`rounded-2xl border overflow-hidden shadow-xl ${cardBg}`}
                >
                    <div className={`px-6 py-4 border-b ${isDark ? 'border-slate-800/60 bg-slate-900/40' : 'border-gray-100 bg-gray-50'} flex items-center gap-3`}>
                        <section.icon className="w-5 h-5 text-emerald-500" />
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
                <MessageCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Masih Ada Pertanyaan?</h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Hubungi tim support kami melalui WhatsApp untuk bantuan lebih lanjut.
                </p>
                <a href="https://wa.me/6282316877935" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                    <MessageCircle className="w-5 h-5" /> Hubungi Support
                </a>
            </motion.div>
        </div>
    );
}
