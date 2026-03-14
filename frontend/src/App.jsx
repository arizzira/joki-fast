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

// Admin Layout & Pages
import AdminLayout from './layouts/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminWithdrawals from './pages/admin/AdminWithdrawals';
import AdminLogin from './pages/admin/AdminLogin';
import AdminWorker from './pages/admin/AdminWorkers';
import AdminOrders from './pages/admin/AdminOrders';
import { ThemeProvider } from './context/ThemeContext';
import EditMateri from './pages/admin/EditMateri';

// === TAMBAHAN IMPORT MENU E-LEARNING (SESUAI MINDMAP) ===
import CourseMaker from './pages/admin/CourseMaker';
import ElearningOverview from './pages/admin/ElearningOverview';
import ElearningDetail from './pages/admin/ElearningDetail';
import ElearningReview from './pages/admin/ElearningReview';
import CourseWorkspace from './pages/admin/CourseWorkspace';
import DetailUsers from './pages/admin/DetailUsers';
import IncomeAnalytics from './pages/admin/IncomeAnalytics';
import PaymentHistory from './pages/admin/PaymentHistory';

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

// === IMPORT HALAMAN E-LEARNING PUBLIC ===
import ElearningCatalog from './pages/elearning/ElearningCatalog';
import ElearningNavbar from './components/ElearningNavbar';
import CourseDetailPublic from './pages/elearning/CourseDetailPublic';
import LearnCourse from './pages/elearning/LearningCourse';
import QuizPlay from './pages/elearning/QuizPlay';
import Certificate from './pages/elearning/Certificate';
/* ============================================================
   KITA BIKIN KOMPONEN LAYOUT UTAMA DI SINI
============================================================ */
const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

const ElearningLayout = () => {
  return (
    <>
      <ElearningNavbar />
      <main>
        <Outlet />
      </main>
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

        {/* === RUTE E-LEARNING PUBLIC & KUIS === */}
        {/* 1. Katalog Elearning (Pake Navbar Khusus) */}
        <Route element={<ElearningLayout />}>
          <Route path="/elearning" element={<ElearningCatalog />} />
        </Route>

        {/* 2. Detail Course & Kuis (Polosan, tapi dibungkus ThemeProvider) */}
        <Route path="/elearning/course/:id" element={
          <ThemeProvider><CourseDetailPublic /></ThemeProvider>
        } />
        <Route path="/elearning/quiz-play" element={
          <ThemeProvider><QuizPlay /></ThemeProvider>
        } />
        <Route path="/elearning/certificate/:id" element={<ThemeProvider><Certificate /></ThemeProvider>} />


        {/* === RUTE PROTECTED (WAJIB LOGIN) === */}
        <Route element={<ProtectedRoute />}>

          {/* RUTE RUANG BELAJAR (WAJIB LOGIN, TAPI BUKAN BAGIAN DARI DASHBOARD LAYOUT) */}
          <Route path="/elearning/learn/:id" element={
            <ThemeProvider portal="user"><LearnCourse /></ThemeProvider>
          } />

          {/* RUTE DASHBOARD USER (PAKE SIDEBAR DASHBOARD) */}
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
          {/* Default Route Admin */}
          <Route index element={<AdminOverview />} />

          {/* MENU JOKIFAST */}
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="workers" element={<AdminWorker />} />
          <Route path="orders" element={<AdminOrders />} />

          {/* MENU IDEFAST (E-LEARNING) */}
          <Route path="course-maker" element={<CourseMaker />} />
          <Route path="elearning-overview" element={<ElearningOverview />} />
          <Route path="elearning-detail" element={<ElearningDetail />} />
          <Route path="elearning-review" element={<ElearningReview />} />
          <Route path="users" element={<DetailUsers />} />
          <Route path="income" element={<IncomeAnalytics />} />
          <Route path="pembayaran" element={<PaymentHistory />} />
          <Route path="edit-materi/:id" element={<EditMateri />} />
          <Route path="course-workspace/:courseId" element={<CourseWorkspace />} />
        </Route>

        {/* === RUTE GRUP 2: HALAMAN POLOSAN (LOGIN & REGISTER) === */}
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