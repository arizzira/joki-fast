import prisma from '../config/db.js';

// Get all notifications for the logged-in user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { createdAt: 'desc' },
            take: 20 // limit to last 20
        });

        // Count unread
        const unreadCount = await prisma.notification.count({
            where: { user_id: userId, is_read: false }
        });

        res.status(200).json({ success: true, data: notifications, unreadCount });
    } catch (error) {
        console.error("Error Get Notifications:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Mark a single notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const notif = await prisma.notification.findUnique({ where: { id } });
        if (!notif || notif.user_id !== userId) {
            return res.status(404).json({ success: false, message: "Notifikasi tidak ditemukan" });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { is_read: true }
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error("Error Mark Notification Read:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma.notification.updateMany({
            where: { user_id: userId, is_read: false },
            data: { is_read: true }
        });

        res.status(200).json({ success: true, message: "Semua notifikasi ditandai dibaca" });
    } catch (error) {
        console.error("Error Mark All Notifications Read:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
