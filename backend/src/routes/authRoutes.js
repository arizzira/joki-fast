// File: src/routes/authRoutes.js
import express from 'express';
// Tambahin logout di import ini
import { register, login, loginGoogleNode, forgotPassword, resetPassword, updateProfile, logout, adminLogin, getMe } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Rute buat nangkep lemparan data dari React (Login Google via Supabase)
router.post('/google', loginGoogleNode);
router.post('/admin-login', adminLogin);

// Rute buat fitur Lupa Password & Reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// INI RUTE BARU BUAT LOGOUT! 🚀
router.post('/logout', logout);

// Rute buat update profil (Wajib Login)
router.put('/profile', verifyToken, updateProfile);
router.get('/me', verifyToken, getMe);

export default router;