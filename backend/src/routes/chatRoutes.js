import express from 'express';
import { getActiveChatRooms, getTotalUnreadCount, markRoomAsRead, saveChatMessage, getChatMessages } from '../controllers/chatController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// GET total unread untuk badge (HARUS di atas param :orderId)
router.get('/unread-count', verifyToken, getTotalUnreadCount);

// GET semua room aktif
router.get('/rooms', verifyToken, getActiveChatRooms);

// PUT tandai dibaca
router.put('/read/:orderId', verifyToken, markRoomAsRead);

// CRUD Pesan
router.post('/save', verifyToken, saveChatMessage);
router.get('/:orderId', verifyToken, getChatMessages);


export default router;