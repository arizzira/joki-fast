// File: src/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Akses ditolak. Token tidak ditemukan.',
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; // { id, email, role }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token tidak valid atau sudah kadaluarsa.',
        });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        // req.user ini hasil lemparan dari verifyToken
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: "Akses Ditolak! Anda bukan Super Admin."
            });
        }
        next(); // Kalau beneran Admin, silakan masuk bos!
    } catch (error) {
        console.error("Middleware Admin Error:", error);
        return res.status(500).json({ success: false, message: "Kesalahan server saat cek akses admin." });
    }
};
