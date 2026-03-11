import express from 'express';
// Jangan lupa import midtransWebhook-nya!
import { createInvoice, uploadBuktiBayar, verifyInvoice, getInvoicesByOrder, getMidtransToken, midtransWebhook } from '../controllers/invoiceController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadTugas } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Route khusus Midtrans (TIDAK PAKAI verifyToken)
router.post('/midtrans-webhook', midtransWebhook);

// Route untuk User
router.post('/create', verifyToken, createInvoice);
router.post('/:id/upload-bukti', verifyToken, uploadTugas.single('bukti_bayar'), uploadBuktiBayar);
router.put('/:id/verify', verifyToken, verifyInvoice);
router.get('/order/:orderId', verifyToken, getInvoicesByOrder);
router.post('/pay-midtrans', verifyToken, getMidtransToken);

export default router;