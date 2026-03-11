import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
    }),
};

export default function Order() {
    return (
        <div className="min-h-screen bg-white pt-24">
            <section className="py-20 px-6 lg:px-12 flex flex-col items-center justify-center min-h-[70vh]">
                <div className="max-w-2xl mx-auto text-center">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}
                        className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-100">
                        <MessageCircle className="w-10 h-10 text-blue-600" />
                    </motion.div>

                    <motion.h1 variants={fadeUp} initial="hidden" animate="visible" custom={1}
                        className="text-4xl sm:text-5xl font-medium tracking-tight text-slate-900 mb-6">
                        Konsultasi & Order
                    </motion.h1>

                    <motion.p variants={fadeUp} initial="hidden" animate="visible" custom={2}
                        className="text-lg text-slate-500 mb-10 leading-relaxed">
                        Untuk konsultasi tugas atau melakukan pemesanan, hubungi admin kami melalui WhatsApp.
                        Respons cepat, konsultasi gratis, dan tanpa komitmen.
                    </motion.p>

                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="https://wa.me/6282316877935" target="_blank" rel="noopener noreferrer"
                            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/20 transition-all duration-300 flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" /> Chat via WhatsApp
                        </a>
                        <Link to="/" className="px-8 py-4 border-2 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 font-medium rounded-xl transition-all duration-300">
                            Kembali ke Beranda
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
