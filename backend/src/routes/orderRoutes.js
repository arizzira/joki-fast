import express from 'express';
import {
    createOrder, getAllOrders, getOrderById, getMarketOrders, getWorkerOrders,
    takeOrder, submitDeal, validateDeal, cancelDeal,
    addResult, deleteResult, updateProgress, completeOrder, acceptOrder, requestRevision,
    estimatePriceWithAI, berikanRating
} from '../controllers/orderController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadTugas } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/create', verifyToken, uploadTugas.single('file_tugas'), createOrder);
router.post('/estimate-price', estimatePriceWithAI);

// Worker routes (harus di atas /:id)
router.get('/worker', verifyToken, getWorkerOrders);
router.get('/market', verifyToken, getMarketOrders);

router.get('/', verifyToken, getAllOrders);
router.get('/:id', verifyToken, getOrderById);
router.put('/:id/take', verifyToken, takeOrder);

// === Negosiasi Deal ===
router.post('/:id/submit-deal', verifyToken, submitDeal);
router.post('/:id/validate-deal', verifyToken, validateDeal);
router.put('/:id/cancel-deal', verifyToken, cancelDeal);

// === Delivery & Review ===
router.post('/:id/add-result', verifyToken, uploadTugas.single('file'), addResult);
router.delete('/:id/result/:resultId', verifyToken, deleteResult);
router.put('/:id/progress', verifyToken, updateProgress);
router.put('/:id/complete', verifyToken, completeOrder);
router.put('/:id/accept', verifyToken, acceptOrder);
router.post('/:id/revision', verifyToken, requestRevision);

// === Rating ===
router.post('/:id/rating', verifyToken, berikanRating);

export default router;