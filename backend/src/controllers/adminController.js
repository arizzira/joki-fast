import prisma from '../config/db.js';

export const getDashboardStats = async (req, res) => {
    try {
        // 1. Hitung total User & Worker
        const totalUsers = await prisma.user.count({ where: { role: 'USER' } });
        const totalWorkers = await prisma.user.count({ where: { role: 'WORKER' } });

        // 2. Hitung total Transaksi
        const totalOrders = await prisma.order.count();
        const completedOrders = await prisma.order.count({ where: { status_pengerjaan: 'DONE' } });

        // 3. Hitung Pemasukan Bersih Platform (20% dari order yang LUNAS)
        const lunasOrders = await prisma.order.findMany({
            where: { status_pembayaran: 'LUNAS' },
            select: { harga_deal: true, harga_total: true }
        });

        const totalRevenue = lunasOrders.reduce((sum, order) => {
            const harga = order.harga_deal || order.harga_total;
            return sum + Math.floor(harga * 0.20); // Ambil jatah 20%
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalWorkers,
                totalOrders,
                completedOrders,
                totalRevenue
            }
        });
    } catch (error) {
        console.error("Error Get Admin Stats:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil statistik dashboard." });
    }
};

// ============================================================
// API ADMIN: MANAJEMEN PENARIKAN DANA
// ============================================================

// 1. Ambil semua antrean penarikan dana
export const getAllWithdrawals = async (req, res) => {
    try {
        const withdrawals = await prisma.withdrawal.findMany({
            include: {
                worker: { select: { nama: true, email: true, whatsappNumber: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: withdrawals });
    } catch (error) {
        console.error("Error Get All Withdrawals:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data penarikan." });
    }
};

// 2. Update status penarikan (COMPLETED / REJECTED)
export const updateWithdrawalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, catatan_admin } = req.body; // status = 'PROCESSING', 'COMPLETED', atau 'REJECTED'

        const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
        if (!withdrawal) return res.status(404).json({ success: false, message: "Data penarikan tidak ditemukan." });

        // Kalau ditolak, uang harus dikembalikan (Refund) ke saldo Worker
        if (status === 'REJECTED' && withdrawal.status !== 'REJECTED') {
            await prisma.$transaction([
                prisma.withdrawal.update({
                    where: { id },
                    data: { status, catatan_admin }
                }),
                prisma.user.update({
                    where: { id: withdrawal.workerId },
                    data: { saldo: { increment: withdrawal.amount } } // Balikin duitnya
                })
            ]);
        } else {
            // Kalau cuma update ke PROCESSING atau COMPLETED
            await prisma.withdrawal.update({
                where: { id },
                data: { status, catatan_admin: catatan_admin || null }
            });
        }

        res.status(200).json({ success: true, message: `Status penarikan berhasil diubah menjadi ${status}.` });
    } catch (error) {
        console.error("Error Update Withdrawal:", error);
        res.status(500).json({ success: false, message: "Gagal mengubah status penarikan." });
    }
};

export const getWorkers = async (req, res) => {
    try {
        const workers = await prisma.user.findMany({
            where: { role: 'WORKER' },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ success: true, data: workers });
    } catch (error) {
        console.error("Error Get Workers:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil data mitra." });
    }
};

// 2. Update Status Worker (APPROVED / REJECTED)
export const updateWorkerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Isinya 'APPROVED' atau 'REJECTED'

        await prisma.user.update({
            where: { id },
            data: { status_worker: status }
        });

        // Tembak Notifikasi ke Worker biar mereka tau
        const title = status === 'APPROVED' ? "Akun Diverifikasi! 🎉" : "Pendaftaran Ditolak ❌";
        const message = status === 'APPROVED'
            ? "Selamat! Akun Mitra JokiFast Anda telah disetujui. Anda sekarang bisa mengambil tugas."
            : "Mohon maaf, pendaftaran Anda sebagai Mitra belum dapat kami terima saat ini.";

        await prisma.notification.create({
            data: { user_id: id, title, message }
        });

        res.status(200).json({ success: true, message: `Status mitra berhasil diubah menjadi ${status}.` });
    } catch (error) {
        console.error("Error Update Worker Status:", error);
        res.status(500).json({ success: false, message: "Gagal mengubah status mitra." });
    }
};

export const getAllOrdersAdmin = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                client: { select: { nama: true, email: true } },
                worker: { select: { nama: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error("Error Get All Orders Admin:", error);
        res.status(500).json({ success: false, message: "Gagal mengambil seluruh data pesanan." });
    }
};