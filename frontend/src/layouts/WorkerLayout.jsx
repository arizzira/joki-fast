import { useState, useEffect, useMemo, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, ClipboardList, Wallet, User, LogOut, Menu, X, Bell,
    HelpCircle, Sun, Moon, Check, CheckCheck, ChevronsLeft, ChevronsRight, MessageSquare,
    Clock, XCircle, Loader2 // 👇 Ikon baru buat blocker
} from 'lucide-react';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios'; // 👇 Import axios buat ngecek user

import WorkerOnboarding from '../pages/carrier/WorkerOnboarding';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function WorkerDashboard() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    // --- USER VERIFICATION STATE ---
    const [user, setUser] = useState(null);
    const [userLoading, setUserLoading] = useState(true);

    // --- NOTIFICATIONS ---
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotif, setShowNotif] = useState(false);
    const dropdownRef = useRef(null);

    // Chat unread count
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    // ==========================================================
    // 1. CEK STATUS WORKER SECARA FRESH DARI DATABASE
    // ==========================================================
    useEffect(() => {
        const fetchFreshUserData = async () => {
            const token = localStorage.getItem('jokifast_token');
            if (!token) {
                navigate('/carrier/login');
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    setUser(res.data.user);
                    localStorage.setItem('jokifast_user', JSON.stringify(res.data.user));
                }
            } catch (error) {
                console.error("Gagal verifikasi user:", error);
            } finally {
                setUserLoading(false);
            }
        };

        fetchFreshUserData();
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowNotif(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('jokifast_token');
            if (!token) return;
            const res = await fetch(`${API_URL}/api/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await res.json();
            if (result.success) {
                setNotifications(result.data);
                setUnreadCount(result.unreadCount);
            }
        } catch (error) {
            console.error("Gagal mendapatkan notifikasi:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const fetchChatUnread = async () => {
            try {
                const token = localStorage.getItem('jokifast_token');
                if (!token) return;
                const res = await fetch(`${API_URL}/api/chat/unread-count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) setChatUnreadCount(result.count);
            } catch (err) { console.error(err); }
        };
        fetchChatUnread();

        const interval = setInterval(() => {
            fetchNotifications();
            fetchChatUnread();
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('jokifast_token');
            await fetch(`${API_URL}/api/notifications/${id}/read`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) { console.error("Gagal tandai dibaca:", error); }
    };

    const markAllAsRead = async () => {
        try {
            const token = localStorage.getItem('jokifast_token');
            await fetch(`${API_URL}/api/notifications/read-all`, {
                method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) { console.error("Gagal tandai semua:", error); }
    };

    // Worker user data
    const worker = useMemo(() => {
        const userStr = localStorage.getItem('jokifast_user');
        if (userStr) {
            const u = JSON.parse(userStr);
            return { name: u.nama || 'Worker', email: u.email || '-', initials: (u.nama || 'W').charAt(0).toUpperCase() };
        }
        return { name: 'Worker', email: '-', initials: 'W' };
    }, []);

    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Gagal logout Supabase:", error);
        }

        localStorage.removeItem('jokifast_token');
        localStorage.removeItem('jokifast_user');

        navigate('/carrier/login');
    };

    const navigation = [
        { name: 'Bursa Tugas', href: '/carrier/dashboard', icon: Briefcase },
        { name: 'Tugas Aktif', href: '/carrier/dashboard/tugas-aktif', icon: ClipboardList },
        { name: 'Chat', href: '/carrier/dashboard/chat', icon: MessageSquare },
        { name: 'Pendapatan', href: '/carrier/dashboard/pendapatan', icon: Wallet },
        { name: 'Profil', href: '/carrier/dashboard/profil', icon: User },
        { name: 'FAQ', href: '/carrier/dashboard/faq', icon: HelpCircle },
    ];

    const isActive = (path) => {
        if (path === '/carrier/dashboard') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    // Theme classes
    const bg = isDark ? 'bg-[#0B1120]' : 'bg-gray-50';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
    const sidebarBg = isDark ? 'bg-[#0B1120]' : 'bg-white';
    const sidebarBorder = isDark ? 'border-slate-800/60' : 'border-gray-200';
    const cardBg = isDark ? 'bg-slate-900/50' : 'bg-gray-100';
    const headerBg = isDark ? 'bg-[#0B1120]/80' : 'bg-white/80';

    const sidebarWidth = isSidebarCollapsed ? 'w-20' : 'w-72';
    const mainMargin = isSidebarCollapsed ? 'md:ml-20' : 'md:ml-72';

    // ==========================================================
    // 2. LOGIKA LAYAR PENGUNCI (BLOCKER)
    // ==========================================================
    const renderBlocker = () => {
        if (!user) return null;
        if (!user.keahlian) return null; // Biarin lewat buat ngisi form onboarding
        if (user.status_worker === 'APPROVED') return null; // Bebas masuk

        return (
            <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    {user.status_worker === 'PENDING' ? (
                        <>
                            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Akun Sedang Diverifikasi</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Tim Admin sedang meninjau profil dan portofolio Anda. Proses ini biasanya memakan waktu maksimal 1x24 jam kerja. Mohon tunggu ya Bro!
                            </p>
                            <button onClick={() => window.location.reload()} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all mb-3">
                                Cek Status Sekarang
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-red-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Pendaftaran Ditolak</h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8">
                                Mohon maaf, profil dan portofolio Anda belum memenuhi kualifikasi kami saat ini. Tingkatkan terus keahlian Anda dan coba lagi di masa depan!
                            </p>
                        </>
                    )}

                    <button onClick={handleLogout} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent hover:border-red-500/30">
                        <LogOut className="w-5 h-5" /> Keluar (Logout)
                    </button>
                </div>
            </div>
        );
    };

    const SidebarContent = ({ collapsed = false }) => (
        <div className={`flex flex-col h-full ${sidebarBg} border-r ${sidebarBorder} ${collapsed ? 'p-2' : 'p-4'}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center py-4 mb-4' : 'gap-3 px-2 py-4 mb-6'}`}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/20 shrink-0">
                    J
                </div>
                {!collapsed && (
                    <div>
                        <h1 className={`text-xl font-bold tracking-tight ${textPrimary}`}>JokiFast</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 tracking-widest uppercase">PRO</span>
                            <span className={`text-xs font-medium ${textSecondary}`}>Worker Portal</span>
                        </div>
                    </div>
                )}
            </div>

            <nav className="flex-1 space-y-1">
                {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                        <Link key={item.name} to={item.href} title={collapsed ? item.name : undefined}
                            className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${active
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : `${isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`
                                }`}
                        >
                            <item.icon className={`w-5 h-5 shrink-0 transition-colors ${active ? 'text-emerald-500' : isDark ? 'text-slate-500 group-hover:text-slate-300' : 'text-gray-400 group-hover:text-gray-700'}`} />
                            {!collapsed && (
                                <div className="flex items-center justify-between w-full">
                                    <span>{item.name}</span>
                                    {item.name === 'Chat' && chatUnreadCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                                            {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                                        </span>
                                    )}
                                </div>
                            )}
                            {collapsed && item.name === 'Chat' && chatUnreadCount > 0 && (
                                <span className="absolute top-2 right-2 flex items-center justify-center min-w-[12px] h-3 px-1 rounded-full bg-red-500 border border-[#0B1120] text-white text-[8px] font-bold animate-pulse"></span>
                            )}
                            {active && <motion.div layoutId="activeWorkerIndicator" className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full" />}
                        </Link>
                    );
                })}
            </nav>

            <div className={`mt-auto pt-4 border-t ${sidebarBorder} space-y-2`}>
                {!isMobileMenuOpen && (
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-4'} py-2.5 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                        title={collapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
                    >
                        {collapsed ? <ChevronsRight className="w-5 h-5 shrink-0" /> : <ChevronsLeft className="w-5 h-5 shrink-0" />}
                        {!collapsed && 'Tutup Sidebar'}
                    </button>
                )}

                <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-3 rounded-xl ${cardBg} border ${sidebarBorder}`}>
                    <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? '' : ''}`}>
                        <div className={`w-9 h-9 rounded-full ${isDark ? 'bg-slate-800' : 'bg-emerald-100'} flex items-center justify-center ${isDark ? 'text-slate-300' : 'text-emerald-700'} font-bold text-sm shrink-0`}>
                            {worker.initials}
                        </div>
                        {!collapsed && (
                            <div className="truncate">
                                <p className={`text-sm font-bold truncate ${textPrimary}`}>{worker.name}</p>
                                <p className={`text-xs truncate ${textSecondary}`}>{worker.email}</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button onClick={handleLogout} title="Keluar" className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors shrink-0">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const currentTitle = navigation.find(n => isActive(n.href))?.name || 'Dashboard';

    // Munculin Loading kalau belum dapet data user
    if (userLoading) {
        return (
            <div className={`h-screen w-full ${bg} flex items-center justify-center`}>
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bg} ${isDark ? 'text-slate-200' : 'text-gray-800'} font-sans flex selection:bg-emerald-500/30 selection:text-emerald-200 relative`}>

            {/* 👇 MUNCULIN BLOCKER DI SINI 👇 */}
            {renderBlocker()}

            <WorkerOnboarding />

            <aside className={`hidden md:block ${sidebarWidth} fixed inset-y-0 z-40 ${sidebarBg} transition-all duration-300 ease-in-out`}>
                <SidebarContent collapsed={isSidebarCollapsed} />
            </aside>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" />
                        <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-72 z-50 shadow-2xl md:hidden">
                            <div className="absolute top-4 right-4 z-50">
                                <button onClick={() => setIsMobileMenuOpen(false)} className={`p-2 rounded-lg ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-600'} hover:text-white`}>
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <SidebarContent collapsed={false} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <main className={`flex-1 min-w-0 overflow-x-hidden ${mainMargin} flex flex-col min-h-screen relative transition-all duration-300 ease-in-out`}>
                <header className={`sticky top-0 z-30 ${headerBg} backdrop-blur-xl border-b ${sidebarBorder} px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between`}>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsMobileMenuOpen(true)} className={`p-2 -ml-2 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'} md:hidden transition-colors`}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${textPrimary}`}>{currentTitle}</h2>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={toggleTheme} className={`p-2 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-yellow-400' : 'border-gray-200 bg-white text-gray-500 hover:text-gray-900'} transition-all`}>
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="relative" ref={dropdownRef}>
                            <motion.button onClick={() => setShowNotif(!showNotif)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                className={`relative p-2 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30' : 'border-gray-200 bg-white text-gray-500 hover:text-emerald-600'} transition-all`}
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className={`absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full border-2 ${isDark ? 'border-[#0B1120]' : 'border-white'} px-1 shadow-[0_0_8px_rgba(239,68,68,0.8)]`}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </motion.button>

                            <AnimatePresence>
                                {showNotif && (
                                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
                                        className={`absolute right-0 mt-3 w-80 sm:w-96 ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-gray-200'} backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden z-50`}
                                    >
                                        <div className={`p-4 border-b ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-gray-100 bg-gray-50'} flex items-center justify-between`}>
                                            <h3 className={`text-sm font-bold ${textPrimary} flex items-center gap-2`}>
                                                Notifikasi
                                                {unreadCount > 0 && <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md text-[10px]">{unreadCount} Baru</span>}
                                            </h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-[11px] font-medium text-emerald-500 hover:text-emerald-400 flex items-center gap-1">
                                                    <CheckCheck className="w-3 h-3" /> Tandai Semua
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto pb-2">
                                            {notifications.length > 0 ? notifications.map(notif => (
                                                <div key={notif.id} onClick={() => !notif.is_read && markAsRead(notif.id)}
                                                    className={`p-4 border-b ${isDark ? 'border-slate-800/50 hover:bg-slate-800/50' : 'border-gray-100 hover:bg-gray-50'} transition-colors cursor-pointer flex gap-3 ${!notif.is_read ? (isDark ? 'bg-slate-800/20' : 'bg-emerald-50/50') : ''}`}
                                                >
                                                    {!notif.is_read && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
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

                <div className="flex-1 w-full overflow-x-hidden p-4 sm:p-8 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default function WorkerLayout() {
    return (
        <ThemeProvider portal="worker">
            <WorkerDashboard />
        </ThemeProvider>
    );
}