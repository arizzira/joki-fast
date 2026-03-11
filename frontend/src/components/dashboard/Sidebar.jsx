import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, FileText, PlusCircle, Settings, HelpCircle, LogOut, X, ChevronsLeft, ChevronsRight, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios'; // Pastikan axios terimport buat tembak API logout
import { createClient } from '@supabase/supabase-js'; // Import Supabase

// Setup Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const generalMenu = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Buat Pesanan', icon: PlusCircle, path: '/dashboard/buat-pesanan' },
    { label: 'Pesanan Saya', icon: FileText, path: '/dashboard/pesanan' },
    { label: 'Chat', icon: MessageSquare, path: '/dashboard/chat' },
];

const supportMenu = [
    { label: 'Pengaturan Profil', icon: Settings, path: '/dashboard/profil' },
    { label: 'Pusat Bantuan', icon: HelpCircle, path: '/dashboard/faq' },
];

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [userData, setUserData] = useState({ nama: 'User', email: '' });
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    useEffect(() => {
        const storedUser = localStorage.getItem('jokifast_user');
        if (storedUser) setUserData(JSON.parse(storedUser));

        const fetchUnread = async () => {
            try {
                const token = localStorage.getItem('jokifast_token');
                if (!token) return;
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/unread-count`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.success) setChatUnreadCount(result.count);
            } catch (err) { console.error(err); }
        };
        fetchUnread();
        const interval = setInterval(fetchUnread, 15000); // Polling every 15s
        return () => clearInterval(interval);
    }, []);

    // ==========================================
    // FUNGSI LOGOUT YANG UDAH DI-UPGRADE
    // ==========================================
    const handleLogout = async () => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

            // 1. Tembak backend buat formalitas (opsional karena JWT, tapi good practice)
            await axios.post(`${API_URL}/api/auth/logout`).catch(() => { });

            // 2. Bunuh sesi Google di Supabase biar ga looping login
            await supabase.auth.signOut();

        } catch (error) {
            console.error("Gagal proses logout eksternal:", error);
        } finally {
            // 3. Bersihin Local Storage (wajib tereksekusi meskipun API error)
            localStorage.removeItem('jokifast_token');
            localStorage.removeItem('jokifast_user');

            // Opsional: Hapus sisa-sisa supabase auth di localstorage jika ada
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) {
                    localStorage.removeItem(key);
                }
            });

            // 4. Pakai window.location.href biar browser bener-bener refresh & bersih
            window.location.href = '/login';
        }
    };

    const sidebarBg = isDark ? 'bg-slate-900' : 'bg-white';
    const borderColor = isDark ? 'border-slate-800/60' : 'border-gray-200';
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';

    // Render menu items — takes collapsed parameter explicitly
    const renderMenuItems = (items, collapsed) =>
        items.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
                <Link key={item.path} to={item.path} onClick={onClose} title={collapsed ? item.label : undefined}
                    className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-3'} py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive
                        ? `${isDark ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'} shadow-sm`
                        : `${isDark ? 'text-slate-400 hover:bg-blue-500/10 hover:text-blue-400' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`
                        }`}
                >
                    <item.icon className={`w-[18px] h-[18px] shrink-0 transition-colors ${isActive ? 'text-blue-500' : `${isDark ? 'text-slate-500 group-hover:text-blue-500' : 'text-gray-400 group-hover:text-blue-500'}`}`} />
                    {!collapsed && (
                        <div className="flex items-center justify-between w-full">
                            <span>{item.label}</span>
                            {item.label === 'Chat' && chatUnreadCount > 0 && (
                                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                                    {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                                </span>
                            )}
                        </div>
                    )}
                    {collapsed && item.label === 'Chat' && chatUnreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[12px] h-3 px-1 rounded-full bg-red-500 border border-[#0B1120] text-white text-[8px] font-bold animate-pulse"></span>
                    )}
                </Link>
            );
        });

    // SidebarContent takes collapsed as explicit parameter
    const SidebarInner = ({ collapsed }) => (
        <div className={`flex flex-col h-full ${sidebarBg} border-r ${borderColor} font-sans overflow-hidden`}>
            {/* Logo */}
            <div className={`h-[76px] flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-6'} shrink-0`}>
                <Link to="/" className={`flex items-center ${collapsed ? '' : 'gap-2.5'} group`}>
                    <div className="grid grid-cols-2 gap-[3px] w-6 h-6 group-hover:scale-110 transition-transform shrink-0">
                        <div className="bg-blue-500 rounded-[3px]"></div>
                        <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-300'} hover:bg-blue-500 transition-colors rounded-[3px]`}></div>
                        <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-300'} hover:bg-blue-500 transition-colors rounded-[3px]`}></div>
                        <div className="bg-blue-500 rounded-[3px]"></div>
                    </div>
                    {!collapsed && (
                        <span className={`text-xl font-bold tracking-tight whitespace-nowrap ${textPrimary}`}>
                            Joki<span className="text-blue-500">Fast</span>
                        </span>
                    )}
                </Link>
                {!collapsed && (
                    <button onClick={onClose} className={`lg:hidden p-1.5 rounded-lg ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'} transition-colors`}>
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Menu */}
            <div className={`flex-1 ${collapsed ? 'px-2' : 'px-4'} py-6 space-y-8 overflow-y-auto custom-scrollbar`}>
                <div>
                    {!collapsed && <p className={`px-3 text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>General</p>}
                    <nav className="space-y-1">{renderMenuItems(generalMenu, collapsed)}</nav>
                </div>
                <div>
                    {!collapsed && <p className={`px-3 text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Support</p>}
                    <nav className="space-y-1">{renderMenuItems(supportMenu, collapsed)}</nav>
                </div>
            </div>

            {/* Footer */}
            <div className={`p-3 mt-auto shrink-0 border-t ${borderColor} ${isDark ? 'bg-slate-900/50' : 'bg-gray-50'} backdrop-blur-sm space-y-2`}>
                {/* Collapse Toggle Button — only on desktop */}
                {onToggleCollapse && (
                    <button
                        onClick={onToggleCollapse}
                        className={`w-full flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-2' : 'px-3'} py-2 rounded-xl text-sm font-medium transition-all ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                        title={collapsed ? 'Buka Sidebar' : 'Tutup Sidebar'}
                    >
                        {collapsed ? <ChevronsRight className="w-5 h-5 shrink-0" /> : <ChevronsLeft className="w-5 h-5 shrink-0" />}
                        {!collapsed && <span>Tutup Sidebar</span>}
                    </button>
                )}

                <div className={`${collapsed ? 'p-2' : 'p-3'} rounded-2xl flex items-center ${collapsed ? 'justify-center' : 'justify-between'} group transition-all ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'} border border-transparent ${isDark ? 'hover:border-slate-700/50' : 'hover:border-gray-200'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${isDark ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-100 border-blue-200'}`}>
                            <span className={`text-sm font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                {userData.nama ? userData.nama.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                        {!collapsed && (
                            <div className="flex-1 overflow-hidden">
                                <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-gray-800'} transition-colors`}>{userData.nama}</p>
                                <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>{userData.email}</p>
                            </div>
                        )}
                    </div>
                    {!collapsed && (
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10" title="Keluar">
                            <LogOut className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar — width controlled inline for reliable transitions */}
            <div
                className={`hidden lg:block fixed inset-y-0 left-0 z-20 overflow-hidden transition-all duration-300 ease-in-out`}
                style={{ width: isCollapsed ? '80px' : '260px' }}
            >
                <SidebarInner collapsed={isCollapsed} />
            </div>

            {/* Mobile Sidebar — always full width, never collapsed */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" />
                        <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="fixed inset-y-0 left-0 w-[280px] z-50 lg:hidden shadow-2xl">
                            <SidebarInner collapsed={false} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}