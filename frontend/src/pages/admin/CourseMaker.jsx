import { useState } from 'react';
import axiosInstance from '../../api/axiosInstance';
import axios from 'axios';
import { BookOpen, Layers, PlusCircle, Save, Loader2, FileText, Sparkles, CheckCircle, GitBranch, LayoutList, ListTree, UploadCloud, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
    ]
};

const STEPS = [
    { key: 'course', label: '1. Tema', icon: LayoutList, color: 'blue' },
    { key: 'class', label: '2. Kelas', icon: Layers, color: 'emerald' },
    { key: 'branch', label: '3. Cabang', icon: GitBranch, color: 'amber' },
    { key: 'smallbranch', label: '4. Materi & AI', icon: FileText, color: 'purple' },
];

const inputCls = "w-full border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500";

export default function CourseMaker() {
    const [loading, setLoading] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('course');
    const [savedCourseId, setSavedCourseId] = useState(null);
    const [savedClassId, setSavedClassId] = useState(null);
    const [savedBranchId, setSavedBranchId] = useState(null);
    const [savedSmallBranchId, setSavedSmallBranchId] = useState(null);
    const [generatedQuizzes, setGeneratedQuizzes] = useState([]);
    const [courseForm, setCourseForm] = useState({ 
        title: '', 
        description: '', 
        type: 'FREE_ALL', 
        price: '', 
        bannerUrl: '',
        originalPrice: '',
        category: 'Web Development',
        level: 'Semua Level',
        promoVideoUrl: '',
        fullDescription: '',
        benefits: [''], // Start with one empty benefit
        estimatedHours: 0
    });
    const [classForm, setClassForm] = useState({ title: '', description: '', orderIndex: 1, isPremium: false });
    const [branchForm, setBranchForm] = useState({ title: '', orderIndex: 1 });
    const [smallBranchForm, setSmallBranchForm] = useState({ title: '', content: '', orderIndex: 1 });
    const [quizMode, setQuizMode] = useState('AI');
    const [quizLoading, setQuizLoading] = useState(false);
    const [manualQuiz, setManualQuiz] = useState({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });

    const isStepEnabled = (key) => {
        if (key === 'course') return true;
        if (key === 'class') return !!savedCourseId;
        if (key === 'branch') return !!savedClassId;
        if (key === 'smallbranch') return !!savedBranchId;
        return false;
    };

    const [uploadingMedia, setUploadingMedia] = useState({ bannerUrl: false, promoVideoUrl: false });

    const handleCloudinaryUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingMedia(prev => ({ ...prev, [field]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'jokifast_unsigned');
            
            const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/dmx124vqf/auto/upload`, formData);
            
            setCourseForm(prev => ({ ...prev, [field]: cloudRes.data.secure_url }));
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Gagal mengupload file. Pastikan ukuran file sesuai batas.");
        } finally {
            setUploadingMedia(prev => ({ ...prev, [field]: false }));
            e.target.value = null; // reset input
        }
    };

    const handleAddBenefit = () => {
        setCourseForm(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
    };

    const handleRemoveBenefit = (idx) => {
        setCourseForm(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== idx) }));
    };

    const handleBenefitChange = (idx, val) => {
        const newBenefits = [...courseForm.benefits];
        newBenefits[idx] = val;
        setCourseForm(prev => ({ ...prev, benefits: newBenefits }));
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const finalForm = { ...courseForm, benefits: courseForm.benefits.filter(b => b.trim() !== '') };
            const res = await axiosInstance.post('/ideafast/create', finalForm);
            if (res.data.success) { setSavedCourseId(res.data.data.id); setActiveTab('class'); alert('Level 1: Tema berhasil dibuat!'); }
        } catch { alert('Gagal bikin tema!'); } finally { setLoading(false); }
    };

    const handleClassSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await axiosInstance.post('/ideafast/class/create', { ...classForm, courseId: savedCourseId });
            if (res.data.success) { setSavedClassId(res.data.data.id); setActiveTab('branch'); alert('Level 2: Kelas sukses ditambah!'); }
        } catch { alert('Gagal nambahin kelas!'); } finally { setLoading(false); }
    };

    const handleBranchSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await axiosInstance.post('/ideafast/branch/create', { ...branchForm, classId: savedClassId });
            if (res.data.success) { setSavedBranchId(res.data.data.id); setActiveTab('smallbranch'); alert('Level 3: Cabang Kelas sukses dibuat!'); }
        } catch { alert('Gagal nambahin cabang!'); } finally { setLoading(false); }
    };

    const handleSmallBranchSubmit = async (e) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await axiosInstance.post('/ideafast/smallbranch/create', { ...smallBranchForm, branchClassId: savedBranchId });
            if (res.data.success) { setSavedSmallBranchId(res.data.data.id); alert('Level 4: Materi berhasil disimpan!'); }
        } catch { alert('Gagal nyimpen materi!'); } finally { setLoading(false); }
    };

    const handleGenerateAI = async () => {
        if (!savedSmallBranchId) return alert('Simpan materi teksnya dulu biar AI bisa baca!');
        setAiLoading(true);
        try {
            const res = await axiosInstance.post('/ideafast/branch/generate-quiz', { branchClassId: savedBranchId });
            if (res.data.success) { setGeneratedQuizzes([...generatedQuizzes, ...res.data.data]); alert('AI sukses bikin soal!'); }
        } catch { alert('AI gagal generate!'); } finally { setAiLoading(false); }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault(); setQuizLoading(true);
        try {
            const res = await axiosInstance.post('/ideafast/quiz/create', { ...manualQuiz, branchClassId: savedBranchId });
            if (res.data.success) {
                setGeneratedQuizzes([...generatedQuizzes, res.data.data]);
                setManualQuiz({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A' });
                alert('Soal manual sukses ditambah!');
            }
        } catch { alert('Gagal nyimpen soal!'); } finally { setQuizLoading(false); }
    };

    const colorMap = {
        blue: { bg: 'bg-blue-600 hover:bg-blue-700', light: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30', badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400', shadow: 'shadow-blue-500/20', ring: 'focus:ring-blue-500' },
        emerald: { bg: 'bg-emerald-600 hover:bg-emerald-700', light: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30', badge: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400', shadow: 'shadow-emerald-500/20', ring: 'focus:ring-emerald-500' },
        amber: { bg: 'bg-amber-600 hover:bg-amber-700', light: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/30', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400', shadow: 'shadow-amber-500/20', ring: 'focus:ring-amber-500' },
        purple: { bg: 'bg-purple-600 hover:bg-purple-700', light: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/30', badge: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400', shadow: 'shadow-purple-500/20', ring: 'focus:ring-purple-500' },
    };

    const currentStep = STEPS.find(s => s.key === activeTab);
    const c = colorMap[currentStep?.color || 'blue'];

    return (
        <div className="max-w-5xl mx-auto md:p-6 mb-20">
            {/* HEADER */}
            <div className="mb-8 px-4 md:px-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                    <BookOpen className="text-blue-600 dark:text-blue-400 w-8 h-8" /> IDefast Maker
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Buat konten E-Learning step-by-step (4-Level Architecture)</p>
            </div>

            {/* PROGRESS STEPS */}
            <div className="flex gap-2 md:gap-3 mb-6 px-4 md:px-0 overflow-x-auto pb-2">
                {STEPS.map((step, idx) => {
                    const enabled = isStepEnabled(step.key);
                    const active = activeTab === step.key;
                    const completed = (step.key === 'course' && savedCourseId) || (step.key === 'class' && savedClassId) || (step.key === 'branch' && savedBranchId) || (step.key === 'smallbranch' && savedSmallBranchId);
                    const Icon = step.icon;
                    return (
                        <button
                            key={step.key}
                            onClick={() => enabled && setActiveTab(step.key)}
                            disabled={!enabled}
                            className={`flex whitespace-nowrap items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
                                active
                                    ? `${colorMap[step.color].bg} text-white border-transparent shadow-lg ${colorMap[step.color].shadow}`
                                    : completed
                                        ? `${colorMap[step.color].light} border`
                                        : enabled
                                            ? 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-700 opacity-50 cursor-not-allowed'
                            }`}
                        >
                            {completed && !active ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                            {step.label}
                        </button>
                    );
                })}
            </div>

            {/* FORM AREA */}
            <div className="px-4 md:px-0">
                {/* 1. TEMA (COURSE) */}
                {activeTab === 'course' && (
                    <form onSubmit={handleCourseSubmit} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-8">
                        {/* SECTION 1: BASIC INFO */}
                        <div className="space-y-5">
                            <div className="flex items-center gap-2 mb-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                                <span className={`${c.badge} px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider`}>Level 1</span>
                                <h2 className="font-bold text-slate-800 dark:text-white">Informasi Dasar</h2>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Judul Tema Kursus</label>
                                <input type="text" required value={courseForm.title} onChange={e => setCourseForm({ ...courseForm, title: e.target.value })} className={inputCls} placeholder="Cth: Web Programming Masterclass" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Deskripsi Singkat (Katalog)</label>
                                <textarea required value={courseForm.description} onChange={e => setCourseForm({ ...courseForm, description: e.target.value })} className={`${inputCls} h-20 resize-none`} placeholder="Deskripsi pendek untuk tampilan depan katalog..." />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Kategori</label>
                                    <select value={courseForm.category} onChange={e => setCourseForm({ ...courseForm, category: e.target.value })} className={inputCls}>
                                        <option value="Web Development">Web Development</option>
                                        <option value="UI/UX Design">UI/UX Design</option>
                                        <option value="Mobile Development">Mobile Development</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="DevOps">DevOps</option>
                                        <option value="Business">Business</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Level Kursus</label>
                                    <select value={courseForm.level} onChange={e => setCourseForm({ ...courseForm, level: e.target.value })} className={inputCls}>
                                        <option value="Semua Level">Semua Level</option>
                                        <option value="Pemula">Pemula</option>
                                        <option value="Menengah">Menengah</option>
                                        <option value="Mahir">Mahir</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: PRICING */}
                        <div className="space-y-5">
                            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Harga & Akses</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tipe Monetisasi</label>
                                    <select value={courseForm.type} onChange={e => setCourseForm({ ...courseForm, type: e.target.value })} className={inputCls}>
                                        <option value="FREE_ALL">Full Gratis 100%</option>
                                        <option value="PREMIUM">Premium (Bayar Penuh)</option>
                                        <option value="FREEMIUM_CLASS">Freemium (Sebagian Gratis)</option>
                                        <option value="PAID_CERTIFICATE">Gratis Materi, Sertifikat Bayar</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Harga Jual (Rp)</label>
                                    <input type="number" value={courseForm.price} onChange={e => setCourseForm({ ...courseForm, price: e.target.value })} className={inputCls} placeholder="0 jika gratis" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Harga Coret (Asli)</label>
                                    <input type="number" value={courseForm.originalPrice} onChange={e => setCourseForm({ ...courseForm, originalPrice: e.target.value })} className={inputCls} placeholder="Opsional (Harga Diskon)" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: MEDIA */}
                        <div className="space-y-5">
                            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Media Konten</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Banner Kursus (Thumbnail)</label>
                                    <div className="flex items-center gap-2">
                                        <input type="text" readOnly value={courseForm.bannerUrl} className={`${inputCls} flex-1 bg-slate-50`} placeholder="URL akan muncul di sini" />
                                        <label className="cursor-pointer px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-2">
                                            {uploadingMedia.bannerUrl ? <Loader2 className="w-5 h-5 animate-spin"/> : "Upload"}
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e, 'bannerUrl')} />
                                        </label>
                                    </div>
                                    {courseForm.bannerUrl && <img src={courseForm.bannerUrl} alt="Banner Preview" className="mt-3 h-32 w-auto object-cover rounded-lg border border-slate-200" />}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Promo Video URL (Opsional)</label>
                                    <div className="flex items-center gap-2">
                                        <input type="text" readOnly value={courseForm.promoVideoUrl} className={`${inputCls} flex-1 bg-slate-50`} placeholder="URL video teaser" />
                                        <label className="cursor-pointer px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 transition-colors flex items-center gap-2">
                                            {uploadingMedia.promoVideoUrl ? <Loader2 className="w-5 h-5 animate-spin"/> : "Upload"}
                                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleCloudinaryUpload(e, 'promoVideoUrl')} />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: FULL DESCRIPTION & BENEFITS */}
                        <div className="space-y-5">
                            <h3 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Manfaat & Penjelasan (Overview)</h3>
                            
                            <div className="pb-12 pt-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Deskripsi Lengkap (Rich Text)</label>
                                <style>{`
                                    .maker-overview-editor .ql-toolbar.ql-snow { border: 1px solid #e2e8f0 !important; border-bottom: 1px solid #e2e8f0 !important; border-radius: 12px 12px 0 0; background: #f8fafc; }
                                    .dark .maker-overview-editor .ql-toolbar.ql-snow { background: #0f172a !important; border-color: #334155 !important; }
                                    .dark .maker-overview-editor .ql-toolbar .ql-stroke { stroke: #94a3b8 !important; }
                                    .dark .maker-overview-editor .ql-toolbar .ql-fill { fill: #94a3b8 !important; }
                                    .dark .maker-overview-editor .ql-toolbar .ql-picker-label { color: #94a3b8 !important; }
                                    .maker-overview-editor .ql-container.ql-snow { border: 1px solid #e2e8f0 !important; border-top: 0 !important; border-radius: 0 0 12px 12px; font-size: 15px; line-height: 1.7; }
                                    .dark .maker-overview-editor .ql-container.ql-snow { border-color: #334155 !important; }
                                    .maker-overview-editor .ql-editor { min-height: 200px; padding: 20px !important; background: white; }
                                    .dark .maker-overview-editor .ql-editor { background: #1e293b !important; color: #e2e8f0 !important; }
                                `}</style>
                                <div className="maker-overview-editor">
                                    <ReactQuill theme="snow" value={courseForm.fullDescription} onChange={(val) => setCourseForm({ ...courseForm, fullDescription: val })} modules={quillModules} placeholder="Tuliskan overview kursus selengkapnya untuk memikat siswa..." />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">What You Will Master (Benefits)</label>
                                    <div className="space-y-3">
                                        {courseForm.benefits.map((benefit, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={benefit} 
                                                    onChange={e => handleBenefitChange(index, e.target.value)} 
                                                    className={`${inputCls} py-2`} 
                                                    placeholder={`Benefit ${index + 1}...`} 
                                                />
                                                {courseForm.benefits.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveBenefit(index)} className="px-3 shrink-0 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors">X</button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button type="button" onClick={handleAddBenefit} className="mt-3 text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">+ Tambah Benefit</button>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estimasi Jam Belajar</label>
                                    <input type="number" value={courseForm.estimatedHours} onChange={e => setCourseForm({ ...courseForm, estimatedHours: e.target.value })} className={inputCls} placeholder="Cth: 12" />
                                    <p className="text-xs text-slate-500 mt-2">Jam total diperkirakan dari materi dan video. Isi 0 jika belum tau.</p>
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full ${c.bg} text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg ${c.shadow} mt-8`}>
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />} Simpan Informasi & Buat Tema Path
                        </button>
                    </form>
                )}

                {/* 2. KELAS (CLASS) */}
                {activeTab === 'class' && (
                    <form onSubmit={handleClassSubmit} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                            <span className={`${c.badge} px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider`}>Level 2</span>
                            <h2 className="font-bold text-slate-800 dark:text-white">Informasi Kelas (Bab)</h2>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Judul Kelas</label>
                            <input type="text" required value={classForm.title} onChange={e => setClassForm({ ...classForm, title: e.target.value })} className={inputCls} placeholder="Cth: 1. Apa itu Web?" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Urutan Tampil</label>
                                <input type="number" required value={classForm.orderIndex} onChange={e => setClassForm({ ...classForm, orderIndex: e.target.value })} className={inputCls} min="1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Akses Kelas</label>
                                <select value={classForm.isPremium} onChange={e => setClassForm({ ...classForm, isPremium: e.target.value === 'true' })} className={inputCls}>
                                    <option value="false">Gratis / Publik</option>
                                    <option value="true">Premium (Terkunci)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Deskripsi Kelas</label>
                            <textarea value={classForm.description} onChange={e => setClassForm({ ...classForm, description: e.target.value })} className={`${inputCls} h-24 resize-none`} placeholder="Bab ini akan membahas tentang..." />
                        </div>
                        <button type="submit" disabled={loading} className={`w-full ${c.bg} text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg ${c.shadow}`}>
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlusCircle className="w-5 h-5" />} Tambah Kelas Besar
                        </button>
                    </form>
                )}

                {/* 3. CABANG KELAS (BRANCH) */}
                {activeTab === 'branch' && (
                    <form onSubmit={handleBranchSubmit} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                            <span className={`${c.badge} px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider`}>Level 3</span>
                            <h2 className="font-bold text-slate-800 dark:text-white">Informasi Cabang (Sub-Bab)</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Judul Cabang</label>
                                <input type="text" required value={branchForm.title} onChange={e => setBranchForm({ ...branchForm, title: e.target.value })} className={inputCls} placeholder="Cth: 1.1 Sejarah Web" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Urutan Tampil</label>
                                <input type="number" required value={branchForm.orderIndex} onChange={e => setBranchForm({ ...branchForm, orderIndex: e.target.value })} className={inputCls} min="1" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className={`w-full ${c.bg} text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg ${c.shadow}`}>
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <GitBranch className="w-5 h-5" />} Bikin Cabang Materi
                        </button>
                    </form>
                )}

                {/* 4. MATERI + QUIZ */}
                {activeTab === 'smallbranch' && (
                    <div className="space-y-6">
                        {/* MATERI FORM */}
                        <form onSubmit={handleSmallBranchSubmit} className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-5">
                            <div className="flex items-center gap-2 mb-2 border-b border-slate-200 dark:border-slate-700 pb-4">
                                <span className={`${c.badge} px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider`}>Level 4</span>
                                <h2 className="font-bold text-slate-800 dark:text-white">Potongan Materi (Teks)</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Judul Potongan Materi</label>
                                    <input type="text" required value={smallBranchForm.title} onChange={e => setSmallBranchForm({ ...smallBranchForm, title: e.target.value })} className={inputCls} placeholder="Cth: Bagian 1: Definisi" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Urutan Tampil</label>
                                    <input type="number" required value={smallBranchForm.orderIndex} onChange={e => setSmallBranchForm({ ...smallBranchForm, orderIndex: e.target.value })} className={inputCls} min="1" />
                                </div>
                            </div>

                            <div className="pb-12 pt-2">
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Isi Materi Pembelajaran</label>
                                <style>{`
                                    .maker-editor .ql-toolbar.ql-snow { border: 1px solid #e2e8f0 !important; border-bottom: 1px solid #e2e8f0 !important; border-radius: 12px 12px 0 0; background: #f8fafc; }
                                    .dark .maker-editor .ql-toolbar.ql-snow { background: #0f172a !important; border-color: #334155 !important; }
                                    .dark .maker-editor .ql-toolbar .ql-stroke { stroke: #94a3b8 !important; }
                                    .dark .maker-editor .ql-toolbar .ql-fill { fill: #94a3b8 !important; }
                                    .dark .maker-editor .ql-toolbar .ql-picker-label { color: #94a3b8 !important; }
                                    .maker-editor .ql-container.ql-snow { border: 1px solid #e2e8f0 !important; border-top: 0 !important; border-radius: 0 0 12px 12px; font-size: 15px; line-height: 1.7; }
                                    .dark .maker-editor .ql-container.ql-snow { border-color: #334155 !important; }
                                    .maker-editor .ql-editor { min-height: 300px; padding: 20px !important; background: white; }
                                    .dark .maker-editor .ql-editor { background: #1e293b !important; color: #e2e8f0 !important; }
                                `}</style>
                                <div className="maker-editor">
                                    <ReactQuill theme="snow" value={smallBranchForm.content} onChange={(val) => setSmallBranchForm({ ...smallBranchForm, content: val })} modules={quillModules} placeholder="Mulai menulis konten materi..." />
                                </div>
                            </div>

                            <button type="submit" disabled={loading || savedSmallBranchId} className={`w-full font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-transform ${savedSmallBranchId ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed' : `${c.bg} active:scale-95 text-white shadow-lg ${c.shadow}`}`}>
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : savedSmallBranchId ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                                {savedSmallBranchId ? 'Materi Tersimpan!' : 'Simpan Materi ke Database'}
                            </button>
                        </form>

                        {/* QUIZ FACTORY */}
                        {savedSmallBranchId && (
                            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                                    <div>
                                        <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-purple-500" /> Pabrik Soal
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Soal muncul di ujung Level 3 (Cabang).</p>
                                    </div>
                                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 shrink-0">
                                        <button onClick={() => setQuizMode('AI')} className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${quizMode === 'AI' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>✨ Llama AI</button>
                                        <button onClick={() => setQuizMode('MANUAL')} className={`px-5 py-2 rounded-lg font-semibold transition-all text-sm ${quizMode === 'MANUAL' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}>✍️ Manual</button>
                                    </div>
                                </div>

                                {/* AI MODE */}
                                {quizMode === 'AI' && (
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 p-6 rounded-xl border border-purple-200 dark:border-purple-500/30 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div>
                                            <p className="font-bold text-purple-800 dark:text-purple-200 text-lg">Generate 5 Soal Otomatis</p>
                                            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1 max-w-md">AI akan membaca materi yang sudah disimpan dan membuat 5 soal PG secara otomatis.</p>
                                        </div>
                                        <button onClick={handleGenerateAI} disabled={aiLoading} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-500/20">
                                            {aiLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />} Generate Soal!
                                        </button>
                                    </div>
                                )}

                                {/* MANUAL MODE */}
                                {quizMode === 'MANUAL' && (
                                    <form onSubmit={handleManualSubmit} className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-5">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Pertanyaan</label>
                                            <input type="text" required value={manualQuiz.question} onChange={e => setManualQuiz({ ...manualQuiz, question: e.target.value })} className={inputCls} placeholder="Ketik soal disini..." />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {['A', 'B', 'C', 'D'].map((opt) => (
                                                <div key={opt}>
                                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Opsi {opt}</label>
                                                    <input type="text" required value={manualQuiz[`option${opt}`]} onChange={e => setManualQuiz({ ...manualQuiz, [`option${opt}`]: e.target.value })} className={inputCls} />
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Jawaban Benar</label>
                                            <select value={manualQuiz.correctAnswer} onChange={e => setManualQuiz({ ...manualQuiz, correctAnswer: e.target.value })} className={inputCls}>
                                                <option value="A">Opsi A</option><option value="B">Opsi B</option><option value="C">Opsi C</option><option value="D">Opsi D</option>
                                            </select>
                                        </div>
                                        <button type="submit" disabled={quizLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex justify-center items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-500/20">
                                            {quizLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <PlusCircle className="w-5 h-5" />} Simpan Soal Manual
                                        </button>
                                    </form>
                                )}

                                {/* QUIZ LIST */}
                                {generatedQuizzes.length > 0 && (
                                    <div className="mt-8 space-y-4 border-t border-slate-200 dark:border-slate-700 pt-6">
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
                                            <ListTree className="w-5 h-5 text-emerald-500" /> Daftar Soal ({generatedQuizzes.length})
                                        </h4>
                                        <div className="space-y-4">
                                            {generatedQuizzes.map((q, idx) => (
                                                <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                                    <p className="font-bold mb-4 text-slate-800 dark:text-white text-base">{idx + 1}. {q.question}</p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                        {['A', 'B', 'C', 'D'].map((opt) => (
                                                            <div key={opt} className={`p-3 rounded-lg flex gap-3 items-start border ${q.correctAnswer === opt ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30 font-semibold' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                                                                <span className="shrink-0 w-6 h-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">{opt}</span>
                                                                <span className="mt-0.5 leading-tight">{q[`option${opt}`]}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}