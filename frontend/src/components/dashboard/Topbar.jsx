import { useState, useEffect, useRef } from 'react';
import { Menu, Search, Filter, Bell, MessageSquare, ChevronDown, CheckCircle2, AlertCircle, TrendingUp, X, Loader2, CalendarDays, Check, CheckCheck, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import axiosInstance from '../../api/axiosInstance';


export default function Topbar({ onMenuClick }) {
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();

    const [searchQuery, setSearchQuery] = useState('');
    const handleSearchSubmit = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/dashboard/pesanan?search=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotif, setShowNotif] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowNotif(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await axiosInstance.get('/notifications');
            if (res.data.success) { setNotifications(res.data.data); setUnreadCount(res.data.unreadCount); }
        } catch (error) { console.error("Gagal mendapatkan notifikasi:", error); }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await axiosInstance.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) { console.error("Gagal tandai dibaca:", error); }
    };

    const markAllAsRead = async () => {
        try {
            await axiosInstance.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) { console.error("Gagal tandai semua dibaca:", error); }
    };

    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    const headerBg = isDark ? 'bg-slate-950/80' : 'bg-white/80';
    const borderColor = isDark ? 'border-slate-800/60' : 'border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

    return (
        <header className={`h-[76px] border-b ${borderColor} ${headerBg} backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10`}>
            <div className="flex items-center gap-4 flex-1">
                <button onClick={onMenuClick} className={`p-2 -ml-2 rounded-lg lg:hidden ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}>
                    <Menu className="w-5 h-5" />
                </button>
                <div className={`hidden md:flex items-center gap-3 px-4 py-2 border rounded-xl w-80 lg:w-[400px] transition-all duration-300 ${isDark ? 'bg-slate-900/50 border-slate-800 focus-within:border-blue-500/50 focus-within:bg-slate-900/80' : 'bg-gray-100 border-gray-200 focus-within:border-blue-500/50 focus-within:bg-white'}`}>
                    <Search className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchSubmit}
                        placeholder="Cari tugas, pesanan... (Tekan Enter)"
                        className={`bg-transparent border-none outline-none text-sm w-full font-medium ${isDark ? 'placeholder:text-slate-500 text-slate-200' : 'placeholder:text-gray-400 text-gray-900'}`}
                    />
                    <div className="flex items-center gap-1 shrink-0">
                        <kbd className={`hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded ${isDark ? 'text-slate-500 bg-slate-800 border border-slate-700' : 'text-gray-400 bg-gray-200 border border-gray-300'}`}>⌘</kbd>
                        <kbd className={`hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded ${isDark ? 'text-slate-500 bg-slate-800 border border-slate-700' : 'text-gray-400 bg-gray-200 border border-gray-300'}`}>K</kbd>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border ${isDark ? 'border-slate-800/60 bg-slate-900/30' : 'border-gray-200 bg-gray-100'}`}>
                    <CalendarDays className="w-4 h-4 text-blue-500" />
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Today, {today}</span>
                </div>

                <div className={`w-px h-6 hidden sm:block ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}></div>

                {/* Theme Toggle */}
                <button onClick={toggleTheme} className={`p-2.5 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-yellow-400' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-900'} transition-all`}>
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notification */}
                <div className="relative" ref={dropdownRef}>
                    <motion.button onClick={() => setShowNotif(!showNotif)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={`relative p-2.5 rounded-xl border border-transparent ${isDark ? 'hover:border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-blue-400' : 'hover:border-gray-200 hover:bg-gray-100 text-gray-500 hover:text-blue-600'} transition-all`}
                    >
                        <Bell className="w-5 h-5" />
                        {unreadCount > 0 && (
                            <span className={`absolute top-2 right-2 flex items-center justify-center min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 ${isDark ? 'border-slate-950' : 'border-white'} px-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]`}>
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showNotif && (
                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
                                className={`absolute right-0 mt-3 w-80 sm:w-96 backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden z-50 ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-gray-200'}`}
                            >
                                <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50'}`}>
                                    <h3 className={`text-sm font-bold flex items-center gap-2 ${textPrimary}`}>
                                        Notifikasi
                                        {unreadCount > 0 && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 rounded-md text-[10px]">{unreadCount} Baru</span>}
                                    </h3>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-[11px] font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                                            <CheckCheck className="w-3 h-3" /> Tandai Semua Dibaca
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[350px] overflow-y-auto no-scrollbar pb-2">
                                    {notifications.length > 0 ? notifications.map(notif => (
                                        <div key={notif.id} onClick={() => !notif.is_read && markAsRead(notif.id)}
                                            className={`p-4 border-b transition-colors cursor-pointer flex gap-3 ${isDark ? 'border-slate-800/50 hover:bg-slate-800/50' : 'border-gray-100 hover:bg-gray-50'} ${!notif.is_read ? (isDark ? 'bg-slate-800/20' : 'bg-blue-50/50') : ''}`}
                                        >
                                            {!notif.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                                            {notif.is_read && <div className="w-2 shrink-0"></div>}
                                            <div>
                                                <p className={`text-sm ${!notif.is_read ? `font-bold ${textPrimary}` : `font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}`}>{notif.title}</p>
                                                <p className={`text-xs mt-1 leading-relaxed line-clamp-2 ${textSecondary}`}>{notif.message}</p>
                                                <p className={`text-[10px] mt-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>
                                                    {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className={`p-8 text-center text-sm ${textSecondary}`}>
                                            <Bell className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-slate-700' : 'text-gray-300'}`} />
                                            Belum ada notifikasi
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}