import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { Link } from 'react-router-dom';
import { MessageSquare, Clock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';


export default function ChatGlobal() {
    const { isDark } = useTheme();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await axiosInstance.get('/chat/rooms');
                if (res.data.success) {
                    setRooms(res.data.data);
                }
            } catch (error) {
                console.error("Gagal load chat rooms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();

        // Polling setiap 10 detik untuk update unread & last message
        const interval = setInterval(fetchRooms, 10000);
        return () => clearInterval(interval);
    }, []);

    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const cardBg = isDark ? 'bg-slate-900/60 border-slate-800/60' : 'bg-white border-gray-200';
    const hoverBg = isDark ? 'hover:bg-slate-800/80 hover:border-slate-700' : 'hover:bg-blue-50 hover:border-blue-200';

    if (loading) return <div className="flex-1 flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>;

    const activeRooms = rooms.filter(r => r.status_pengerjaan !== 'WAITING_WORKER' && r.status_pengerjaan !== 'CANCELLED');

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h1 className={`text-2xl font-bold ${textPrimary}`}>Percakapan Aktif</h1>
                    <p className={`text-sm ${textSecondary}`}>Pantau dan balas pesan dari worker untuk tugas Anda yang sedang berjalan.</p>
                </div>
            </div>

            {activeRooms.length === 0 ? (
                <div className={`text-center py-20 px-6 border rounded-3xl border-dashed ${isDark ? 'border-slate-800 bg-slate-900/30' : 'border-gray-300 bg-gray-50'}`}>
                    <MessageSquare className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-gray-400'}`} />
                    <h3 className={`text-lg font-bold mb-2 ${textPrimary}`}>Belum Ada Pesan</h3>
                    <p className={`text-sm ${textSecondary} max-w-sm mx-auto`}>Anda belum memiliki pesanan aktif yang mencapai tahap negosiasi atau pengerjaan.</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {activeRooms.map((room, index) => (
                        <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                            <Link to={`/dashboard/nego/${room.id}`}
                                className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl border transition-all duration-300 group overflow-hidden ${cardBg} ${hoverBg}`}
                            >
                                <div className="flex-1 min-w-0 w-full overflow-hidden">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold truncate text-base ${textPrimary} group-hover:text-blue-500 transition-colors`}>{room.judul_tugas}</h3>
                                        <div className="flex items-center gap-2 shrink-0 ml-2">
                                            {room.last_message && (
                                                <span className={`text-[10px] ${textSecondary}`}>
                                                    {new Date(room.last_message.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p className={`text-sm mb-3 flex items-center gap-1.5 ${textSecondary}`}>
                                        <User className="w-4 h-4 shrink-0" /> <span className="truncate">Worker: <span className="font-medium text-blue-500">{room.other_party_name}</span></span>
                                    </p>

                                    <div className={`text-sm truncate w-full ${room.unread_count > 0 ? (isDark ? 'text-white font-bold' : 'text-gray-900 font-bold') : textSecondary}`}>
                                        {room.last_message ? (
                                            <span>
                                                {room.last_message.senderId === localStorage.getItem('jokifast_user') ? 'Anda: ' : ''}
                                                {room.last_message.text}
                                            </span>
                                        ) : (
                                            <span className="italic opacity-60">Belum ada pesan...</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-col sm:items-end gap-3 shrink-0 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-700/50">
                                    <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border ${isDark ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                        {room.status_pengerjaan.replace('_', ' ')}
                                    </span>

                                    <div className="flex items-center gap-3">
                                        {room.unread_count > 0 && (
                                            <span className="flex items-center justify-center min-w-[24px] h-[24px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold leading-none animate-pulse">
                                                {room.unread_count > 9 ? '9+' : room.unread_count}
                                            </span>
                                        )}
                                        <div className={`p-2 rounded-xl hidden sm:flex transition-colors ${isDark ? 'bg-slate-800 text-slate-400 group-hover:bg-blue-500 group-hover:text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
