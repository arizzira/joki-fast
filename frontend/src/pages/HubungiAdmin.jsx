import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, Mail, Clock, MapPin, Phone } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    })
};

export default function HubungiAdmin() {
    const [nama, setNama] = useState('');
    const [jurusan, setJurusan] = useState('');
    const [pesan, setPesan] = useState('');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleSubmitForm = (e) => {
        e.preventDefault();
        // Redirect ke WhatsApp dengan pesan terformat
        const waMessage = `Halo Admin JokiFast! 👋%0A%0ANama: ${nama}%0AJurusan/Tugas: ${jurusan}%0A%0A${pesan}`;
        window.open(`https://wa.me/6282316877935?text=${waMessage}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-white pt-24 font-sans">

            {/* Hero */}
            <section className="py-20 px-6 lg:px-12 bg-gradient-to-b from-slate-50 to-white text-center">
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-6">
                            Hubungi Kami
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 mb-6 leading-tight">
                            Ada tugas yang harus kelar <br />
                            <span className="text-slate-400">besok pagi? Mari kita bicarakan.</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Tim admin kami siap membantu 24/7. Konsultasi awal gratis, tanpa komitmen.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Direct Contact Buttons */}
            <section className="py-12 px-6 lg:px-12 bg-white -mt-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <motion.a
                            href="https://wa.me/6282316877935"
                            target="_blank"
                            rel="noopener noreferrer"
                            variants={fadeUp} initial="hidden" animate="visible" custom={1}
                            className="group bg-[#25D366]/5 hover:bg-[#25D366]/10 border-2 border-[#25D366]/20 hover:border-[#25D366]/40 rounded-3xl p-8 transition-all duration-300 flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-[#25D366] rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-[#25D366]/20 group-hover:scale-105 transition-transform">
                                <MessageCircle className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">WhatsApp Admin</h3>
                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                                Fast Response 24/7. Langsung chat admin dan kirimkan detail tugas Anda.
                            </p>
                            <span className="text-sm font-semibold text-[#25D366]">Buka WhatsApp →</span>
                        </motion.a>

                        <motion.a
                            href="mailto:admin@jokifast.com"
                            variants={fadeUp} initial="hidden" animate="visible" custom={2}
                            className="group bg-blue-50/50 hover:bg-blue-50 border-2 border-blue-100 hover:border-blue-200 rounded-3xl p-8 transition-all duration-300 flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                                <Mail className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Email</h3>
                            <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                                Untuk brief yang lebih detail atau lampiran file besar, kirim via email.
                            </p>
                            <span className="text-sm font-semibold text-blue-600">admin@jokifast.com →</span>
                        </motion.a>
                    </div>
                </div>
            </section>

            {/* Jam Operasional + Form */}
            <section className="py-24 px-6 lg:px-12 bg-slate-50 border-y border-slate-100">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">

                    {/* Info Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                            <h2 className="text-3xl font-medium tracking-tight text-slate-900 mb-6">
                                Info Kontak
                            </h2>

                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center shrink-0">
                                        <Clock className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">Jam Operasional Admin</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">
                                            Senin — Minggu: <strong className="text-slate-700">08.00 – 23.00 WIB</strong>
                                        </p>
                                        <p className="text-xs text-slate-400 mt-1">
                                            Tim worker kami bekerja 24 jam untuk deadline darurat (SKS).
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">WhatsApp</h4>
                                        <p className="text-sm text-slate-500">+62 823-1687-7935</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">Email</h4>
                                        <p className="text-sm text-slate-500">admin@jokifast.com</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
                                        <MapPin className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-1">Lokasi</h4>
                                        <p className="text-sm text-slate-500 leading-relaxed">Online-first. Melayani seluruh mahasiswa di Indonesia.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-3">
                        <motion.div
                            variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10"
                        >
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Kirim Pesan Cepat</h3>
                            <p className="text-slate-500 text-sm mb-8">Isi form ini, otomatis terkirim ke WhatsApp admin kami.</p>

                            <form onSubmit={handleSubmitForm} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        value={nama}
                                        onChange={(e) => setNama(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                                        placeholder="Nama Anda"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Jurusan / Jenis Tugas</label>
                                    <input
                                        type="text"
                                        value={jurusan}
                                        onChange={(e) => setJurusan(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200"
                                        placeholder="Contoh: Teknik Informatika / Tugas Web"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Deskripsi Masalah / Tugas</label>
                                    <textarea
                                        value={pesan}
                                        onChange={(e) => setPesan(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all duration-200 resize-none"
                                        placeholder="Ceritakan tugas yang perlu dibantu, deadline-nya kapan, dll..."
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all duration-200 flex items-center justify-center gap-2"
                                >
                                    <Send className="w-5 h-5" />
                                    Kirim via WhatsApp
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

        </div>
    );
}
