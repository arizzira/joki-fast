// File: src/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import withdrawRoutes from './routes/withdrawRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// === FIX: Paksa Node.js nyari .env di direktori root (luar folder src) ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();

// ============================================================
// 🛡️ BENTENG PERTAHANAN (SECURITY MIDDLEWARES)
// ============================================================

// 1. PASANG HELMET (Otomatis ngamanin celah HTTP headers biar gak gampang di-scan hacker)
app.use(helmet());

// 2. SETTING CORS SECURE (Biar frontend lu bisa nembak API ini, buka beberapa port lokal)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
].filter(Boolean); // Buang yang undefined dari .env kalau kosong

app.use(cors({
    origin: function (origin, callback) {
        // Izinkan request tanpa origin (kayak dari Postman / server ke server)
        if (!origin) return callback(null, true);

        // Cek apakah origin yang nembak API ada di daftar putih kita
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Diblokir oleh CORS Bro! Beda Port / Domain.'));
        }
    },
    credentials: true
}));

// Biar bisa baca data JSON dari frontend
app.use(express.json());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // Turunin jadi 1 menit aja buat ngetes
    max: 500,                // Naikin ke 500 request per menit (Biar puas refresh-nya)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Kebanyakan refresh Bro, server pusing! Tunggu 1 menit ya.'
    },
    // OPTIONAL: Skip kalau lu lagi ngetes di Localhost
    skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1'
});
app.use('/api', limiter);

// 4. AUTH LIMITER (Login/Register) - Kasih jatah lebih banyak
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 500,                  // Naikin jadi 500 biar aman dari 429 test lokal
    message: { success: false, message: 'Login gagal mulu, rehat dulu 15 menit.' },
    // Skip kalau lagi ngetes di Localhost
    skip: (req) => req.ip === '::1' || req.ip === '127.0.0.1' || req.ip === '::ffff:127.0.0.1'
});
app.use('/api/auth', authLimiter);

// ============================================================
// 🚀 ROUTES (JALUR API)
// ============================================================
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/admin', adminRoutes);

// Test Route
app.get('/', (req, res) => {
    res.send('API MinJok is Running & Secured! 🚀🛡️');
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, (err) => {
    if (err) {
        console.error(`❌ Gagal menjalankan server di port ${PORT}:`, err.message);
        console.error(`💡 Tips: Port ${PORT} mungkin sedang dipakai oleh aplikasi lain. Coba ganti port di .env atau matikan aplikasi tersebut.`);
        process.exit(1);
    }
    console.log(`✅ Server nyala di http://localhost:${PORT}`);
    // CCTV buat ngecek .env lu beneran kebaca atau nggak!
    console.log(`🔑 Status Kunci Midtrans: ${process.env.MIDTRANS_SERVER_KEY ? 'KEBACA BRO! 🔥' : 'MASIH KOSONG ❌'}`);
});