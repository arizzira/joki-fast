// File: src/controllers/authController.js
import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// 👇 IMPORT FUNGSI EMAIL DARI SERVICE
import { emailAdminRequestWorker } from '../utils/emailServices.js';

// ============================================================
//  POST /api/auth/register
// ============================================================
export const register = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        if (!nama || !email || !password) {
            return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password minimal 8 karakter.' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await prisma.user.create({
            data: {
                nama,
                email: email.toLowerCase(),
                password: hashedPassword,
                role: role === 'WORKER' ? 'WORKER' : 'USER',
            },
        });

        res.status(201).json({
            success: true,
            message: 'Akun berhasil dibuat! Silakan login.',
            data: { id: newUser.id, nama: newUser.nama, email: newUser.email },
        });

    } catch (error) {
        console.error('Error Register:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
};

// ============================================================
//  POST /api/auth/login
// ============================================================
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }

        // Kalau usernya daftar pake Google, dia ga punya password di DB
        if (!user.password) {
            return res.status(401).json({ success: false, message: 'Akun ini terdaftar via Google. Silakan klik Login with Google.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Email atau password salah.' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            message: "Login berhasil",
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                univ: user.univ,
                jurusan: user.jurusan,
                bank: user.bank,
                no_rekening: user.no_rekening,
                status_worker: user.status_worker // Tambahin ini biar frontend tau statusnya
            }
        });

    } catch (error) {
        console.error("Error Login:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ============================================================
//  POST /api/auth/google (FUNGSI BARU BUAT LOGIN GOOGLE)
// ============================================================
export const loginGoogleNode = async (req, res) => {
    const { email, nama, googleId, role } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Data Google tidak valid.' });
    }

    try {
        let user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    nama: nama || "Google User",
                    role: role === 'WORKER' ? 'WORKER' : 'USER',
                    password: "0864213579",
                }
            });
            console.log(`➡️ User baru jalur Google berhasil dibuat sebagai ${user.role}!`);
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            message: "Login Google berhasil",
            token,
            user: {
                id: user.id,
                nama: user.nama,
                email: user.email,
                role: user.role,
                univ: user.univ,
                jurusan: user.jurusan,
                bank: user.bank,
                no_rekening: user.no_rekening,
                status_worker: user.status_worker
            }
        });
    } catch (error) {
        console.error("Error Login Google:", error);
        res.status(500).json({ message: "Server Error saat memproses login Google" });
    }
};

// ============================================================
//  POST /api/auth/forgot-password
// ============================================================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email wajib diisi.' });
        }

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

        if (!user) {
            return res.status(200).json({ success: true, message: 'Jika email terdaftar, link reset password akan dikirim.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        });

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.sendMail({
            from: `"JokiFast" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: 'Reset Password — JokiFast',
            html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                <div style="max-w: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; text-align: center;">Reset Password Anda</h2>
                    <p style="color: #555; font-size: 16px;">Halo,</p>
                    <p style="color: #555; font-size: 16px;">Kami menerima permintaan untuk mereset password akun JokiFast Anda.</p>
                    <p style="color: #555; font-size: 16px;">Klik tombol di bawah ini untuk mengatur ulang password Anda. Link ini hanya berlaku selama 1 jam.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password Sekarang</a>
                    </div>
                    <p style="color: #999; font-size: 14px;">Jika Anda tidak merasa meminta reset password, abaikan saja email ini. Akun Anda tetap aman.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #aaa; font-size: 12px; text-align: center;">&copy; 2024 JokiFast. All rights reserved.</p>
                </div>
            </div>
            `
        });

        res.status(200).json({ success: true, message: 'Jika email terdaftar, link reset password akan dikirim.' });

    } catch (error) {
        console.error('Error Forgot Password:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
};

// ============================================================
//  PUT /api/auth/profile 
// ============================================================
export const updateProfile = async (req, res) => {

    try {
        const { univ, jurusan, semester, nama, password } = req.body;
        const userId = req.user.id;

        // Ambil data user saat ini sebelum diupdate buat ngecek statusnya
        const currentUser = await prisma.user.findUnique({ where: { id: userId } });

        const updateData = {
            univ: req.body.univ || null,
            jurusan: req.body.jurusan || null,
            semester: req.body.semester ? String(req.body.semester) : null,
            keahlian: req.body.keahlian || null,
            portfolio_link: req.body.portfolio_link || null,
            whatsappNumber: req.body.whatsappNumber || null,
        };

        if (nama) updateData.nama = nama;

        if (password) {
            const salt = await bcrypt.genSalt(12);
            updateData.password = await bcrypt.hash(password, salt);
        }

        if (req.body.bank !== undefined) updateData.bank = req.body.bank || null;
        if (req.body.no_rekening !== undefined) updateData.no_rekening = req.body.no_rekening || null;

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        // 👇 LOGIKA EMAIL & NOTIFIKASI
        // Cek kalau dia Worker dan baru aja ngisi keahlian/onboarding
        // (Statusnya pindah dari NULL jadi PENDING, atau dia lagi nunggu verifikasi)
        if (updatedUser.role === 'WORKER' && req.body.keahlian && currentUser.status_worker === 'PENDING') {

            // 1. Tembak Email ke Super Admin (Jangan di-await biar cepat responnya)
            emailAdminRequestWorker(updatedUser.email);

            console.log(`[EMAIL TRIGGERED] Notifikasi pendaftar worker baru dikirim ke Admin untuk email: ${updatedUser.email}`);
        }

        const { password: _, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ success: true, message: 'Profil berhasil diperbarui!', user: userWithoutPassword });

    } catch (error) {
        console.error("Error Update Profile:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: 'Token dan password baru wajib diisi.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: 'Password minimal 8 karakter.' });
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Token reset password tidak valid atau sudah kedaluwarsa. Silakan request link baru.'
            });
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.status(200).json({
            success: true,
            message: 'Password berhasil diubah! Silakan login dengan password baru Anda.'
        });

    } catch (error) {
        console.error('Error Reset Password:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
};

// ============================================================
//  POST /api/auth/logout
// ============================================================
export const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout berhasil. Sesi telah dihapus.'
        });
    } catch (error) {
        console.error('Error Logout:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat logout.' });
    }
};

export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ success: false, message: "Akses Ditolak! Anda bukan Super Admin." });
        }

        if (user.password !== password) {
            return res.status(401).json({ success: false, message: "Email atau Password salah!" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Selamat datang, Bos!",
            token,
            user: { id: user.id, nama: user.nama, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error("Admin Login Error:", error);
        res.status(500).json({ success: false, message: "Terjadi kesalahan pada server." });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User tidak ditemukan" });
        }

        const { password, ...safeUser } = user;

        res.status(200).json({ success: true, user: safeUser });
    } catch (error) {
        console.error("Error Get Me:", error);
        res.status(500).json({ success: false, message: "Server Error saat mengambil data user" });
    }
};