import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { Send, FileText, Calendar, Tag, ChevronDown, AlignLeft, Sparkles, Phone, UploadCloud, File, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};


export default function BuatPesanan() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '', type: 'Tugas Koding', deadline: '', wa_klien: '', description: '', harga_tawaran: ''
    });

    // State baru buat nyimpen file tugas
    const [fileTugas, setFileTugas] = useState(null);
    const fileInputRef = useRef(null);

    const [calculatingPrice, setCalculatingPrice] = useState(false);
    const [priceEstimate, setPriceEstimate] = useState(null);

    useEffect(() => { window.scrollTo(0, 0); }, []);

    // [DISABLED SEMENTARA] Logic AI Estimator — dimatikan karena masih ada error
    // useEffect(() => {
    //     let isCancelled = false;
    //     if (formData.description.length > 20) {
    //         setCalculatingPrice(true);
    //         const timer = setTimeout(async () => {
    //             if (isCancelled) return;
    //             try {
    //                 const res = await fetch(`${API_URL}/api/orders/estimate-price`, {
    //                     method: 'POST',
    //                     headers: { 'Content-Type': 'application/json' },
    //                     body: JSON.stringify({ type: formData.type, description: formData.description })
    //                 });
    //                 if (isCancelled) return;
    //                 const data = await res.json();
    //                 if (data.success && data.estimate) {
    //                     setPriceEstimate({ format: data.estimate, bottom: data.bottom_price });
    //                 } else {
    //                     setPriceEstimate({ format: 'Menganalisa...', bottom: 0 });
    //                 }
    //             } catch (error) {
    //                 if (isCancelled) return;
    //                 console.error('Estimator error:', error);
    //                 setPriceEstimate({ format: 'Estimasi gagal dimuat', bottom: 0 });
    //             } finally {
    //                 if (!isCancelled) setCalculatingPrice(false);
    //             }
    //         }, 1500);
    //         return () => { isCancelled = true; clearTimeout(timer); setCalculatingPrice(false); };
    //     } else {
    //         setPriceEstimate(null);
    //         setCalculatingPrice(false);
    //     }
    // }, [formData.description, formData.type]);

    // Handle Upload File
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validasi ukuran max 10MB (Sesuai batas multer di backend)
            if (selectedFile.size > 10 * 1024 * 1024) {
                alert('Ukuran file terlalu besar! Maksimal 10MB.');
                return;
            }
            setFileTugas(selectedFile);
        }
    };

    const removeFile = () => {
        setFileTugas(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('jokifast_token');
            const user = JSON.parse(localStorage.getItem('jokifast_user') || '{}');

            if (!token) throw new Error('Sesi telah habis, silakan login ulang.');

            // Harga diambil dari input manual user (buang selain angka)
            let harga_total = 0;
            if (formData.harga_tawaran) {
                const cleanPrice = formData.harga_tawaran.replace(/\D/g, ''); // Cuma ambil digit angka
                if (cleanPrice) harga_total = parseInt(cleanPrice, 10);
            }

            // GANTI STRATEGI: Pakai FormData bawaan JS biar bisa ngirim file beneran
            const payload = new FormData();
            payload.append('nama_klien', user.nama || 'User JokiFast');
            payload.append('wa_klien', formData.wa_klien);
            payload.append('judul_tugas', formData.title);
            payload.append('deskripsi', `[Tipe: ${formData.type} | Deadline: ${formData.deadline}] \n\n${formData.description}`);
            payload.append('harga_total', harga_total);

            // Kalau user masukin file, kita selipin juga ke FormData
            if (fileTugas) {
                payload.append('file_tugas', fileTugas);
            }

            // Tembak API Backend
            const res = await axiosInstance.post('/orders/create', payload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Pesanan berhasil dibuat!');
            navigate('/dashboard/pesanan');
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = `w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all border ${isDark ? 'bg-slate-800/40 border-slate-700/50 text-slate-200 placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 focus:bg-slate-800/60' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 focus:bg-white'}`;
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12">
            <div>
                <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>Buat Pesanan Baru</h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Isi detail tugas Anda, sistem AI kami akan memberikan estimasi harga.</p>
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="visible" className={`rounded-2xl border shadow-xl overflow-hidden ${isDark ? 'bg-slate-900/60 backdrop-blur-sm border-slate-800/60' : 'bg-white border-gray-200'}`}>
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

                    {/* Judul Tugas */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Judul Tugas / Project</label>
                        <div className="relative">
                            <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Contoh: Bikin Web E-Commerce pakai React"
                                className={inputClass}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Tipe Layanan */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Tipe Layanan</label>
                            <div className="relative">
                                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    className={`${inputClass} appearance-none relative z-0`}
                                >
                                    <option>Tugas Koding</option>
                                    <option>Pembuatan Web / App</option>
                                    <option>Makalah / Laporan</option>
                                    <option>Desain UI/UX</option>
                                    <option>Lainnya</option>
                                </select>
                                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none z-10" />
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Deadline</label>
                            <div className="relative">
                                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Nomor WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={formData.wa_klien}
                                    onChange={(e) => setFormData({ ...formData, wa_klien: e.target.value })}
                                    placeholder="081234567890"
                                    className={inputClass}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Deskripsi Detail</label>
                        <div className="relative">
                            <AlignLeft className="absolute left-3.5 top-4 w-4 h-4 text-slate-500" />
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={5}
                                placeholder="Jelaskan kebutuhan tugas Anda sedetail mungkin. Ketik minimal 20 karakter untuk melihat estimasi harga otomatis..."
                                className={`${inputClass} py-3.5 resize-none`}
                                required
                            />
                        </div>
                    </div>

                    {/* Tawaran Harga Manual (Baru) */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Tawaran Harga (Opsional)</label>
                        <p className={`text-xs -mt-1 mb-2 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>Kosongkan jika ingin sistem statusnya menjadi "Harga Nego"</p>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium font-mono">Rp</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.harga_tawaran}
                                onChange={(e) => {
                                    // Format otomatis pakai titik separator ribuan
                                    const rawValue = e.target.value.replace(/\D/g, '');
                                    const formatted = rawValue ? new Intl.NumberFormat('id-ID').format(rawValue) : '';
                                    setFormData({ ...formData, harga_tawaran: formatted });
                                }}
                                placeholder="Contoh: 150.000 (Kosongkan untuk Nego)"
                                className={`${inputClass} !pl-12`}
                            />
                        </div>
                    </div>

                    {/* === AREA UPLOAD FILE TUGAS (BARU) === */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">File Referensi / Soal (Opsional)</label>

                        {!fileTugas ? (
                            // Tampilan kalau belum pilih file
                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center ${isDark ? 'border-slate-700/50 hover:border-blue-500/50 hover:bg-blue-500/5 bg-slate-800/20' : 'border-gray-300 hover:border-blue-500/50 hover:bg-blue-50 bg-gray-50'}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mb-2">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <h4 className="font-semibold text-slate-300">Klik untuk upload file</h4>
                                <p className="text-xs text-slate-500">Mendukung PDF, DOCX, ZIP, JPG (Maks 10MB)</p>
                            </div>
                        ) : (
                            // Tampilan kalau file udah dipilih
                            <div className="w-full border border-blue-500/30 bg-blue-500/10 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                                        <File className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-blue-500 text-sm truncate">{fileTugas.name}</p>
                                        <p className="text-xs text-blue-500/70">{(fileTugas.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="p-2 text-blue-500 hover:bg-blue-500/20 hover:text-blue-400 rounded-lg transition-colors"
                                    title="Hapus file"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                        {/* Input file asli disembunyikan */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg"
                        />
                    </div>

                    {/* [DISABLED SEMENTARA] Estimasi Harga AI — dimatikan karena masih ada error */}
                    {/* <AnimatePresence>
                        {(calculatingPrice || priceEstimate) && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className={`p-4 rounded-xl border flex items-center gap-4 transition-colors ${isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="min-h-[44px]">
                                            {calculatingPrice ? (
                                                <div className={`flex items-center gap-2 text-sm font-medium h-full ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    AI Groq sedang mengkalkulasi harga...
                                                </div>
                                            ) : (
                                                <>
                                                    <p className={`text-xs font-medium flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        Estimasi Harga Awal
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-500/10 text-indigo-600'}`}>AI PREDICT</span>
                                                    </p>
                                                    <p className={`text-lg font-bold mt-0.5 ${textPrimary}`}>
                                                        {typeof priceEstimate === 'string' ? priceEstimate : (priceEstimate.format || 'Rp 0')}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence> */}

                    {/* Submit */}
                    <div className="pt-4 border-t flex justify-end border-slate-800/60">
                        <button type="submit" disabled={loading}
                            className="flex items-center gap-2 px-8 py-3.5 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-500/50 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all w-full sm:w-auto justify-center"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Mengunggah Data...
                                </>
                            ) : (
                                <><Send className="w-4 h-4" /> Kirim Permintaan Order</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}