import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowLeft, Save, Loader2, FileText, Check } from 'lucide-react';

const quillModules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ font: [] }],
        [{ size: ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
    ]
};

export default function EditMateri() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', orderIndex: 1 });

    useEffect(() => {
        const fetchMateri = async () => {
            try {
                const res = await axiosInstance.get(`/ideafast/smallbranch/${id}`);
                if (res.data.success) {
                    setForm({
                        title: res.data.data.title,
                        content: res.data.data.content,
                        orderIndex: res.data.data.orderIndex
                    });
                }
            } catch (error) {
                alert('Gagal narik data materi!');
            } finally {
                setLoading(false);
            }
        };
        fetchMateri();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axiosInstance.put(`/ideafast/smallbranch/${id}`, form);
            if (res.data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 2000);
            }
        } catch (error) {
            alert('Gagal menyimpan!');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-10 h-10 text-blue-500" /></div>;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* STICKY HEADER BAR */}
            <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-3">
                <form onSubmit={handleUpdate} className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button type="button" onClick={() => navigate(-1)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </button>
                        <FileText className="w-5 h-5 text-purple-500" />
                    </div>

                    <input
                        type="text"
                        required
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="Judul Materi..."
                        className="flex-1 text-lg font-bold bg-transparent border-0 border-b-2 border-transparent focus:border-purple-500 text-slate-800 dark:text-white px-1 py-1 outline-none transition-colors placeholder:text-slate-400"
                    />

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-500 dark:text-slate-400">Urutan:</label>
                            <input
                                type="number"
                                required
                                min={1}
                                value={form.orderIndex}
                                onChange={e => setForm({ ...form, orderIndex: e.target.value })}
                                className="w-16 text-center text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                                saved
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/20'
                            }`}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" />
                                : saved ? <><Check className="w-4 h-4" /> Tersimpan!</>
                                : <><Save className="w-4 h-4" /> Simpan</>
                            }
                        </button>
                    </div>
                </form>
            </div>

            {/* FULL-WIDTH EDITOR */}
            <div className="flex-1 overflow-hidden">
                <style>{`
                    .materi-editor .ql-toolbar.ql-snow {
                        border: none !important;
                        border-bottom: 1px solid #e2e8f0 !important;
                        background: #f8fafc;
                        padding: 10px 20px !important;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                    }
                    .dark .materi-editor .ql-toolbar.ql-snow {
                        background: #0f172a !important;
                        border-bottom: 1px solid #334155 !important;
                    }
                    .dark .materi-editor .ql-toolbar .ql-stroke { stroke: #94a3b8 !important; }
                    .dark .materi-editor .ql-toolbar .ql-fill { fill: #94a3b8 !important; }
                    .dark .materi-editor .ql-toolbar .ql-picker-label { color: #94a3b8 !important; }
                    .materi-editor .ql-container.ql-snow {
                        border: none !important;
                        font-size: 16px;
                        line-height: 1.8;
                    }
                    .materi-editor .ql-editor {
                        padding: 32px 48px !important;
                        min-height: calc(100vh - 180px);
                        max-width: 900px;
                        margin: 0 auto;
                        background: white;
                    }
                    .dark .materi-editor .ql-editor {
                        background: #1e293b !important;
                        color: #e2e8f0 !important;
                    }
                    .materi-editor .ql-editor h1 { font-size: 2em; font-weight: 700; margin-bottom: 0.5em; }
                    .materi-editor .ql-editor h2 { font-size: 1.5em; font-weight: 700; margin-bottom: 0.4em; }
                    .materi-editor .ql-editor h3 { font-size: 1.25em; font-weight: 600; margin-bottom: 0.3em; }
                    .materi-editor .ql-editor p { margin-bottom: 0.8em; }
                    .materi-editor .ql-editor blockquote {
                        border-left: 4px solid #8b5cf6;
                        padding-left: 16px;
                        color: #64748b;
                        font-style: italic;
                    }
                    .materi-editor .ql-editor pre.ql-syntax {
                        background: #1e293b;
                        color: #e2e8f0;
                        border-radius: 8px;
                        padding: 16px;
                        font-size: 14px;
                        overflow-x: auto;
                    }
                    .materi-editor .ql-editor img {
                        max-width: 100%;
                        border-radius: 8px;
                        margin: 16px 0;
                    }
                    .materi-editor .ql-snow .ql-tooltip {
                        z-index: 100;
                    }
                `}</style>
                <div className="materi-editor h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                    <ReactQuill
                        theme="snow"
                        value={form.content}
                        onChange={(val) => setForm({ ...form, content: val })}
                        modules={quillModules}
                        placeholder="Mulai menulis materi di sini..."
                    />
                </div>
            </div>
        </div>
    );
}