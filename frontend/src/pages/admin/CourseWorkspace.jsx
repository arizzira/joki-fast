import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import axios from 'axios';
import {
    ChevronRight, ChevronDown, Edit, Trash2, Plus, Loader2,
    BookOpen, Layers, GitBranch, FileText, HelpCircle,
    ArrowLeft, Sparkles, GraduationCap, X, PenTool, CheckCircle2, Circle, Image as ImageIcon
} from 'lucide-react';

export default function CourseWorkspace() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});
    const [generatingQuiz, setGeneratingQuiz] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Edit Modal
    const [editModal, setEditModal] = useState({ isOpen: false, level: null, data: null });
    const [editForm, setEditForm] = useState({});

    // Manual Quiz Modal (Modern UI)
    const [quizModal, setQuizModal] = useState({ isOpen: false, level: null, parentId: null });
    const [quizForm, setQuizForm] = useState({
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        imageUrl: '' // Tambahan state buat gambar
    });
    const [quizCount, setQuizCount] = useState(0);
    const [savingQuiz, setSavingQuiz] = useState(false);

    useEffect(() => { fetchWorkspace(); }, [courseId]);

    const fetchWorkspace = async () => {
        try {
            const res = await axiosInstance.get(`/ideafast/workspace/${courseId}`);
            if (res.data.success) setCourse(res.data.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    // ==================== DELETE ====================
    const handleDelete = async (level, id, label) => {
        if (!window.confirm(`Yakin hapus "${label}"? Semua data di bawahnya ikut terhapus!`)) return;
        const ep = { class: `/ideafast/class/${id}`, branch: `/ideafast/branch/${id}`, smallbranch: `/ideafast/smallbranch/${id}`, quiz: `/ideafast/quiz/${id}` };
        try { await axiosInstance.delete(ep[level]); await fetchWorkspace(); }
        catch { alert('Gagal menghapus.'); }
    };

    // ==================== EDIT ====================
    const openEditModal = (level, data) => {
        if (level === 'class') setEditForm({ title: data.title, description: data.description || '', orderIndex: data.orderIndex, isPremium: data.isPremium });
        else if (level === 'branch') setEditForm({ title: data.title, orderIndex: data.orderIndex });
        else if (level === 'quiz') setEditForm({ question: data.question, optionA: data.optionA, optionB: data.optionB, optionC: data.optionC, optionD: data.optionD, correctAnswer: data.correctAnswer, imageUrl: data.imageUrl || '' });
        setEditModal({ isOpen: true, level, data });
    };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        const { level, data } = editModal;
        const ep = { class: `/ideafast/class/${data.id}`, branch: `/ideafast/branch/${data.id}`, quiz: `/ideafast/quiz/${data.id}` };
        const body = (level === 'class' || level === 'branch') ? { ...editForm, orderIndex: Number(editForm.orderIndex) } : editForm;
        try { await axiosInstance.put(ep[level], body); setEditModal({ isOpen: false, level: null, data: null }); await fetchWorkspace(); }
        catch { alert('Gagal update.'); }
    };

    // ==================== ADD CHILD ====================
    const handleAdd = async (level, parentId, count) => {
        const label = { course: 'Kelas (Class) baru', class: 'Cabang (Branch) baru' };
        const title = window.prompt(`Masukkan judul ${label[level]}:`);
        if (!title?.trim()) return;
        const ep = { course: '/ideafast/class/create', class: '/ideafast/branch/create' };
        const body = level === 'course'
            ? { courseId: parentId, title: title.trim(), description: '-', orderIndex: count + 1, isPremium: false }
            : { classId: parentId, title: title.trim(), orderIndex: count + 1 };
        try { await axiosInstance.post(ep[level], body); setExpanded(p => ({ ...p, [parentId]: true })); await fetchWorkspace(); }
        catch { alert('Gagal menambahkan.'); }
    };

    // ==================== ADD SMALLBRANCH ====================
    const handleAddSmallBranch = async (branchId, existingCount) => {
        const title = window.prompt('Masukkan judul Materi baru:');
        if (!title?.trim()) return;
        try {
            await axiosInstance.post('/ideafast/smallbranch/create', {
                branchClassId: branchId,
                title: title.trim(),
                content: '<p>Tulis konten materi di sini...</p>',
                orderIndex: existingCount + 1
            });
            setExpanded(p => ({ ...p, [branchId]: true }));
            await fetchWorkspace();
        } catch { alert('Gagal menambahkan materi.'); }
    };

    // ==================== GENERATE QUIZ AI ====================
    const handleGenerateClassQuiz = async (classId) => {
        if (!window.confirm('Generate 5 soal evaluasi bab dengan AI?')) return;
        setGeneratingQuiz(`class-${classId}`);
        try { await axiosInstance.post('/ideafast/class/generate-quiz', { classId }); await fetchWorkspace(); alert('✅ 5 Soal Evaluasi Bab berhasil!'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal generate quiz.'); }
        finally { setGeneratingQuiz(null); }
    };

    const handleGenerateCourseQuiz = async () => {
        if (!window.confirm('Generate 5 soal ujian akhir dengan AI?')) return;
        setGeneratingQuiz('course');
        try { await axiosInstance.post('/ideafast/course/generate-quiz', { courseId }); await fetchWorkspace(); alert('✅ 5 Soal Ujian Akhir berhasil!'); }
        catch (err) { alert(err.response?.data?.message || 'Gagal generate quiz.'); }
        finally { setGeneratingQuiz(null); }
    };

    // ==================== UPLOAD GAMBAR CLOUDINARY ====================
    const handleQuizImageUpload = async (e, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            // Ganti preset dan API URL ini sesuai dengan akun Cloudinary lu kalau beda
            formData.append('upload_preset', 'jokifast_unsigned');
            const res = await axios.post(`https://api.cloudinary.com/v1_1/dncj5irc9/auto/upload`, formData);

            if (isEdit) {
                setEditForm(p => ({ ...p, imageUrl: res.data.secure_url }));
            } else {
                setQuizForm(p => ({ ...p, imageUrl: res.data.secure_url }));
            }
        } catch (error) {
            alert("Gagal mengupload gambar. Pastikan ukuran file sesuai.");
        } finally {
            setUploadingImage(false);
            e.target.value = null; // Reset input
        }
    };

    // ==================== MANUAL QUIZ (Modern UI) ====================
    const openQuizModal = (level, parentId) => {
        setQuizForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageUrl: '' });
        setQuizCount(0);
        setQuizModal({ isOpen: true, level, parentId });
    };

    const handleSubmitManualQuiz = async (e, keepOpen = false) => {
        e.preventDefault();
        setSavingQuiz(true);
        const payload = { ...quizForm };
        if (quizModal.level === 'class') payload.classId = quizModal.parentId;
        else if (quizModal.level === 'course') payload.courseId = quizModal.parentId;
        try {
            await axiosInstance.post('/ideafast/quiz/create', payload);
            setQuizCount(prev => prev + 1);
            await fetchWorkspace();
            if (keepOpen) {
                setQuizForm({ question: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: 'A', imageUrl: '' });
            } else {
                setQuizModal({ isOpen: false, level: null, parentId: null });
            }
        } catch { alert('Gagal menyimpan soal.'); }
        finally { setSavingQuiz(false); }
    };

    const closeQuizModal = () => {
        setQuizModal({ isOpen: false, level: null, parentId: null });
        setQuizCount(0);
    };

    if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>;
    if (!course) return <div className="text-center py-16 text-slate-500">Course tidak ditemukan.</div>;

    const inputCls = "w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent";

    return (
        <div className="max-w-6xl mx-auto md:p-6 mb-20 font-sans">
            {/* HEADER */}
            <div className="mb-6 px-4 md:px-0">
                <button onClick={() => navigate('/admin/dashboard/elearning-detail')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Tema
                </button>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-3">
                            <BookOpen className="text-blue-600 dark:text-blue-400 w-8 h-8" /> {course.title}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{course.type} • Rp {Number(course.price).toLocaleString('id-ID')} • {course.quizzes?.length || 0} soal ujian akhir</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleAdd('course', courseId, course.classes.length)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            <Plus className="w-4 h-4" /> Tambah Kelas
                        </button>
                        <button onClick={() => openQuizModal('course', courseId)} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                            <PenTool className="w-4 h-4" /> Buat Ujian Akhir
                        </button>
                    </div>
                </div>
            </div>

            {/* TREE */}
            <div className="space-y-3 px-4 md:px-0">
                {course.classes.length === 0 && (
                    <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Belum ada kelas. Klik "Tambah Kelas" untuk mulai.</p>
                    </div>
                )}

                {course.classes.map(cls => (
                    <div key={cls.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* CLASS */}
                        <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleExpand(cls.id)}>
                                {expanded[cls.id] ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                <Layers className="w-5 h-5 text-emerald-500" />
                                <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-200">Bab {cls.orderIndex}: {cls.title}</span>
                                    <div className="flex gap-3 mt-0.5 text-xs text-slate-400">
                                        <span>{cls.branchClasses?.length || 0} cabang</span>
                                        <span>{cls.quizzes?.length || 0} soal evaluasi</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={() => handleAdd('class', cls.id, cls.branchClasses.length)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg" title="Tambah Cabang"><Plus className="w-4 h-4" /></button>
                                <button onClick={() => openQuizModal('class', cls.id)} className="p-2 text-emerald-500 hover:bg-emerald-100 rounded-lg" title="Tambah Evaluasi Bab"><PenTool className="w-4 h-4" /></button>
                                <button onClick={() => handleGenerateClassQuiz(cls.id)} disabled={generatingQuiz === `class-${cls.id}`} className="p-2 text-purple-500 hover:bg-purple-100 rounded-lg disabled:opacity-50" title="Generate Quiz AI">
                                    {generatingQuiz === `class-${cls.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                </button>
                                <button onClick={() => openEditModal('class', cls)} className="p-2 text-amber-500 hover:bg-amber-100 rounded-lg"><Edit className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete('class', cls.id, cls.title)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        {expanded[cls.id] && (
                            <div className="border-t border-slate-200 dark:border-slate-700">
                                {/* CLASS QUIZZES */}
                                {cls.quizzes?.length > 0 && (
                                    <div className="px-4 py-3 bg-purple-50 dark:bg-purple-950/20 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1"><HelpCircle className="w-3.5 h-3.5" /> Soal Evaluasi Bab ({cls.quizzes.length})</p>
                                        <div className="space-y-1">
                                            {cls.quizzes.map((quiz, qIdx) => (
                                                <div key={quiz.id} className="flex justify-between items-center p-2 hover:bg-purple-100 dark:hover:bg-purple-950/40 rounded-lg group transition-colors">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs text-slate-600 dark:text-slate-400">{qIdx + 1}. {quiz.question.length > 60 ? quiz.question.substring(0, 60) + '...' : quiz.question}</span>
                                                        {quiz.imageUrl && <span className="text-[10px] text-blue-500 flex items-center gap-1 mt-0.5"><ImageIcon className="w-3 h-3" /> Berisi Gambar</span>}
                                                    </div>
                                                    <div className="hidden group-hover:flex gap-1">
                                                        <button onClick={() => openEditModal('quiz', quiz)} className="text-slate-400 hover:text-amber-500 p-1"><Edit className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => handleDelete('quiz', quiz.id, `Soal ${qIdx + 1}`)} className="text-slate-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* BRANCHES */}
                                {cls.branchClasses.length === 0 && <p className="p-4 pl-12 text-sm text-slate-500 text-center">Belum ada cabang.</p>}
                                {cls.branchClasses.map(branch => (
                                    <div key={branch.id}>
                                        <div className="p-3 pl-12 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50">
                                            <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleExpand(branch.id)}>
                                                {expanded[branch.id] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                <GitBranch className="w-4 h-4 text-amber-500" />
                                                <div>
                                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{branch.orderIndex}. {branch.title}</span>
                                                    <span className="text-xs text-slate-400 ml-2">({branch.smallBranches?.length || 0} materi)</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleAddSmallBranch(branch.id, branch.smallBranches?.length || 0)} className="p-1 text-blue-400 hover:text-blue-600"><Plus className="w-4 h-4" /></button>
                                                <button onClick={() => openEditModal('branch', branch)} className="p-1 text-slate-400 hover:text-amber-500"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDelete('branch', branch.id, branch.title)} className="p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        {/* SMALLBRANCH (MATERI) */}
                                        {expanded[branch.id] && (
                                            <div className="pl-20 pr-4 py-2 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 space-y-1">
                                                {branch.smallBranches.map(sb => (
                                                    <div key={sb.id} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-lg group">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                            <FileText className="w-3.5 h-3.5 text-indigo-500" /> {sb.orderIndex}. {sb.title}
                                                        </div>
                                                        <div className="hidden group-hover:flex gap-1">
                                                            <button onClick={() => navigate(`/admin/dashboard/edit-materi/${sb.id}`)} className="text-slate-400 hover:text-amber-500"><Edit className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleDelete('smallbranch', sb.id, sb.title)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => handleAddSmallBranch(branch.id, branch.smallBranches?.length || 0)}
                                                    className="w-full flex items-center justify-center gap-2 p-2 mt-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-400 hover:text-indigo-500 hover:border-indigo-400 transition-colors"
                                                >
                                                    <Plus className="w-3.5 h-3.5" /> Tambah Materi
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* UJIAN AKHIR COURSE */}
            {course.quizzes?.length > 0 && (
                <div className="mt-8 px-4 md:px-0">
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 rounded-2xl border border-purple-200 dark:border-purple-800/50 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-5">
                            <GraduationCap className="w-6 h-6" /> Ujian Akhir Kelulusan ({course.quizzes.length} soal)
                        </h2>
                        <div className="space-y-2">
                            {course.quizzes.map((quiz, qIdx) => (
                                <div key={quiz.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-800 rounded-xl hover:shadow-md transition-all group border border-transparent hover:border-purple-200 dark:hover:border-purple-700/50">
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-xl flex items-center justify-center text-xs font-bold shrink-0">{qIdx + 1}</span>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{quiz.question.length > 80 ? quiz.question.substring(0, 80) + '...' : quiz.question}</span>
                                            {quiz.imageUrl && <span className="text-[10px] text-blue-500 flex items-center gap-1 mt-0.5"><ImageIcon className="w-3 h-3" /> Berisi Gambar</span>}
                                        </div>
                                    </div>
                                    <div className="hidden group-hover:flex gap-1 shrink-0">
                                        <button onClick={() => openEditModal('quiz', quiz)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete('quiz', quiz.id, `Ujian ${qIdx + 1}`)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}


            {/* =========== MODAL: EDIT CLASS/BRANCH/QUIZ =========== */}
            {editModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                Edit {editModal.level === 'class' ? 'Kelas' : editModal.level === 'branch' ? 'Cabang' : 'Soal Quiz'}
                            </h3>
                            <button onClick={() => setEditModal({ isOpen: false, level: null, data: null })} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmitEdit} className="p-5 space-y-4">
                            {editModal.level === 'class' && <>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Judul Kelas</label><input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} required className={inputCls} /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Urutan</label><input type="number" value={editForm.orderIndex} onChange={e => setEditForm(p => ({ ...p, orderIndex: e.target.value }))} min={1} className={inputCls} /></div>
                            </>}
                            {editModal.level === 'branch' && <>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Judul Cabang</label><input type="text" value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} required className={inputCls} /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Urutan</label><input type="number" value={editForm.orderIndex} onChange={e => setEditForm(p => ({ ...p, orderIndex: e.target.value }))} min={1} className={inputCls} /></div>
                            </>}
                            {editModal.level === 'quiz' && <>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Pertanyaan</label><textarea value={editForm.question} onChange={e => setEditForm(p => ({ ...p, question: e.target.value }))} rows={3} required className={inputCls} /></div>

                                {/* Tombol Edit Gambar */}
                                <div>
                                    <label className="flex items-center justify-center gap-2 cursor-pointer w-full py-2 bg-slate-50 border border-slate-300 border-dashed rounded-lg text-sm text-slate-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                                        {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                                        {uploadingImage ? "Mengupload..." : "Ubah / Tambah Gambar Soal"}
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQuizImageUpload(e, true)} />
                                    </label>
                                    {editForm.imageUrl && (
                                        <div className="relative mt-2 w-fit mx-auto">
                                            <img src={editForm.imageUrl} alt="Preview" className="max-h-24 rounded border shadow-sm" />
                                            <button type="button" onClick={() => setEditForm(p => ({ ...p, imageUrl: '' }))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3 mt-2">
                                    {['A', 'B', 'C', 'D'].map(l => (<div key={l}><label className="block text-sm font-medium text-slate-700 mb-1">Opsi {l}</label><input type="text" value={editForm[`option${l}`]} onChange={e => setEditForm(p => ({ ...p, [`option${l}`]: e.target.value }))} required className={inputCls} /></div>))}
                                </div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Jawaban Benar</label><select value={editForm.correctAnswer} onChange={e => setEditForm(p => ({ ...p, correctAnswer: e.target.value }))} className={inputCls}>{['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                            </>}
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setEditModal({ isOpen: false, level: null, data: null })} className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm hover:bg-slate-50">Batal</button>
                                <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">Simpan Perubahan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* =========== MODAL: TAMBAH SOAL MANUAL (MODERN UI DICODING STYLE) =========== */}
            {quizModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto py-10">
                    <div className="bg-[#f8fafc] dark:bg-slate-950 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-[fadeUp_0.3s_ease_out]">

                        {/* Header Modern */}
                        <div className="flex items-center justify-between px-6 py-5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                    <PenTool className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                                        Pembuat Soal Kuis
                                    </h3>
                                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
                                        {quizModal.level === 'course' ? 'Ujian Akhir Kelulusan' : 'Evaluasi Pemahaman Bab'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {quizCount > 0 && (
                                    <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {quizCount} Tersimpan
                                    </span>
                                )}
                                <button onClick={closeQuizModal} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={(e) => handleSubmitManualQuiz(e, false)} className="p-6 sm:p-8">

                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Kiri: Input Pertanyaan */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-black flex items-center justify-center">Q</span>
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tuliskan Pertanyaan</label>
                                    </div>
                                    <textarea
                                        value={quizForm.question}
                                        onChange={e => setQuizForm(p => ({ ...p, question: e.target.value }))}
                                        rows={5}
                                        required
                                        placeholder="Contoh: Manakah dari berikut ini yang merupakan keunggulan utama menggunakan React Hooks?"
                                        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white p-5 text-base focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm placeholder:text-slate-400"
                                    />

                                    {/* 👇 TOMBOL UPLOAD GAMBAR BARU 👇 */}
                                    <div>
                                        <label className="flex items-center justify-center gap-2 cursor-pointer w-full px-4 py-3 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-500 hover:text-indigo-600 text-sm font-bold rounded-2xl transition-all hover:border-indigo-300">
                                            {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                                            {uploadingImage ? "Sedang Mengunggah Gambar..." : "Sisipkan Gambar Pelengkap (Opsional)"}
                                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQuizImageUpload(e, false)} />
                                        </label>

                                        {/* Preview Gambar */}
                                        {quizForm.imageUrl && (
                                            <div className="relative mt-3 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                                                <img src={quizForm.imageUrl} alt="Preview Soal" className="max-h-40 rounded-lg object-contain" />
                                                <button
                                                    type="button"
                                                    onClick={() => setQuizForm(p => ({ ...p, imageUrl: '' }))}
                                                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 shadow-md hover:bg-rose-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex items-start gap-3 mt-2">
                                        <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                                        <p className="text-xs font-medium text-blue-800 dark:text-blue-300 leading-relaxed">
                                            Tips: Buatlah pertanyaan yang jelas dan tidak ambigu. Hindari penggunaan kalimat negatif ganda agar siswa mudah memahami maksud soal.
                                        </p>
                                    </div>
                                </div>

                                {/* Kanan: Input Pilihan Ganda & Radio Button */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-md bg-emerald-500 text-white text-xs font-black flex items-center justify-center">A</span>
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Pilihan Jawaban & Kunci</label>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-4 font-medium">Klik pada bulatan huruf untuk mengatur Jawaban Benar.</p>

                                    <div className="space-y-3">
                                        {['A', 'B', 'C', 'D'].map(l => {
                                            const isCorrect = quizForm.correctAnswer === l;
                                            return (
                                                <div
                                                    key={l}
                                                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all bg-white dark:bg-slate-900 ${isCorrect ? 'border-emerald-500 shadow-sm shadow-emerald-500/10' : 'border-slate-200 dark:border-slate-700 focus-within:border-indigo-400'
                                                        }`}
                                                >
                                                    {/* Radio Button Pilihan Benar */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setQuizForm(p => ({ ...p, correctAnswer: l }))}
                                                        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm transition-all ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'
                                                            }`}
                                                        title="Jadikan Jawaban Benar"
                                                    >
                                                        {l}
                                                    </button>

                                                    {/* Input Text Pilihan */}
                                                    <input
                                                        type="text"
                                                        value={quizForm[`option${l}`]}
                                                        onChange={e => setQuizForm(p => ({ ...p, [`option${l}`]: e.target.value }))}
                                                        required
                                                        placeholder={`Teks pilihan ${l}...`}
                                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder:text-slate-400 p-0"
                                                    />

                                                    {/* Indikator Benar */}
                                                    {isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-2 shrink-0 animate-[fadeUp_0.2s_ease_out]" />}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action Modal */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 pt-8 mt-6 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={closeQuizModal}
                                    className="w-full sm:w-auto py-3.5 px-6 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {quizCount > 0 ? 'Tutup Modal' : 'Batal'}
                                </button>
                                <div className="flex-1 w-full flex flex-col sm:flex-row gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmitManualQuiz(e, true)}
                                        disabled={savingQuiz || !quizForm.question || !quizForm.optionA || !quizForm.optionB || !quizForm.optionC || !quizForm.optionD}
                                        className="py-3.5 px-6 rounded-xl bg-white dark:bg-slate-800 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/30 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        {savingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Simpan & Buat Soal Lain
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingQuiz || !quizForm.question || !quizForm.optionA || !quizForm.optionB || !quizForm.optionC || !quizForm.optionD}
                                        className="py-3.5 px-8 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 disabled:opacity-50 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        Simpan & Selesai
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}