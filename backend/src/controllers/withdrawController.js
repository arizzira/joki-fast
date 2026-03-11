// File: src/controllers/withdrawController.js
import prisma from '../config/db.js';

// 👇 IMPORT FUNGSI EMAIL KITA
import { emailAdminRequestWithdraw } from '../utils/emailServices.js';

// ============================================================
//  POST /api/withdraw/request
// ============================================================
export const requestWithdraw = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, bank, no_rekening, whatsapp } = req.body;

        // 1. Validasi Input
        if (!amount || amount < 50000) {
            return res.status(400).json({ success: false, message: 'Minimal penarikan adalah Rp 50.000.' });
        }

        // Validasi WA (karena kita butuh ini buat ngehubungin worker)
        if (!whatsapp) {
            return res.status(400).json({ success: false, message: 'Nomor WhatsApp wajib diisi.' });
        }

        // 2. Cari data worker
        const worker = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!worker) {
            return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        }

        // Karena Frontend udah ngirim bank & no_rekening, kita pakai data dari Frontend
        // Kalau kosong, baru pakai data dari profil worker
        const finalBank = bank || worker.bank;
        const finalRekening = no_rekening || worker.no_rekening;

        if (!finalBank || !finalRekening) {
            return res.status(400).json({ success: false, message: 'Silakan lengkapi data Bank dan No. Rekening.' });
        }

        // 3. Cek Saldo
        if (worker.saldo < amount) {
            return res.status(400).json({ success: false, message: `Saldo tidak cukup. Saldo Anda saat ini: Rp ${worker.saldo}` });
        }

        // 4. Proses Transaksi
        const result = await prisma.$transaction(async (tx) => {
            const updatedUser = await tx.user.update({
                where: { id: userId },
                data: { saldo: { decrement: amount } }
            });

            const newWithdrawal = await tx.withdrawal.create({
                data: {
                    workerId: userId,
                    amount: amount,
                    bank: finalBank,
                    no_rekening: finalRekening,
                    whatsapp: whatsapp,
                    status: 'PENDING'
                }
            });

            return { updatedUser, newWithdrawal };
        });

        // 👇 TEMBAK EMAIL KE SUPER ADMIN (Tanpa Await)
        // Biar admin langsung tau ada tagihan transfer yang harus diproses
        emailAdminRequestWithdraw(worker.nama, amount, finalBank, finalRekening);

        res.status(201).json({
            success: true,
            message: 'Permintaan penarikan dana berhasil dibuat dan sedang diproses admin.',
            data: result.newWithdrawal
        });

    } catch (error) {
        console.error('Error Request Withdraw:', error);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server saat memproses penarikan.' });
    }
};

// ============================================================
//  GET /api/withdraw/history
// ============================================================
export const getWithdrawHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await prisma.withdrawal.findMany({
            where: { workerId: userId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        console.error('Error Get Withdraw History:', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil riwayat penarikan.' });
    }
};