import { Link } from 'react-router-dom';
import { Instagram, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-200 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

                    {/* Kolom 1: Brand & Deskripsi */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2.5 group mb-6">
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
                        <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-8">
                            Solusi cepat dan aman untuk tugas kuliah, project IT, dan lainya. Dikerjakan oleh expert, bebas plagiasi, dan privasi 100% terjaga.
                        </p>

                        {/* Social Media Icons */}
                        <div className="flex items-center gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all">
                                <MessageCircle className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Kolom 2: Layanan */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-6">Layanan Kami</h4>
                        <ul className="space-y-4">
                            <li><Link to="/layanan/web-dev" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Web & Aplikasi</Link></li>
                            <li><Link to="/layanan/skripsi" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Laporan & Tugas</Link></li>
                            <li><Link to="/layanan/koding" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Tugas Koding</Link></li>
                            <li><Link to="/layanan/makalah" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Makalah & PPT</Link></li>
                            <li><Link to="/layanan/ui-ux" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">UI/UX Design</Link></li>
                        </ul>
                    </div>

                    {/* Kolom 3: Perusahaan */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-6">Perusahaan</h4>
                        <ul className="space-y-4">
                            <li><Link to="/tentang-kami" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Tentang Kami</Link></li>
                            <li><Link to="/cara-order" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Cara Order</Link></li>
                            <li><Link to="/hubungi-admin" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Hubungi Admin</Link></li>
                        </ul>
                    </div>

                    {/* Kolom 4: Legalitas */}
                    <div>
                        <h4 className="font-semibold text-slate-900 mb-6">Legalitas</h4>
                        <ul className="space-y-4">
                            <li><Link to="/legal/syarat-ketentuan" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Syarat & Ketentuan</Link></li>
                            <li><Link to="/legal/kebijakan-privasi" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Kebijakan Privasi</Link></li>
                            <li><Link to="/legal/garansi-revisi" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Garansi Revisi</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar: Copyright */}
                <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm font-medium text-slate-400">
                        © 2026 JokiFast. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
                        <span>Dibuat dengan untuk bantu Mahasiswa</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}