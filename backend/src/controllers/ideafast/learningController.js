import prisma from '../../config/db.js';

// ==========================================
// 1. AMBIL DATA RUANG KELAS (KHUSUS MURID YG UDAH ENROLL)
// ==========================================
export const getLearningCourseData = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;

        // Cek apakah user beneran udah enroll dan udah bayar/gratis
        const enrollment = await prisma.enrollment.findFirst({
            where: { userId, courseId, hasPaid: true }
        });

        if (!enrollment) {
            return res.status(403).json({ success: false, message: "Akses ditolak! Kamu belum mendaftar atau belum membayar kelas ini." });
        }

        // Tarik data kelas FULL sampai ke isi materinya
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                quizzes: true, // Ujian Akhir
                classes: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        quizzes: true, // Evaluasi Bab
                        branchClasses: {
                            orderBy: { orderIndex: 'asc' },
                            include: {
                                smallBranches: { orderBy: { orderIndex: 'asc' } }, // Ini materi teksnya!
                                quizzes: true // Quiz cabang (kalau ada)
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: course,
            progress: enrollment.progressSmallBranch // Array ID materi yang udah diselesaikan
        });

    } catch (error) {
        console.error("Error Get Learning Data:", error);
        res.status(500).json({ success: false, message: "Gagal memuat ruang kelas." });
    }
};

// ==========================================
// 2. UPDATE PROGRESS (TANDAI MATERI SELESAI)
// ==========================================
export const markProgressDone = async (req, res) => {
    try {
        const { courseId, smallBranchId } = req.body;
        const userId = req.user.id;

        const enrollment = await prisma.enrollment.findFirst({
            where: { userId, courseId }
        });

        if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment tidak ditemukan." });

        // Kalau ID materi belum ada di array progress, tambahin!
        if (!enrollment.progressSmallBranch.includes(smallBranchId)) {
            const updatedEnrollment = await prisma.enrollment.update({
                where: { id: enrollment.id },
                data: {
                    progressSmallBranch: {
                        push: smallBranchId // Masukin ID materi ke array progress
                    }
                }
            });
            return res.status(200).json({ success: true, message: "Progress diupdate!", progress: updatedEnrollment.progressSmallBranch });
        }

        res.status(200).json({ success: true, message: "Materi ini sudah diselesaikan sebelumnya." });

    } catch (error) {
        console.error("Error Update Progress:", error);
        res.status(500).json({ success: false, message: "Gagal menyimpan progress." });
    }
};