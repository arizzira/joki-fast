import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, GraduationCap, Link as LinkIcon, Loader2, CheckCircle, UploadCloud, FileText, Phone } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WorkerOnboarding() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadingText, setUploadingText] = useState('');

    // Form State
    const [statusMhs, setStatusMhs] = useState('mahasiswa');
    const [univ, setUniv] = useState('');
    const [keahlian, setKeahlian] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState(''); // State baru buat WA

    // Portfolio State (Link atau File)
    const [uploadMethod, setUploadMethod] = useState('link'); // 'link' atau 'file'
    const [portfolioLink, setPortfolioLink] = useState('');
    const [file, setFile] = useState(null);

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            const token = localStorage.getItem('jokifast_token');
            const storedUserStr = localStorage.getItem('jokifast_user');

            if (!token || !storedUserStr) return;

            try {
                // Tarik data paling FRESH dari database
                const res = await axios.get(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    const freshUser = res.data.user;
                    setUser(freshUser);

                    // Update localStorage biar sinkron
                    localStorage.setItem('jokifast_user', JSON.stringify(freshUser));

                    // LOGIKA UTAMA: Munculin pop-up HANYA JIKA dia WORKER dan datanya emang belum lengkap
                    if (freshUser.role === 'WORKER') {
                        // Kalau dia belum pernah ngisi form (keahlian/link kosong)
                        const belumIsiForm = !freshUser.keahlian || !freshUser.portfolio_link || !freshUser.whatsappNumber;

                        // Kalau dia udah APPROVED atau REJECTED, jangan pernah tampilin pop-up ini lagi!
                        const udahDireviewAdmin = freshUser.status_worker === 'APPROVED' || freshUser.status_worker === 'REJECTED';

                        if (belumIsiForm && !udahDireviewAdmin) {
                            setIsOpen(true);
                            if (freshUser.whatsappNumber) setWhatsappNumber(freshUser.whatsappNumber);
                        } else {
                            setIsOpen(false);
                        }
                    }
                }
            } catch (error) {
                console.error("Gagal ngecek status user:", error);
            }
        };

        checkOnboardingStatus();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Batasi ukuran maksimal 5MB
            if (selectedFile.size > 5 * 1024 * 1024) {
                alert('Ukuran file maksimal 5MB ya Bro!');
                return;
            }
            setFile(selectedFile);
        }
    };

    // Fungsi tambahan buat ngefilter input nomor WA biar cuma angka
    const handleWaChange = (e) => {
        const val = e.target.value.replace(/\D/g, ''); // Hapus semua karakter non-angka
        setWhatsappNumber(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi basic nomor WA
        if (whatsappNumber.length < 10) {
            alert('Nomor WhatsApp tidak valid. Minimal 10 angka.');
            return;
        }

        setLoading(true);

        try {
            let finalPortfolioLink = portfolioLink;

            // 1. JIKA DIA PILIH UPLOAD FILE, LEMPAR KE CLOUDINARY DULU
            if (uploadMethod === 'file') {
                if (!file) {
                    alert('Harap pilih file CV/Portfolio terlebih dahulu!');
                    setLoading(false);
                    return;
                }

                setUploadingText('Mengupload File ke Cloudinary...');

                const formData = new FormData();
                formData.append('file', file);

                formData.append('upload_preset', 'jokifast_cv');
                const cloudName = 'dncj5irc9';

                // Pake /auto/upload biar bisa nerima PDF, Gambar, dll
                const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, formData);

                // Ambil link hasil uploadnya
                finalPortfolioLink = cloudRes.data.secure_url;
            }

            setUploadingText('Menyimpan Profil...');

            // 2. SIMPAN DATA KE BACKEND JOKIFAST
            const token = localStorage.getItem('jokifast_token');
            const res = await axios.put(`${API_URL}/api/auth/profile`, {
                univ: statusMhs === 'mahasiswa' ? univ : 'Umum / Profesional',
                keahlian: keahlian,
                portfolio_link: finalPortfolioLink,
                whatsappNumber: whatsappNumber // MANTAP, Lempar WA ke backend!
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                localStorage.setItem('jokifast_user', JSON.stringify(res.data.user));
                setIsOpen(false);
            }
        } catch (error) {
            console.error("Gagal simpan data onboarding:", error);
            alert("Terjadi kesalahan saat menyimpan data. Pastikan nomor WA belum dipakai akun lain.");
        } finally {
            setLoading(false);
            setUploadingText('');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-full max-w-lg bg-white text-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto"
                >
                    <div className="bg-emerald-600 p-6 sm:p-8 text-white">
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <CheckCircle className="w-6 h-6 text-emerald-300" /> Satu Langkah Lagi!
                        </h2>
                        <p className="text-emerald-50 text-sm leading-relaxed">
                            Bantu kami mengenal Anda. Isi data singkat ini agar sistem kami dapat mencocokkan Anda dengan pesanan yang paling sesuai.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-3">Status Saat Ini</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" onClick={() => setStatusMhs('mahasiswa')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${statusMhs === 'mahasiswa' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <GraduationCap className="w-5 h-5" /> Mahasiswa
                                </button>
                                <button type="button" onClick={() => setStatusMhs('umum')} className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${statusMhs === 'umum' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                    <Briefcase className="w-5 h-5" /> Umum / Pro
                                </button>
                            </div>
                        </div>

                        {statusMhs === 'mahasiswa' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                                <label className="text-sm font-semibold text-slate-700 block mb-2">Asal Universitas / Kampus</label>
                                <input
                                    type="text" required value={univ} onChange={(e) => setUniv(e.target.value)}
                                    placeholder="Contoh: Universitas Indonesia"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                />
                            </motion.div>
                        )}

                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-2">Keahlian Utama</label>
                            <select
                                required value={keahlian} onChange={(e) => setKeahlian(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                            >
                                <option value="" disabled>-- Pilih Keahlian Anda --</option>
                                <option value="Web Development">Web Development</option>
                                <option value="UI/UX Design">UI/UX Design</option>
                                <option value="Programming / Koding">Programming / Koding (Python, Java, dll)</option>
                                <option value="Pembuatan Makalah">Pembuatan Makalah / Artikel</option>
                                <option value="Bantuan Skripsi">Bantuan Skripsi</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>

                        {/* INPUT WHATSAPP BARU */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-2">Nomor WhatsApp Aktif</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Phone className="w-5 h-5 text-slate-400" />
                                </div>
                                <input
                                    type="tel" required value={whatsappNumber} onChange={handleWaChange}
                                    placeholder="Contoh: 081234567890"
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">Digunakan admin untuk notifikasi pencairan dana.</p>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-slate-700">CV / Portfolio</label>
                            </div>

                            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-3">
                                <button type="button" onClick={() => setUploadMethod('link')} className={`flex-1 text-xs py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${uploadMethod === 'link' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <LinkIcon className="w-4 h-4" /> Masukkan Link
                                </button>
                                <button type="button" onClick={() => setUploadMethod('file')} className={`flex-1 text-xs py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${uploadMethod === 'file' ? 'bg-white text-emerald-600 shadow' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <UploadCloud className="w-4 h-4" /> Upload File
                                </button>
                            </div>

                            {uploadMethod === 'link' ? (
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <LinkIcon className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <input
                                        type="url" required={uploadMethod === 'link'} value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)}
                                        placeholder="Link GDrive / LinkedIn / Github"
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900 placeholder:text-slate-400"
                                    />
                                    <p className="text-[10px] text-slate-500 mt-2 font-medium">*Pastikan link diatur "Publik" agar bisa dicek admin.</p>
                                </div>
                            ) : (
                                <div className="relative">
                                    <input
                                        type="file" id="cv-upload" className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange}
                                    />
                                    <label htmlFor="cv-upload" className="cursor-pointer w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-500 transition-all">
                                        <div className={`w-12 h-12 rounded-full mb-2 flex items-center justify-center ${file ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                            {file ? <FileText className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                                        </div>
                                        <p className="text-sm font-bold text-slate-700 text-center line-clamp-1 px-4">
                                            {file ? file.name : "Klik untuk pilih file"}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">PDF, JPG, atau PNG (Maks 5MB)</p>
                                    </label>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit" disabled={loading}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {uploadingText || 'Menyimpan...'}
                                </>
                            ) : 'Simpan & Mulai Cari Tugas'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}