// File: src/controllers/invoiceController.js
import prisma from '../config/db.js';
import midtransClient from 'midtrans-client';

// 👇 IMPORT FUNGSI EMAIL KITA
import { emailPembayaranSukses } from '../utils/emailServices.js';

const getSnapInstance = () => {
    return new midtransClient.Snap({
        isProduction: false,
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY
    });
};

export const createInvoice = async (req, res) => {
    try {
        const { order_id, tipe } = req.body;
        const userId = req.user.id;

        const order = await prisma.order.findUnique({ where: { id: order_id } });
        if (!order) return res.status(404).json({ success: false, message: "Order tidak ditemukan." });

        if (order.client_id !== userId) {
            return res.status(403).json({ success: false, message: "Anda bukan pemilik pesanan ini." });
        }

        if (!['DP', 'PELUNASAN'].includes(tipe)) {
            return res.status(400).json({ success: false, message: "Tipe invoice harus DP atau PELUNASAN." });
        }

        const existingInvoice = await prisma.invoice.findFirst({
            where: { order_id, tipe }
        });

        if (existingInvoice) {
            return res.status(400).json({ success: false, message: `Invoice ${tipe} sudah dibuat.`, data: existingInvoice });
        }

        let jumlah;
        if (tipe === 'DP') {
            if (!order.dp_amount) return res.status(400).json({ success: false, message: "Harga DP belum ditentukan." });
            jumlah = order.dp_amount;
        } else {
            if (!order.harga_deal || !order.dp_amount) return res.status(400).json({ success: false, message: "Harga deal belum ditentukan." });
            jumlah = order.harga_deal - order.dp_amount;
        }

        const invoice = await prisma.invoice.create({
            data: { order_id, jumlah, tipe, status: 'PENDING' }
        });

        res.status(201).json({ success: true, message: `Invoice ${tipe} berhasil dibuat.`, data: invoice });
    } catch (error) {
        console.error("Error Create Invoice:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// POST /api/invoices/:id/upload-bukti — Upload Bukti Bayar
// ============================================================
export const uploadBuktiBayar = async (req, res) => {
    try {
        const { id } = req.params;

        const invoice = await prisma.invoice.findUnique({ where: { id } });
        if (!invoice) return res.status(404).json({ success: false, message: "Invoice tidak ditemukan." });

        const fileUrl = req.file ? req.file.path : null;
        if (!fileUrl) return res.status(400).json({ success: false, message: "File bukti bayar wajib diupload." });

        const updated = await prisma.invoice.update({
            where: { id },
            data: { link_bukti_bayar: fileUrl, status: 'WAITING_VERIFICATION' }
        });

        const order = await prisma.order.findUnique({ where: { id: invoice.order_id } });
        if (order?.worker_id) {
            await prisma.notification.create({
                data: {
                    user_id: order.worker_id,
                    title: `Bukti ${invoice.tipe} Diterima`,
                    message: `Klien sudah upload bukti pembayaran ${invoice.tipe} untuk ${order.order_id_custom}.`
                }
            });
        }

        res.status(200).json({ success: true, message: "Bukti bayar berhasil diupload.", data: updated });
    } catch (error) {
        console.error("Error Upload Bukti:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// PUT /api/invoices/:id/verify — Verifikasi Pembayaran (Admin/Simulasi)
// ============================================================
export const verifyInvoice = async (req, res) => {
    try {
        const { id } = req.params;

        // 👇 Tambahin include client biar dapet emailnya
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                order: {
                    include: { client: true }
                }
            }
        });
        if (!invoice) return res.status(404).json({ success: false, message: "Invoice tidak ditemukan." });

        // Update invoice status
        await prisma.invoice.update({
            where: { id },
            data: { status: 'VERIFIED' }
        });

        const order = invoice.order;

        // 👇 TEMBAK EMAIL KE KLIEN (Tanpa Await)
        if (order.client?.email) {
            emailPembayaranSukses(order.client.email, order.judul_tugas, invoice.tipe, invoice.jumlah);
        }

        if (invoice.tipe === 'DP') {
            await prisma.order.update({
                where: { id: order.id },
                data: { status_pembayaran: 'DP_DIBAYAR' }
            });

            await prisma.notification.create({
                data: { user_id: order.client_id, title: "DP Terverifikasi ✅", message: `Pembayaran DP untuk ${order.order_id_custom} sudah dikonfirmasi. Worker bisa mulai mengerjakan.` }
            });
            if (order.worker_id) {
                await prisma.notification.create({
                    data: { user_id: order.worker_id, title: "DP Dibayar! 💰", message: `Klien sudah bayar DP untuk ${order.order_id_custom}. Silakan mulai mengerjakan tugas.` }
                });
            }
        } else if (invoice.tipe === 'PELUNASAN') {
            await prisma.order.update({
                where: { id: order.id },
                data: { status_pembayaran: 'LUNAS', status_pengerjaan: 'DONE' }
            });

            if (order.worker_id) {
                const hargaAkhir = order.harga_deal || order.harga_total;
                const upahWorker = Math.floor(hargaAkhir * 0.8);

                await prisma.user.update({
                    where: { id: order.worker_id },
                    data: { saldo: { increment: upahWorker } }
                });
            }

            await prisma.notification.create({
                data: { user_id: order.client_id, title: "Pesanan Selesai! 🎉", message: `Pembayaran lunas untuk ${order.order_id_custom}. Pesanan telah selesai.` }
            });
            if (order.worker_id) {
                await prisma.notification.create({
                    data: { user_id: order.worker_id, title: "Pembayaran Lunas! 🎉", message: `Klien sudah melunasi ${order.order_id_custom}. Saldo telah masuk ke dompet Anda!` }
                });
            }
        }

        res.status(200).json({ success: true, message: `Invoice ${invoice.tipe} berhasil diverifikasi.` });
    } catch (error) {
        console.error("Error Verify Invoice:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// GET /api/invoices/order/:orderId — Get Invoices by Order
// ============================================================
export const getInvoicesByOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const invoices = await prisma.invoice.findMany({
            where: { order_id: orderId },
            orderBy: { createdAt: 'asc' }
        });
        res.status(200).json({ success: true, data: invoices });
    } catch (error) {
        console.error("Error Get Invoices:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};


export const getMidtransToken = async (req, res) => {
    const snap = getSnapInstance();
    console.log("➡️ [API] Masuk ke endpoint /pay-midtrans");

    try {
        const { orderId, tipe } = req.body;
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { client: true }
        });

        if (!order) return res.status(404).json({ success: false, message: "Order tidak ditemukan" });

        const invoice = await prisma.invoice.findFirst({
            where: { order_id: orderId, tipe: tipe }
        });

        if (!invoice) return res.status(404).json({ success: false, message: "Invoice belum dibuat." });
        if (invoice.status === 'LUNAS' || invoice.status === 'VERIFIED') {
            return res.status(400).json({ success: false, message: "Tagihan ini sudah lunas!" });
        }

        const parameter = {
            transaction_details: {
                order_id: `INV-${invoice.id.substring(0, 8)}-${Date.now()}`,
                gross_amount: invoice.jumlah
            },
            item_details: [{
                id: invoice.id,
                price: invoice.jumlah,
                quantity: 1,
                name: `Tagihan ${tipe} JokiFast`
            }],
            customer_details: {
                first_name: order.client.nama || "Klien JokiFast",
                email: (order.client.email && order.client.email.includes('@')) ? order.client.email : "jokifast.user@gmail.com",
                phone: order.wa_klien || "081234567890"
            }
        };

        console.log("➡️ Mengirim parameter ke Midtrans...");
        const transaction = await snap.createTransaction(parameter);
        console.log("➡️ ✅ BERHASIL! Token Midtrans didapat:", transaction.token);

        res.status(200).json({
            success: true,
            token: transaction.token
        });

    } catch (error) {
        console.error("🔴🔴🔴 MIDTRANS ERROR DETAIL:", error.message || error);
        res.status(500).json({ success: false, message: "Gagal membuat token Midtrans", error: error.message });
    }
};

export const midtransWebhook = async (req, res) => {
    const snap = getSnapInstance();
    try {
        const { order_id, transaction_status, fraud_status } = req.body;
        console.log(`➡️ [WEBHOOK] Notif Masuk: ID ${order_id} | Status: ${transaction_status}`);

        if (!order_id || !order_id.startsWith('INV-')) {
            console.log("⚠️ [WEBHOOK] Mengabaikan notifikasi dummy/test.");
            return res.status(200).json({ message: "Test notification ignored" });
        }

        const notification = await snap.transaction.notification(req.body);
        const orderIdMidtrans = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        const shortInvoiceId = orderIdMidtrans.split('-')[1];

        // 👇 Tambahin include client biar emailnya bisa ketarik
        const invoice = await prisma.invoice.findFirst({
            where: { id: { startsWith: shortInvoiceId } },
            include: {
                order: {
                    include: { client: true }
                }
            }
        });

        if (!invoice) {
            console.log("🔴 [WEBHOOK] Invoice nggak ketemu!");
            return res.status(404).json({ message: "Invoice not found" });
        }

        const order = invoice.order;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'accept' || transactionStatus === 'settlement') {

                // Cek biar nggak ngirim email dobel kalau status udah verified dari awal
                if (invoice.status !== 'VERIFIED') {
                    await prisma.invoice.update({
                        where: { id: invoice.id },
                        data: { status: 'VERIFIED' }
                    });

                    // 👇 TEMBAK EMAIL KE KLIEN DARI WEBHOOK MIDTRANS
                    if (order.client?.email) {
                        emailPembayaranSukses(order.client.email, order.judul_tugas, invoice.tipe, invoice.jumlah);
                    }

                    if (invoice.tipe === 'DP') {
                        await prisma.order.update({
                            where: { id: order.id },
                            data: { status_pembayaran: 'DP_DIBAYAR' }
                        });
                    } else if (invoice.tipe === 'PELUNASAN') {
                        await prisma.order.update({
                            where: { id: order.id },
                            data: { status_pembayaran: 'LUNAS', status_pengerjaan: 'DONE' }
                        });

                        // Tambahin saldo otomatis juga dari Webhook
                        if (order.worker_id) {
                            const hargaAkhir = order.harga_deal || order.harga_total;
                            const upahWorker = Math.floor(hargaAkhir * 0.8);

                            await prisma.user.update({
                                where: { id: order.worker_id },
                                data: { saldo: { increment: upahWorker } }
                            });
                        }
                    }
                    console.log(`✅ [WEBHOOK] MANTAP! Tagihan ${invoice.tipe} lunas otomatis & Email terkirim!`);
                }
            }
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            await prisma.invoice.update({ where: { id: invoice.id }, data: { status: 'FAILED' } });
        }

        res.status(200).json({ status: 'success' });
    } catch (error) {
        if (error.httpStatusCode === '404') return res.status(200).json({ message: "Ignored 404" });
        console.error("🔴 [WEBHOOK] Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};