import prisma from '../config/db.js';

// POST /api/chat/save
// Simpan history chat
export const saveChatMessage = async (req, res) => {
    try {
        const { order_id, sender_id, role, text } = req.body;
        const msg = await prisma.chatMessage.create({
            data: {
                orderId: order_id,
                senderId: sender_id,
                role: role,
                text: text
            }
        });
        res.status(201).json({ success: true, data: msg });
    } catch (error) {
        console.error("Error save chat:", error);
        res.status(500).json({ success: false, message: "Gagal simpan pesan chat" });
    }
};

// GET /api/chat/:orderId
// Ambil history chat
export const getChatMessages = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Cari order asli untuk dapet ID UUID-nya (karena orderId dari params biasanya ORD-XXXX)
        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: orderId },
                    { order_id_custom: orderId }
                ]
            }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order tidak ditemukan." });
        }

        const messages = await prisma.chatMessage.findMany({
            where: { orderId: order.id },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        console.error("Error get chat history:", error);
        res.status(500).json({ success: false, message: "Gagal ambil history chat" });
    }
};

// GET /api/chat/rooms
// Mengambil daftar order (room) yang aktif, beserta last message dan jumlah unread
export const getActiveChatRooms = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role; // USER atau WORKER/ADMIN

        // Ambil orders di mana user terlibat (sebagai client atau worker)
        // yang statusnya bukan WAITING_WORKER dan bukan CANCELLED
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { client_id: userId },
                    { worker_id: userId }
                ],
                status_pengerjaan: {
                    in: ['NEGOTIATION', 'ON_PROGRESS', 'REVIEW', 'DONE']
                }
            },
            select: {
                id: true,
                order_id_custom: true,
                judul_tugas: true,
                status_pengerjaan: true,
                client: { select: { nama: true } },
                worker: { select: { nama: true } }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const rooms = await Promise.all(orders.map(async (order) => {
            // Ambil pesan terakhir (last_message)
            const lastMessage = await prisma.chatMessage.findFirst({
                where: { orderId: order.id },
                orderBy: { createdAt: 'desc' }
            });

            // Hitung pesan yang belum dibaca OLEH user ini
            // Pesan dianggap unread jika senderId != userId dan isRead == false
            const unreadCount = await prisma.chatMessage.count({
                where: {
                    orderId: order.id,
                    senderId: { not: userId },
                    isRead: false
                }
            });

            return {
                ...order,
                last_message: lastMessage,
                unread_count: unreadCount,
                other_party_name: role === 'USER' ? (order.worker?.nama || 'Worker') : order.client.nama
            };
        }));

        // Filter out ruangan yang belum ada chat sama sekali
        // Opsi: kita bisa aja nampilin semua room yg aktif, biarpun blum ada chat
        // const activeRooms = rooms.filter(r => r.last_message);

        // Sort: yang ada pesan unread di atas, terus berdasarkan tanggal pesan terakhir
        rooms.sort((a, b) => {
            if (a.unread_count > 0 && b.unread_count === 0) return -1;
            if (a.unread_count === 0 && b.unread_count > 0) return 1;
            const timeA = a.last_message ? new Date(a.last_message.createdAt).getTime() : 0;
            const timeB = b.last_message ? new Date(b.last_message.createdAt).getTime() : 0;
            return timeB - timeA;
        });

        res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        console.error("Error get chat rooms:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET /api/chat/unread-count
// Menghitung total semua unread chat dari semua room untuk badge di sidebar
export const getTotalUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Cari order di mana user ini adalah client atau worker
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { client_id: userId },
                    { worker_id: userId }
                ]
            },
            select: { id: true }
        });

        const orderIds = orders.map(o => o.id);

        const totalUnread = await prisma.chatMessage.count({
            where: {
                orderId: { in: orderIds },
                senderId: { not: userId },
                isRead: false
            }
        });

        res.status(200).json({ success: true, count: totalUnread });
    } catch (error) {
        console.error("Error get unread count:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// PUT /api/chat/read/:orderId
// Tandai pesan di suatu room sudah dibaca oleh user ini
// Pesan yang ditandai adalah pesan yang senderId != userId
export const markRoomAsRead = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: {
                OR: [
                    { id: orderId },
                    { order_id_custom: orderId }
                ]
            }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order tidak ditemukan." });
        }

        await prisma.chatMessage.updateMany({
            where: {
                orderId: order.id,
                senderId: { not: userId },
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        res.status(200).json({ success: true, message: "Pesan dibaca." });
    } catch (error) {
        console.error("Error mark read:", error);
        res.status(500).json({ success: false });
    }
};