import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const layananLinks = [
    { label: 'Web & Aplikasi', to: '/layanan/web-dev' },
    { label: 'Laporan & Tugas Akhir', to: '/layanan/skripsi' },
    { label: 'Tugas Koding', to: '/layanan/koding' },
    { label: 'Makalah & PPT', to: '/layanan/makalah' },
    { label: 'UI/UX Design', to: '/layanan/ui-ux' },
    { label: 'Tugas Harian', to: '/layanan/server' },
];

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="grid grid-cols-2 gap-[2px] w-6 h-6 group-hover:scale-105 transition-transform">
                            <div className="bg-blue-600 rounded-sm"></div>
                            <div className="bg-slate-900 rounded-sm"></div>
                            <div className="bg-slate-900 rounded-sm"></div>
                            <div className="bg-slate-900 rounded-sm"></div>
                        </div>
                        <span className="text-xl font-medium text-slate-900 tracking-tight">
                            Joki<span className="text-blue-600">Fast</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="/#fitur" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200">Fitur</a>

                        {/* Layanan Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200"
                            >
                                Layanan <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden py-2"
                                    >
                                        {layananLinks.map((link) => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                onClick={() => setDropdownOpen(false)}
                                                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all"
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Link to="/harga" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200">Harga</Link>
                        <Link to="/cara-order" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200">Cara Order</Link>
                        <Link to="/tentang-kami" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors duration-200">Tentang Kami</Link>
                    </div>

                    {/* CTA Button Desktop */}
                    <div className="hidden md:flex items-center gap-5">
                        <Link to="/carrier/login" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors">Worker</Link>
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Log in</Link>
                        <Link to="/order" className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-sm shadow-blue-600/20">
                            Konsultasi Gratis
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-slate-500 hover:text-slate-900 transition-colors">
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl overflow-hidden shadow-xl"
                    >
                        <div className="px-4 py-6 space-y-2">
                            <a href="/#fitur" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
                                Fitur
                            </a>

                            {/* Mobile Layanan Submenu */}
                            <div className="px-4 py-2">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Layanan</p>
                                {layananLinks.map((link) => (
                                    <Link key={link.to} to={link.to} onClick={() => setIsOpen(false)}
                                        className="block px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all">
                                        {link.label}
                                    </Link>
                                ))}
                            </div>

                            <a href="/harga" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
                                Harga
                            </a>
                            <Link to="/cara-order" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
                                Cara Order
                            </Link>
                            <Link to="/tentang-kami" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-all">
                                Tentang Kami
                            </Link>

                            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col gap-3">
                                <Link to="/carrier/login" onClick={() => setIsOpen(false)} className="px-4 py-3 text-sm font-medium text-emerald-600 text-center rounded-xl hover:bg-emerald-50 transition-colors">
                                    Login Worker
                                </Link>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="px-4 py-3 text-sm font-medium text-slate-600 text-center rounded-xl hover:bg-slate-50 transition-colors">
                                    Log in
                                </Link>
                                <Link to="/order" onClick={() => setIsOpen(false)} className="px-4 py-3.5 text-sm font-medium text-white bg-blue-600 rounded-xl text-center shadow-sm shadow-blue-600/20 hover:bg-blue-700">
                                    Konsultasi Gratis
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}