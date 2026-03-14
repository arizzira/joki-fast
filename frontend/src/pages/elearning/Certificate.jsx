import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Loader2, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import axiosInstance from '../../api/axiosInstance';

export default function Certificate() {
    const { id } = useParams();
    const navigate = useNavigate();
    const certificateRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // State nyimpen data sertifikat
    const [data, setData] = useState({
        userName: 'Nama Siswa',
        courseTitle: 'Judul Kursus',
        date: ''
    });

    useEffect(() => {
        const fetchCertificateData = async () => {
            try {
                // Ambil data course untuk nama kursusnya
                const resCourse = await axiosInstance.get(`/ideafast/public/course/${id}`);

                // Ambil profil user yang lagi login dari localStorage (Sesuaikan kalau lu nyimpennya beda)
                // Idealnya nembak endpoint /profile, tapi sementara kita ambil dari token/localStorage aja
                // Asumsi lu nyimpen nama user di localstorage waktu login:
                const savedName = localStorage.getItem('jokifast_user_name') || 'Siswa Berprestasi';

                setData({
                    userName: savedName,
                    courseTitle: resCourse.data?.data?.title || 'Kursus E-Learning IDeFast',
                    date: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
                });
            } catch (error) {
                console.error("Gagal load data sertifikat", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCertificateData();
    }, [id]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const element = certificateRef.current;
            // Ubah div HTML jadi gambar (Canvas)
            const canvas = await html2canvas(element, {
                scale: 3, // Resolusi tinggi
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');

            // Masukin gambar ke dalam file PDF
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

            // Download File
            const fileName = `Sertifikat_${data.courseTitle.replace(/\s+/g, '_')}.pdf`;
            pdf.save(fileName);
        } catch (error) {
            alert("Gagal men-download sertifikat.");
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex justify-center items-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 font-sans overflow-x-hidden">

            {/* ── HEADER ACTION ── */}
            <div className="max-w-[1056px] w-full flex flex-wrap gap-4 items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors bg-white px-5 py-2.5 rounded-xl shadow-sm border border-slate-200">
                    <ArrowLeft className="w-5 h-5" /> Kembali
                </button>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
                >
                    {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    {downloading ? 'Memproses PDF...' : 'Download Sertifikat (PDF)'}
                </button>
            </div>

            {/* ── WRAPPER SERTIFIKAT (Biar bisa di-scroll horizontal di HP) ── */}
            <div className="w-full max-w-[1056px] overflow-x-auto pb-10 flex justify-start lg:justify-center custom-scrollbar">

                {/* ── KANVAS SERTIFIKAT (Area ini yang bakal ke-print ke PDF) ── */}
                <div
                    ref={certificateRef}
                    className="relative bg-white flex flex-col items-center justify-center shrink-0 overflow-hidden"
                    style={{
                        width: '1056px', // Ukuran proporsi A4 Landscape
                        height: '746px',
                        padding: '40px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' // Shadow luar (nggak akan ikut ke-print)
                    }}
                >
                    {/* Border Emas Dalam */}
                    <div className="absolute inset-0 m-5 border-[14px] border-double border-amber-200/60 pointer-events-none"></div>
                    <div className="absolute inset-0 m-8 border border-amber-400/40 pointer-events-none"></div>

                    {/* Background Pola Halus */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>

                    {/* Konten Utama Sertifikat */}
                    <div className="relative z-10 flex flex-col items-center text-center w-full px-24">

                        {/* Logo / Badge */}
                        <div className="mb-6 text-amber-500 bg-amber-50 p-4 rounded-full border border-amber-100 shadow-inner">
                            <Award className="w-16 h-16" />
                        </div>

                        <h1 className="text-5xl font-black text-slate-900 tracking-widest uppercase mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Certificate of Completion
                        </h1>
                        <p className="text-amber-600 font-black tracking-[0.3em] uppercase text-sm mb-12">
                            IDeFast E-Learning Platform
                        </p>

                        <p className="text-slate-500 text-lg mb-4 font-medium">
                            Diberikan dengan bangga kepada:
                        </p>

                        {/* Nama Siswa */}
                        <h2 className="text-[4rem] font-bold text-indigo-950 mb-6 italic leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {data.userName}
                        </h2>

                        <p className="text-slate-500 text-lg mb-4 max-w-3xl leading-relaxed font-medium">
                            Atas dedikasi dan keberhasilannya dalam menyelesaikan seluruh materi serta lulus ujian evaluasi pada kursus:
                        </p>

                        {/* Nama Kursus */}
                        <h3 className="text-3xl font-extrabold text-slate-800 mb-14 max-w-4xl leading-snug">
                            "{data.courseTitle}"
                        </h3>

                        {/* Footer Sertifikat (Tanda Tangan, Stempel, Tanggal) */}
                        <div className="flex justify-between items-end w-full px-12 mt-4">

                            {/* Bagian Kiri: Tanggal */}
                            <div className="flex flex-col items-center w-48">
                                <span className="text-slate-800 font-bold text-xl border-b-2 border-slate-300 pb-2 mb-2 w-full text-center">
                                    {data.date}
                                </span>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tanggal Kelulusan</span>
                            </div>

                            {/* Bagian Tengah: Stempel Verified (Fake) */}
                            <div className="w-32 h-32 rounded-full border-[6px] border-amber-400 flex items-center justify-center bg-amber-50 shadow-lg relative opacity-90 transform -rotate-12">
                                <div className="absolute inset-2 border border-dashed border-amber-300 rounded-full"></div>
                                <div className="text-center">
                                    <p className="text-[11px] font-black text-amber-600 uppercase tracking-widest leading-tight">Verified<br />IDeFast<br />Alumni</p>
                                </div>
                            </div>

                            {/* Bagian Kanan: Tanda Tangan */}
                            <div className="flex flex-col items-center w-48">
                                <div className="h-16 w-full flex items-end justify-center border-b-2 border-slate-300 pb-2 mb-2 relative overflow-hidden">
                                    {/* Signature Font Tipuan (Pake script font css) */}
                                    <span className="text-5xl text-slate-800 -mb-2" style={{ fontFamily: "'Brush Script MT', cursive" }}>Ariz. R</span>
                                </div>
                                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Direktur Platform</span>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            {/* Import font khusus sertifikat biar mewah */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&display=swap');
                
                .custom-scrollbar::-webkit-scrollbar { height: 10px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 8px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
            `}</style>
        </div>
    );
}