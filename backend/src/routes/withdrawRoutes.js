import express from 'express';
import { requestWithdraw, getWithdrawHistory } from '../controllers/withdrawController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Semua rute penarikan uang WAJIB login (pakai verifyToken)
router.post('/request', verifyToken, requestWithdraw);
router.get('/history', verifyToken, getWithdrawHistory);

export default router;