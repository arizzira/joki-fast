import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap, Home, LogIn, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ElearningNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Detect scroll position
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // check initial position
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const links = [
        { label: 'Home', to: '/', icon: Home },
        { label: 'E-Learning', to: '/elearning', icon: GraduationCap },
    ];

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm'
            : 'bg-transparent border-b border-transparent'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">

                    {/* Logo */}
                    <Link to="/elearning" className="flex items-center gap-2.5 group">
                        <img
                            src={
                                location.pathname.startsWith('/elearning/')
                                    ? '/elarning/idefast-1.png'
                                    : (scrolled ? '/elarning/idefast-1.png' : '/elarning/idefast-2.png')
                            }
                            alt="IDeFast Logo"
                            className="h-30 w-auto group-hover:scale-105 transition-transform"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map(link => {
                            const active = location.pathname === link.to;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${active
                                        ? scrolled
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'bg-white/15 text-white'
                                        : scrolled
                                            ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* CTA Buttons Desktop */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/carrier/login" className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg ${scrolled
                            ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                            : 'text-emerald-300 hover:text-white hover:bg-white/10'
                            }`}>
                            <Briefcase className="w-4 h-4" /> Carrier
                        </Link>
                        <Link to="/login" className={`flex items-center gap-1.5 text-sm font-medium transition-all duration-300 px-3 py-2 rounded-lg ${scrolled
                            ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}>
                            <LogIn className="w-4 h-4" /> Login
                        </Link>
                        <Link to="/order" className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm ${scrolled
                            ? 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                            : 'text-slate-900 bg-white hover:bg-slate-100 shadow-white/10'
                            }`}>
                            Mulai Belajar
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setIsOpen(!isOpen)} className={`md:hidden p-2 transition-colors duration-300 ${scrolled ? 'text-slate-500 hover:text-slate-900' : 'text-white/80 hover:text-white'
                        }`}>
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl overflow-hidden shadow-xl"
                    >
                        <div className="px-4 py-6 space-y-1">
                            {links.map(link => {
                                const active = location.pathname === link.to;
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={() => setIsOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
                                <Link to="/carrier/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-emerald-600 rounded-xl hover:bg-emerald-50">
                                    <Briefcase className="w-5 h-5" /> Carrier
                                </Link>
                                <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-50">
                                    <LogIn className="w-5 h-5" /> Login
                                </Link>
                                <Link to="/order" onClick={() => setIsOpen(false)} className="block px-4 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl text-center shadow-sm hover:bg-indigo-700">
                                    Mulai Belajar
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
