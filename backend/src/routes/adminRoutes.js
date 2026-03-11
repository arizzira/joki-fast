import express from 'express';
import { verifyToken, isAdmin } from '../middlewares/authMiddleware.js';
import {
    getDashboardStats,
    getAllWithdrawals,
    updateWithdrawalStatus,
    getWorkers,
    updateWorkerStatus,
    getAllOrdersAdmin
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', verifyToken, isAdmin, getDashboardStats);
router.get('/withdrawals', verifyToken, isAdmin, getAllWithdrawals);
router.put('/withdrawals/:id', verifyToken, isAdmin, updateWithdrawalStatus);
router.get('/workers', verifyToken, isAdmin, getWorkers);
router.put('/workers/:id/status', verifyToken, isAdmin, updateWorkerStatus);
router.get('/orders', verifyToken, isAdmin, getAllOrdersAdmin);

export default router;