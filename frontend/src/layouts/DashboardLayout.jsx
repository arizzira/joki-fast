import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import OnboardingModal from '../components/dashboard/OnboardingModal';
import { ThemeProvider, useTheme } from '../context/ThemeContext';

function DashboardContent() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const location = useLocation();
    const { isDark } = useTheme();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    return (
        <div className={`min-h-screen font-sans flex ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-gray-50 text-gray-800'} selection:bg-blue-500/30 selection:text-blue-200`}>
            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main content — margin matches sidebar width via inline style on lg screens */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Spacer div that only shows on lg+ to push content right of the fixed sidebar */}
                <style>{`
                    @media (min-width: 1024px) {
                        .dashboard-main-content {
                            margin-left: ${sidebarCollapsed ? '80px' : '260px'};
                            transition: margin-left 0.3s ease-in-out;
                        }
                    }
                `}</style>
                <div className="dashboard-main-content flex-1 flex flex-col min-w-0">
                    <Topbar onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden relative">
                        {isDark && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
                        )}
                        <Outlet />
                    </main>
                </div>
            </div>
            <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />
        </div>
    );
}

export default function DashboardLayout() {
    return (
        <ThemeProvider portal="user">
            <DashboardContent />
        </ThemeProvider>
    );
}