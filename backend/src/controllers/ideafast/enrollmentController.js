import prisma from '../../config/db.js';
import midtransClient from 'midtrans-client';

const snap = new midtransClient.Snap({
    isProduction: false, // Pastiin ini false kalau masih sandbox/testing
    serverKey: process.env.MIDTRANS_SERVER_KEY, // Pastiin nama env-nya sama kayak di .env lu
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export const enrollCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.id; // Didapat dari middleware auth (Token JWT)

        // 1. Ambil detail kelasnya
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course) return res.status(404).json({ success: false, message: "Kelas tidak ditemukan" });

        // 2. Cek apakah user udah pernah enroll sebelumnya
        const existingEnrollment = await prisma.enrollment.findFirst({
            where: { userId, courseId }
        });

        // Kalau udah enroll dan udah bayar/gratis, langsung suruh masuk kelas
        if (existingEnrollment && existingEnrollment.hasPaid) {
            return res.status(200).json({ success: true, message: "Lanjut belajar!", redirect: `/elearning/learn/${courseId}` });
        }

        // =====================================
        // JALUR 1: KELAS GRATIS (FREE_ALL)
        // =====================================
        if (course.price === 0 || course.type === 'FREE_ALL') {
            if (!existingEnrollment) {
                await prisma.enrollment.create({
                    data: { userId, courseId, hasPaid: true, progressSmallBranch: [] }
                });
            } else if (!existingEnrollment.hasPaid) {
                await prisma.enrollment.update({
                    where: { id: existingEnrollment.id }, data: { hasPaid: true }
                });
            }
            return res.status(200).json({ success: true, message: "Berhasil daftar kelas gratis!", redirect: `/elearning/learn/${courseId}` });
        }

        // =====================================
        // JALUR 2: KELAS BERBAYAR (MIDTRANS)
        // =====================================
        // Bikin order ID unik ala sultan
        const orderIdCustom = `ELR-${courseId.substring(0, 4)}-${userId.substring(0, 4)}-${Date.now()}`;

        // Simpan transaksi "PENDING" ke database
        await prisma.courseTransaction.create({
            data: { orderId: orderIdCustom, userId, courseId, amount: course.price, status: 'PENDING' }
        });

        // Bikin history enrollment "BELUM BAYAR"
        if (!existingEnrollment) {
            await prisma.enrollment.create({
                data: { userId, courseId, hasPaid: false, progressSmallBranch: [] }
            });
        }

        // Siapin parameter buat dilempar ke Midtrans
        const parameter = {
            transaction_details: {
                order_id: orderIdCustom,
                gross_amount: course.price
            },
            customer_details: {
                first_name: req.user.nama, // Asumsi req.user nyimpen nama
                email: req.user.email
            }
        };

        const midtransToken = await snap.createTransactionToken(parameter);

        return res.status(200).json({
            success: true,
            message: "Silakan selesaikan pembayaran",
            snapToken: midtransToken
        });

    } catch (error) {
        console.error("Error Enrollment:", error);
        res.status(500).json({ success: false, message: "Gagal memproses pendaftaran." });
    }
};