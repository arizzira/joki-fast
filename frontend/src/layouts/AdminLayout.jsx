import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, CreditCard, ShoppingCart, LogOut,
    ShieldCheck, Moon, Sun, Menu, X,
    // Icon buat E-Learning
    GraduationCap, PlusSquare, ListTree, Star, TrendingUp
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change on mobile
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // 1. AMBIL DATA DARI LOCAL STORAGE
    const token = localStorage.getItem('jokifast_token');
    const userStr = localStorage.getItem('jokifast_user');
    const admin = userStr ? JSON.parse(userStr) : null;

    // ============================================================
    // 2. LOGIKA SATPAM PENJAGA PINTU (PROTECTED ROUTE)
    // ============================================================
    if (!token || !admin || admin.role !== 'ADMIN') {
        return <Navigate to="/admin/login" replace />;
    }

    // 3. FUNGSI LOGOUT
    const handleLogout = () => {
        localStorage.removeItem('jokifast_token');
        localStorage.removeItem('jokifast_user');
        navigate('/admin/login');
    };

    // ============================================================
    // 4. DAFTAR MENU SIDEBAR (DIPISAH 2 GRUP BIAAR RAPIH)
    // ============================================================
    const jokifastNavItems = [
        { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Verifikasi Mitra', href: '/admin/dashboard/workers', icon: Users },
        { name: 'Penarikan Dana', href: '/admin/dashboard/withdrawals', icon: CreditCard },
        { name: 'Semua Pesanan', href: '/admin/dashboard/orders', icon: ShoppingCart },
    ];

    const elearningNavItems = [
        { name: 'Overview', href: '/admin/dashboard/elearning-overview', icon: GraduationCap },
        { name: 'Create E-Learning', href: '/admin/dashboard/course-maker', icon: PlusSquare },
        { name: 'Detail E-Learning', href: '/admin/dashboard/elearning-detail', icon: ListTree },
        { name: 'Review & Ulasan', href: '/admin/dashboard/elearning-review', icon: Star },
        { name: 'Detail Users', href: '/admin/dashboard/users', icon: Users },
        { name: 'Income Analytics', href: '/admin/dashboard/income', icon: TrendingUp },
        { name: 'Riwayat Pembayaran', href: '/admin/dashboard/pembayaran', icon: CreditCard },
    ];

    return (
        <div className={`flex h-screen font-sans selection:bg-indigo-500/30 ${isDark ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out flex flex-col ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-r ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

                {/* Sidebar Header */}
                <div className={`p-6 flex items-center justify-between lg:justify-start gap-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin<span className="text-indigo-500">Panel</span></h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Top Secret Area</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={() => setSidebarOpen(false)} className={`lg:hidden p-2 rounded-lg ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto custom-scrollbar">

                    {/* GRUP 1: JOKIFAST */}
                    <div>
                        <p className={`px-4 mb-2 text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Marketplace (JokiFast)
                        </p>
                        <div className="space-y-1">
                            {jokifastNavItems.map((item) => {
                                const active = location.pathname === item.href;
                                return (
                                    <Link key={item.name} to={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                            ? isDark
                                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm'
                                            : isDark
                                                ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" /> {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* GRUP 2: IDEFAST (E-LEARNING) */}
                    <div>
                        <p className={`px-4 mb-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span> E-Learning (IDefast)
                        </p>
                        <div className="space-y-1">
                            {elearningNavItems.map((item) => {
                                const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                                return (
                                    <Link key={item.name} to={item.href}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                            ? isDark
                                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner'
                                                : 'bg-purple-50 text-purple-600 border border-purple-100 shadow-sm'
                                            : isDark
                                                ? 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                                                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" /> {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                </nav>

                {/* User Profile & Logout */}
                <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                        <div className="overflow-hidden pr-2">
                            <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{admin.nama}</p>
                            <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{admin.email}</p>
                        </div>
                        <button onClick={handleLogout} className={`p-2 rounded-lg transition-all ${isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-500 hover:bg-red-50'}`}>
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                <header className={`h-20 px-4 lg:px-8 flex items-center justify-between border-b backdrop-blur-md z-30 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className={`lg:hidden p-2 rounded-lg ${isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className={`text-lg lg:text-xl font-bold hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>Super Admin Command Center</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className={`p-2.5 rounded-xl transition-all border ${isDark
                                ? 'bg-slate-800 border-slate-700 text-yellow-400 hover:bg-slate-700'
                                : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-50 shadow-sm'
                                }`}
                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <span className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-200 shadow-sm'}`}>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            <span className="hidden sm:inline">Live System</span>
                        </span>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}