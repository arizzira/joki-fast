import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import Order from './pages/Order';
import Login from './pages/Login';
import Register from './pages/Register';
import WebDev from './pages/layanan/WebDev';
import Skripsi from './pages/layanan/Skripsi';
import Koding from './pages/layanan/Koding';
import Makalah from './pages/layanan/Makalah';
import UiUx from './pages/layanan/UiUx';
import ServerPage from './pages/layanan/Server';
import CustomCursor from './components/CustomCursor';
import SyaratKetentuan from './pages/legal/SyaratKetentuan';
import KebijakanPrivasi from './pages/legal/KebijakanPrivasi';
import GaransiRevisi from './pages/legal/GaransiRevisi';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Harga from './pages/harga/Harga';
import TentangKami from './pages/TentangKami';
import CaraOrder from './pages/CaraOrder';
import HubungiAdmin from './pages/HubungiAdmin';

// Carrier Auth
import CarrierLogin from './pages/carrier/CarrierLogin';
import CarrierRegister from './pages/carrier/CarrierRegister';
import CarrierForgotPassword from './pages/carrier/CarrierForgotPassword';
import NegoRoom from './pages/carrier/NegoRoom';

// Dashboard & User Layout
import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Pesanan from './pages/dashboard/Pesanan';
import DetailPesanan from './pages/dashboard/DetailPesanan';
import Profil from './pages/dashboard/Profil';
import BuatPesanan from './pages/dashboard/BuatPesanan';
import FAQUser from './pages/dashboard/FAQUser';
import ProtectedRoute from './components/ProtectedRoute';

// admin
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminLogin from './pages/admin/AdminLogin';
import AdminWorker from './pages/admin/AdminWorkers';
import AdminOrders from './pages/admin/AdminOrders';
import { ThemeProvider } from './context/ThemeContext';

// Worker Dashboard Layout & Pages
import WorkerLayout from './layouts/WorkerLayout';
import BursaTugas from './pages/carrier/BursaTugas';
import TugasAktif from './pages/carrier/TugasAktif';
import Pendapatan from './pages/carrier/Pendapatan';
import ProfilWorker from './pages/carrier/ProfilWorker';
import DetailTugasWorker from './pages/carrier/DetailTugasWorker';
import FAQ from './pages/carrier/FAQ';
import ChatGlobalWorker from './pages/carrier/ChatGlobalWorker';
import ChatGlobal from './pages/dashboard/ChatGlobal';

/* ============================================================
   KITA BIKIN KOMPONEN LAYOUT UTAMA DI SINI
============================================================ */
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        {/* <Outlet /> ini ibarat "lubang". Halaman LandingPage, WebDev, dll bakal dimasukin ke lubang ini */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <Router>
      <CustomCursor />

      <Routes>
        {/* === RUTE GRUP 1: HALAMAN YANG PAKE NAVBAR & FOOTER === */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/order" element={<Order />} />
          <Route path="/layanan/web-dev" element={<WebDev />} />
          <Route path="/layanan/skripsi" element={<Skripsi />} />
          <Route path="/layanan/koding" element={<Koding />} />
          <Route path="/layanan/makalah" element={<Makalah />} />
          <Route path="/layanan/ui-ux" element={<UiUx />} />
          <Route path="/layanan/server" element={<ServerPage />} />
          <Route path="/harga" element={<Harga />} />
          <Route path="/tentang-kami" element={<TentangKami />} />
          <Route path="/cara-order" element={<CaraOrder />} />
          <Route path="/hubungi-admin" element={<HubungiAdmin />} />
          <Route path="/legal/syarat-ketentuan" element={<SyaratKetentuan />} />
          <Route path="/legal/kebijakan-privasi" element={<KebijakanPrivasi />} />
          <Route path="/legal/garansi-revisi" element={<GaransiRevisi />} />
        </Route>

        {/* === RUTE GRUP DASHBOARD (DILINDUNGI PROTECTED ROUTE) === */}
        {/* Semua halaman di dalam sini nggak bisa diakses kalau belum login */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Overview />} />
            <Route path="buat-pesanan" element={<BuatPesanan />} />
            <Route path="pesanan" element={<Pesanan />} />
            <Route path="pesanan/:id" element={<DetailPesanan />} />
            <Route path="profil" element={<Profil />} />
            <Route path="faq" element={<FAQUser />} />
            <Route path="nego/:id" element={<NegoRoom />} />
            <Route path="chat" element={<ChatGlobal />} />
          </Route>
        </Route>

        {/* === RUTE GRUP ADMIN DASHBOARD === */}
        <Route path="/admin/login" element={<AdminLogin />} />
        {/* === RUTE GRUP 5: SUPER ADMIN DASHBOARD === */}
        <Route path="/admin/dashboard" element={
          <ThemeProvider portal="admin">
            <AdminLayout />
          </ThemeProvider>
        }>
          <Route index element={<AdminOverview />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="workers" element={<AdminWorker />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* === RUTE GRUP 2: HALAMAN POLOSAN (LOGIN & REGISTER) === */}
        {/* Karena rute ini ada di luar MainLayout, Navbar & Footer otomatis musnah! */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* === RUTE GRUP 3: HALAMAN CARRIER AUTH === */}
        <Route path="/carrier/login" element={<CarrierLogin />} />
        <Route path="/carrier/register" element={<CarrierRegister />} />
        <Route path="/carrier/forgot-password" element={<CarrierForgotPassword />} />

        {/* === RUTE GRUP 4: WORKER DASHBOARD === */}
        <Route path="/carrier/dashboard" element={<WorkerLayout />}>
          <Route index element={<BursaTugas />} />
          <Route path="tugas-aktif" element={<TugasAktif />} />
          <Route path="pendapatan" element={<Pendapatan />} />
          <Route path="profil" element={<ProfilWorker />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="detail/:id" element={<DetailTugasWorker />} />
          <Route path="ambil/:id" element={<NegoRoom />} />
          <Route path="nego/:id" element={<NegoRoom />} />
          <Route path="chat" element={<ChatGlobalWorker />} />
        </Route>
      </Routes>

    </Router>
  );
}

export default App;