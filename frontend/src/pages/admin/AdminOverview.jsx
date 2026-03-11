import { useState, useEffect } from 'react';
import { Users, Briefcase, ShoppingCart, DollarSign, Loader2, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { useTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminOverview() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isDark } = useTheme();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('jokifast_token');
                const res = await axios.get(`${API_URL}/api/admin/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    setStats(res.data.data);
                }
            } catch (error) {
                console.error("Gagal load statistik admin:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
    }

    const cards = [
        {
            title: 'Total Klien',
            value: stats?.totalUsers || 0,
            icon: Users,
            color: isDark ? 'text-blue-400' : 'text-blue-600',
            bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
            borderColor: isDark ? 'border-blue-500/20' : 'border-blue-100'
        },
        {
            title: 'Total Worker',
            value: stats?.totalWorkers || 0,
            icon: Briefcase,
            color: isDark ? 'text-emerald-400' : 'text-emerald-600',
            bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
            borderColor: isDark ? 'border-emerald-500/20' : 'border-emerald-100'
        },
        {
            title: 'Total Transaksi',
            value: stats?.totalOrders || 0,
            icon: ShoppingCart,
            color: isDark ? 'text-amber-400' : 'text-amber-600',
            bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
            borderColor: isDark ? 'border-amber-500/20' : 'border-amber-100'
        },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ringkasan Sistem</h1>

            {/* Kartu Uang Utama */}
            <div className={`p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30' : 'bg-gradient-to-br from-indigo-600 to-indigo-800'}`}>

                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <DollarSign className="w-40 h-40 rotate-12" />
                </div>

                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl mix-blend-overlay"></div>
                <div className="absolute top-12 right-32 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl mix-blend-overlay"></div>

                <div className="relative z-10">
                    <p className={`font-medium tracking-wider uppercase text-sm mb-2 ${isDark ? 'text-indigo-300' : 'text-indigo-100'}`}>Total Pendapatan Platform (20% Fee)</p>
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats?.totalRevenue || 0)}
                    </h2>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold backdrop-blur-sm ${isDark ? 'bg-white/10 text-white' : 'bg-white/20 text-white'}`}>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Dari {stats?.completedOrders || 0} orderan sukses
                    </div>
                </div>
            </div>

            {/* Kartu Kecil */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((c, i) => (
                    <div key={i} className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 hover:-translate-y-1 ${isDark ? 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/50' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
                        <div>
                            <p className={`text-sm font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{c.title}</p>
                            <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.value}</h3>
                        </div>
                        <div className={`w-14 h-14 rounded-xl ${c.bg} border ${c.borderColor} flex items-center justify-center ${c.color}`}>
                            <c.icon className="w-7 h-7" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}