import { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Loader2, BookOpen, Wrench, X, HelpCircle, Eye, EyeOff, UploadCloud, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const COURSE_TYPES = ['FREE_ALL', 'PREMIUM', 'FREEMIUM_CLASS', 'PAID_CERTIFICATE'];

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

export default function ElearningDetail() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [editModal, setEditModal] = useState({ isOpen: false, data: null });
    const [uploadingMedia, setUploadingMedia] = useState({ bannerUrl: false, promoVideoUrl: false });
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        type: 'FREE_ALL',
        price: 0,
        isPublished: false,
        bannerUrl: '',
        originalPrice: '',
        category: 'Semua',
        level: 'Semua Level',
        promoVideoUrl: '',
        fullDescription: '',
        benefits: [''],
        estimatedHours: 0
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            const res = await axiosInstance.get('/ideafast/all-tree');
            if (res.data.success) setCourses(res.data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const handleTogglePublish = async (course) => {
        const newStatus = !course.isPublished;
        const label = newStatus ? 'Publish' : 'Unpublish';
        if (!window.confirm(`${label} "${course.title}"? ${newStatus ? 'Course akan tampil di katalog publik.' : 'Course akan disembunyikan dari katalog.'}`)) return;
        try {
            await axiosInstance.put(`/ideafast/course/${course.id}`, { isPublished: newStatus });
            await fetchData();
        } catch { alert(`Gagal ${label.toLowerCase()} course.`); }
    };

    const handleDeleteCourse = async (id, title) => {
        if (!window.confirm(`Yakin hapus "${title}"? Semua data di dalamnya ikut terhapus!`)) return;
        try { await axiosInstance.delete(`/ideafast/course/${id}`); await fetchData(); }
        catch { alert('Gagal menghapus Course.'); }
    };

    const openEditModal = (course) => {
        setEditForm({
            title: course.title,
            description: course.description || '',
            type: course.type,
            price: course.price,
            isPublished: course.isPublished,
            bannerUrl: course.bannerUrl || '',
            originalPrice: course.originalPrice || '',
            category: course.category || 'Semua',
            level: course.level || 'Semua Level',
            promoVideoUrl: course.promoVideoUrl || '',
            fullDescription: course.fullDescription || '',
            benefits: course.benefits?.length > 0 ? course.benefits : [''],
            estimatedHours: course.estimatedHours || 0
        });
        setEditModal({ isOpen: true, data: course });
    };

    const handleCloudinaryUpload = async (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingMedia(prev => ({ ...prev, [field]: true }));
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'jokifast_unsigned');

            const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/dncj5irc9/auto/upload`, formData);

            setEditForm(prev => ({ ...prev, [field]: cloudRes.data.secure_url }));
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Gagal mengupload file. Pastikan ukuran file sesuai batas.");
        } finally {
            setUploadingMedia(prev => ({ ...prev, [field]: false }));
            e.target.value = null; // reset input
        }
    };

    const handleAddBenefit = () => setEditForm(p => ({ ...p, benefits: [...p.benefits, ''] }));
    const handleRemoveBenefit = (idx) => setEditForm(p => ({ ...p, benefits: p.benefits.filter((_, i) => i !== idx) }));
    const handleBenefitChange = (idx, val) => {
        const newB = [...editForm.benefits];
        newB[idx] = val;
        setEditForm(p => ({ ...p, benefits: newB }));
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        try {
            const finalForm = { ...editForm, benefits: editForm.benefits.filter(b => b.trim() !== '') };
            await axiosInstance.put(`/ideafast/course/${editModal.data.id}`, { ...finalForm, price: Number(finalForm.price) });
            setEditModal({ isOpen: false, data: null });
            await fetchData();
        } catch { alert('Gagal update Course.'); }
    };

    const countTotalQuizzes = (course) => {
        let count = course.quizzes?.length || 0;
        course.classes?.forEach(cls => {
            count += cls.quizzes?.length || 0;
            cls.branchClasses?.forEach(b => { count += b.quizzes?.length || 0; });
        });
        return count;
    };

    const countTotalMateri = (course) => {
        let count = 0;
        course.classes?.forEach(cls => { cls.branchClasses?.forEach(b => { count += b.smallBranches?.length || 0; }); });
        return count;
    };

    const inputCls = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>;

    return (
        <div className="max-w-6xl mx-auto md:p-6 mb-20">
            <div className="mb-8 px-4 md:px-0">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                    <BookOpen className="text-blue-600 dark:text-blue-400 w-8 h-8" /> Manajemen E-Learning
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Pilih tema untuk masuk ke workspace builder.</p>
            </div>

            {courses.length === 0 && (
                <div className="text-center py-16 px-4">
                    <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Belum ada tema yang dibuat.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 md:px-0">
                {courses.map(course => (
                    <div key={course.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5">
                            <h2 className="font-bold text-white text-lg leading-tight">{course.title}</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{course.type?.replace(/_/g, ' ')}</span>
                                <span className="text-xs text-blue-100">Rp {Number(course.price).toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                        <div className="p-4 flex-1">
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                                <span>📚 {course.classes?.length || 0} Kelas</span>
                                <span>📝 {countTotalMateri(course)} Materi</span>
                                <span><HelpCircle className="w-3 h-3 inline" /> {countTotalQuizzes(course)} Soal</span>
                                <span>{course.isPublished ? '✅ Published' : '📋 Draft'}</span>
                            </div>
                        </div>
                        <div className="p-4 pt-0 space-y-2">
                            <button
                                onClick={() => handleTogglePublish(course)}
                                className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-2 rounded-lg transition-colors ${course.isPublished
                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {course.isPublished ? <><Eye className="w-4 h-4" /> Published — Tampil di Katalog</> : <><EyeOff className="w-4 h-4" /> Draft — Klik untuk Publish</>}
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => navigate(`/admin/dashboard/course-workspace/${course.id}`)} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors">
                                    <Wrench className="w-4 h-4" /> Buka Workspace
                                </button>
                                <button onClick={() => openEditModal(course)} className="p-2.5 bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-500/20" title="Edit"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDeleteCourse(course.id, course.title)} className="p-2.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/20" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL EDIT COURSE LENGKAP */}
            {editModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-500" /> Edit Tema / Course</h3>
                            <button onClick={() => setEditModal({ isOpen: false, data: null })} className="p-1 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmitEdit} className="p-6 md:p-8 space-y-8">

                            {/* SECTION 1: BASIC INFO */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Informasi Dasar</h4>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Judul Kursus</label>
                                    <input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} required className={inputCls} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Singkat</label>
                                    <textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={2} className={inputCls} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                                        <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} className={inputCls}>
                                            <option value="Web Development">Web Development</option>
                                            <option value="UI/UX Design">UI/UX Design</option>
                                            <option value="Mobile Development">Mobile Development</option>
                                            <option value="Data Science">Data Science</option>
                                            <option value="DevOps">DevOps</option>
                                            <option value="Business">Business</option>
                                            <option value="Semua">Semua</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Level Kursus</label>
                                        <select value={editForm.level} onChange={e => setEditForm(p => ({ ...p, level: e.target.value }))} className={inputCls}>
                                            <option value="Semua Level">Semua Level</option>
                                            <option value="Pemula">Pemula</option>
                                            <option value="Menengah">Menengah</option>
                                            <option value="Mahir">Mahir</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: PRICING */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Harga & Akses</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipe Monetisasi</label>
                                        <select value={editForm.type} onChange={e => setEditForm(p => ({ ...p, type: e.target.value }))} className={inputCls}>
                                            {COURSE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Jual (Rp)</label>
                                        <input type="number" value={editForm.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} min={0} className={inputCls} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Harga Coret (Asli)</label>
                                        <input type="number" value={editForm.originalPrice} onChange={e => setEditForm(p => ({ ...p, originalPrice: e.target.value }))} className={inputCls} placeholder="Opsional" />
                                    </div>
                                </div>
                                <label className="flex items-center gap-3 cursor-pointer bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                    <input type="checkbox" checked={editForm.isPublished} onChange={e => setEditForm(p => ({ ...p, isPublished: e.target.checked }))} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="font-semibold text-blue-800 dark:text-blue-300">Publish di Katalog Publik</span>
                                </label>
                            </div>

                            {/* SECTION 3: MEDIA */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Media Konten</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Banner Thumbnail</label>
                                        <div className="flex gap-2">
                                            <input type="text" readOnly value={editForm.bannerUrl} className={`${inputCls} flex-1 bg-slate-50`} />
                                            <label className="cursor-pointer px-3 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                                {uploadingMedia.bannerUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleCloudinaryUpload(e, 'bannerUrl')} />
                                            </label>
                                        </div>
                                        {editForm.bannerUrl && <img src={editForm.bannerUrl} alt="Preview" className="mt-2 h-20 w-auto rounded border" />}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Promo Video URL</label>
                                        <div className="flex gap-2">
                                            <input type="text" readOnly value={editForm.promoVideoUrl} className={`${inputCls} flex-1 bg-slate-50`} />
                                            <label className="cursor-pointer px-3 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
                                                {uploadingMedia.promoVideoUrl ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                                                <input type="file" className="hidden" accept="video/*" onChange={(e) => handleCloudinaryUpload(e, 'promoVideoUrl')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 4: FULL DESC & BENEFITS */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">Deskripsi Lengkap & Manfaat</h4>

                                <div className="pb-8">
                                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Lengkap (Overview)</label>
                                    <style>{`
                                        .modal-editor .ql-toolbar.ql-snow { border-radius: 8px 8px 0 0; background: #f8fafc; }
                                        .dark .modal-editor .ql-toolbar.ql-snow { background: #1e293b; border-color: #334155; }
                                        .dark .modal-editor .ql-stroke { stroke: #cbd5e1 !important; }
                                        .dark .modal-editor .ql-fill { fill: #cbd5e1 !important; }
                                        .modal-editor .ql-container.ql-snow { border-radius: 0 0 8px 8px; font-size: 14px; }
                                        .dark .modal-editor .ql-container.ql-snow { border-color: #334155; }
                                        .modal-editor .ql-editor { min-height: 150px; background: white; }
                                        .dark .modal-editor .ql-editor { background: #0f172a; color: #f1f5f9; }
                                    `}</style>
                                    <div className="modal-editor border border-slate-300 dark:border-slate-600 rounded-lg">
                                        <ReactQuill theme="snow" value={editForm.fullDescription} onChange={(val) => setEditForm({ ...editForm, fullDescription: val })} modules={quillModules} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Benefit (What you will master)</label>
                                        <div className="space-y-2">
                                            {editForm.benefits.map((benefit, index) => (
                                                <div key={index} className="flex gap-2">
                                                    <input type="text" value={benefit} onChange={e => handleBenefitChange(index, e.target.value)} className={inputCls} placeholder={`Benefit ${index + 1}...`} />
                                                    {editForm.benefits.length > 1 && (
                                                        <button type="button" onClick={() => handleRemoveBenefit(index)} className="px-3 bg-red-100 text-red-600 rounded-lg font-bold">X</button>
                                                    )}
                                                </div>
                                            ))}
                                            <button type="button" onClick={handleAddBenefit} className="text-sm font-semibold text-blue-600 hover:text-blue-700">+ Tambah Benefit</button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Estimasi Jam Belajar</label>
                                        <input type="number" value={editForm.estimatedHours} onChange={e => setEditForm(p => ({ ...p, estimatedHours: e.target.value }))} className={inputCls} placeholder="Cth: 12" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={() => setEditModal({ isOpen: false, data: null })} className="w-1/3 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">Batal</button>
                                <button type="submit" className="w-2/3 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}