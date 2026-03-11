import prisma from '../config/db.js';
import { validateChatNegotiation, getGroqClient } from '../services/groqService.js';

// 👇 IMPORT FUNGSI EMAIL KITA
import { emailOrderBaruKeWorker, emailOrderDiambil, emailTugasSelesai } from '../utils/emailServices.js';

// ============================================================
// POST /api/orders/create
// ============================================================
export const createOrder = async (req, res) => {
    try {
        const { nama_klien, wa_klien, judul_tugas, deskripsi, harga_total } = req.body;
        const client_id = req.user.id;
        const customOrderId = `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
        const file_tugas = req.file ? req.file.path : null;

        const newOrder = await prisma.order.create({
            data: {
                order_id_custom: customOrderId,
                client_id,
                nama_klien,
                wa_klien,
                judul_tugas,
                deskripsi: `[Tipe: ${req.body.type || 'Lainnya'} | Deadline: ${req.body.deadline || '-'}] \n\n${deskripsi}`,
                harga_total: parseInt(harga_total) || 0,
                file_tugas
            }
        });

        await prisma.notification.create({
            data: {
                user_id: client_id,
                title: "Pesanan Diterima",
                message: `Pesanan ${customOrderId} (${judul_tugas}) berhasil dibuat dan sedang menunggu worker.`,
            }
        });

        // 👇 TEMBAK EMAIL KE SEMUA WORKER YANG APPROVED (Biar Rebutan)
        // Jalanin di background biar nggak bikin lola
        prisma.user.findMany({
            where: { role: 'WORKER', status_worker: 'APPROVED' },
            select: { email: true }
        }).then(workers => {
            workers.forEach(w => {
                if (w.email) emailOrderBaruKeWorker(w.email, judul_tugas, newOrder.harga_total);
            });
        }).catch(err => console.error("Gagal broadcast email order baru:", err));

        res.status(201).json({ success: true, message: "Order Joki Berhasil Dibuat!", data: newOrder });
    } catch (error) {
        console.error("Error Create Order:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// GET /api/orders/:id
// ============================================================
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                client: { select: { nama: true, email: true } },
                worker: { select: { nama: true, email: true } },
                results: { orderBy: { createdAt: 'desc' } },
                invoices: { orderBy: { createdAt: 'asc' } }
            }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Pesanan tidak ditemukan" });
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        console.error("Error Get Order By ID:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// GET /api/orders (User: Pesanan Saya)
// ============================================================
export const getAllOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await prisma.order.findMany({
            where: { client_id: userId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, data: orders });
    } catch (error) {
        console.error("Error Get All Orders:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// GET /api/orders/worker (Worker: Tugas yang dia tangani)
// ============================================================
export const getWorkerOrders = async (req, res) => {
    try {
        const workerId = req.user.id;
        const workerOrders = await prisma.order.findMany({
            where: { worker_id: workerId },
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { nama: true } } }
        });

        res.status(200).json({ success: true, data: workerOrders });
    } catch (error) {
        console.error("Error Get Worker Orders:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// GET /api/orders/market (Worker: Bursa Tugas)
// ============================================================
export const getMarketOrders = async (req, res) => {
    try {
        const marketOrders = await prisma.order.findMany({
            where: { status_pengerjaan: 'WAITING_WORKER' },
            orderBy: { createdAt: 'desc' },
            include: { client: { select: { nama: true } } }
        });

        res.status(200).json({ success: true, data: marketOrders });
    } catch (error) {
        console.error("Error Get Market Orders:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// PUT /api/orders/:id/take (Worker Kunci Orderan → NEGOTIATION)
// ============================================================
export const takeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.user.id;

        const updatedOrder = await prisma.order.updateMany({
            where: {
                id,
                worker_id: null,
                status_pengerjaan: 'WAITING_WORKER'
            },
            data: {
                worker_id: workerId,
                status_pengerjaan: 'NEGOTIATION'
            }
        });

        if (updatedOrder.count === 0) {
            return res.status(400).json({ success: false, message: "Tugas ini sudah diambil worker lain." });
        }

        const order = await prisma.order.findUnique({
            where: { id },
            include: { client: true, worker: true }
        });

        if (order) {
            await prisma.notification.create({
                data: {
                    user_id: order.client_id,
                    title: "Worker Menemukan Tugas Anda!",
                    message: `Seorang worker sudah mengambil pesanan ${order.order_id_custom}. Silakan masuk ke ruang negosiasi untuk diskusi harga.`,
                }
            });

            // 👇 TEMBAK EMAIL KE KLIEN
            if (order.client?.email) {
                emailOrderDiambil(order.client.email, order.judul_tugas, order.worker?.nama || 'Mitra JokiFast');
            }
        }

        res.status(200).json({ success: true, message: "Tugas berhasil dikunci! Silakan negosiasi.", data: order });
    } catch (error) {
        console.error("Error Take Order:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// POST /api/orders/:id/submit-deal (Worker Submit Harga Deal)
// ============================================================
export const submitDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.user.id;
        const { dp_amount, harga_deal } = req.body;

        if (!dp_amount || !harga_deal) {
            return res.status(400).json({ success: false, message: "DP dan harga deal wajib diisi." });
        }

        if (dp_amount >= harga_deal) {
            return res.status(400).json({ success: false, message: "DP harus lebih kecil dari harga deal." });
        }

        const order = await prisma.order.findFirst({
            where: { id, worker_id: workerId, status_pengerjaan: 'NEGOTIATION' }
        });

        if (!order) {
            return res.status(403).json({ success: false, message: "Order tidak ditemukan atau bukan milik Anda." });
        }

        const updated = await prisma.order.update({
            where: { id },
            data: {
                dp_amount: parseInt(dp_amount),
                harga_deal: parseInt(harga_deal),
                deal_submitted: true,
                deal_validated: false
            }
        });

        res.status(200).json({
            success: true,
            message: "Deal berhasil disubmit. Menunggu validasi AI...",
            data: { dp_amount: updated.dp_amount, harga_deal: updated.harga_deal }
        });
    } catch (error) {
        console.error("Error Submit Deal:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// POST /api/orders/:id/validate-deal (AI Validasi Chat)
// ============================================================
export const validateDeal = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.user.id;

        const order = await prisma.order.findFirst({
            where: { id, worker_id: workerId, deal_submitted: true, status_pengerjaan: 'NEGOTIATION' },
            include: { client: true, worker: true }
        });

        if (!order) {
            return res.status(400).json({ success: false, message: "Deal belum disubmit atau order tidak valid." });
        }

        const chatMessages = await prisma.chatMessage.findMany({
            where: { orderId: id },
            orderBy: { createdAt: 'asc' }
        });

        if (chatMessages.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Chat terlalu singkat. Diskusikan harga lebih detail sebelum validasi."
            });
        }

        const validation = await validateChatNegotiation(
            chatMessages,
            order.dp_amount,
            order.harga_deal
        );

        if (validation.passed) {
            await prisma.order.update({
                where: { id },
                data: {
                    deal_validated: true,
                    harga_total: order.harga_deal,
                    status_pengerjaan: 'ON_PROGRESS'
                }
            });

            await prisma.notification.create({
                data: {
                    user_id: order.client_id,
                    title: "Deal Disetujui! 🎉",
                    message: `Negosiasi pesanan ${order.order_id_custom} berhasil. Harga deal: Rp${order.harga_deal.toLocaleString('id-ID')}, DP: Rp${order.dp_amount.toLocaleString('id-ID')}. Silakan bayar DP untuk memulai pengerjaan.`,
                }
            });

            await prisma.notification.create({
                data: {
                    user_id: workerId,
                    title: "Validasi Berhasil! ✅",
                    message: `Deal untuk ${order.order_id_custom} lolos validasi. Menunggu pembayaran DP dari klien.`,
                }
            });
            // Opsional: Bisa tembak email "Waktunya bayar DP" ke sini kalau mau, 
            // tapi notifikasi in-app aja biasanya udah cukup buat deal.
        }

        res.status(200).json({
            success: true,
            validated: validation.passed,
            validation: {
                priceMatch: validation.priceMatch,
                dpMatch: validation.dpMatch,
                hasPersonalData: validation.hasPersonalData,
                personalDataFound: validation.personalDataFound || [],
                priceAnalysis: validation.priceAnalysis,
                dpAnalysis: validation.dpAnalysis,
                reasons: validation.reasons
            }
        });
    } catch (error) {
        console.error("Error Validate Deal:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// PUT /api/orders/:id/cancel-deal (Batalkan Deal → Kembali ke Bursa)
// ============================================================
export const cancelDeal = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findFirst({
            where: { id, status_pengerjaan: 'NEGOTIATION' }
        });

        if (!order) {
            return res.status(400).json({ success: false, message: "Order tidak dalam status negosiasi." });
        }

        await prisma.order.update({
            where: { id },
            data: {
                worker_id: null,
                status_pengerjaan: 'WAITING_WORKER',
                deal_submitted: false,
                deal_validated: false,
                harga_deal: null,
                dp_amount: null
            }
        });

        await prisma.notification.create({
            data: {
                user_id: order.client_id,
                title: "Negosiasi Dibatalkan",
                message: `Negosiasi untuk ${order.order_id_custom} dibatalkan. Pesanan Anda kembali ke bursa tugas.`,
            }
        });

        if (order.worker_id) {
            await prisma.notification.create({
                data: {
                    user_id: order.worker_id,
                    title: "Deal Dibatalkan",
                    message: `Negosiasi untuk ${order.order_id_custom} dibatalkan karena tidak lolos validasi.`,
                }
            });
        }

        res.status(200).json({ success: true, message: "Deal dibatalkan. Order kembali ke bursa." });
    } catch (error) {
        console.error("Error Cancel Deal:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// POST /api/orders/:id/add-result (Worker Kirim Hasil — File/Link/Photo)
// ============================================================
export const addResult = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.user.id;
        const { tipe, url, caption } = req.body;

        const order = await prisma.order.findFirst({ where: { id, worker_id: workerId } });
        if (!order) return res.status(403).json({ success: false, message: "Bukan tugas Anda." });

        let resultUrl = url;
        let namaFile = null;

        if ((tipe === 'FILE' || tipe === 'PHOTO') && req.file) {
            resultUrl = req.file.path;
            namaFile = req.file.originalname;
        }

        if (!resultUrl) return res.status(400).json({ success: false, message: "URL atau file wajib diisi." });
        if (!['FILE', 'LINK', 'PHOTO'].includes(tipe)) return res.status(400).json({ success: false, message: "Tipe harus FILE, LINK, atau PHOTO." });

        const result = await prisma.orderResult.create({
            data: { order_id: id, tipe, url: resultUrl, caption: caption || null, nama_file: namaFile }
        });

        await prisma.order.update({ where: { id }, data: { file_hasil: resultUrl } });

        await prisma.notification.create({
            data: { user_id: order.client_id, title: tipe === 'LINK' ? 'Worker Kirim Link! 🔗' : 'Worker Upload File! 📎', message: `Worker mengirim hasil untuk ${order.order_id_custom}.${caption ? ' — ' + caption : ''}` }
        });

        res.status(201).json({ success: true, message: "Hasil berhasil dikirim.", data: result });
    } catch (error) {
        console.error("Error Add Result:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// DELETE /api/orders/:id/result/:resultId (Hapus Hasil)
// ============================================================
export const deleteResult = async (req, res) => {
    try {
        const { id, resultId } = req.params;
        const workerId = req.user.id;

        const order = await prisma.order.findFirst({ where: { id, worker_id: workerId } });
        if (!order) return res.status(403).json({ success: false, message: "Bukan tugas Anda." });

        await prisma.orderResult.delete({ where: { id: resultId } });
        res.status(200).json({ success: true, message: "Hasil dihapus." });
    } catch (error) {
        console.error("Error Delete Result:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// PUT /api/orders/:id/progress (Worker Update Progress)
// ============================================================
export const updateProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.user.id;
        const { progress_note } = req.body;

        const order = await prisma.order.findFirst({ where: { id, worker_id: workerId } });
        if (!order) return res.status(403).json({ success: false, message: "Bukan tugas Anda." });

        await prisma.order.update({ where: { id }, data: { progress_note } });

        await prisma.notification.create({
            data: { user_id: order.client_id, title: "Update Progress 📊", message: `Worker update progress ${order.order_id_custom}: ${progress_note}` }
        });

        res.status(200).json({ success: true, message: "Progress diupdate." });
    } catch (error) {
        console.error("Error Update Progress:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// PUT /api/orders/:id/complete (Worker Tandai Selesai → REVIEW)
// ============================================================
export const completeOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const workerId = req.user.id;

        const order = await prisma.order.findFirst({
            where: { id, worker_id: workerId, status_pengerjaan: 'ON_PROGRESS' },
            include: { results: true, client: true }
        });
        if (!order) return res.status(400).json({ success: false, message: "Order tidak valid atau belum dalam tahap pengerjaan." });

        if (order.results.length === 0 && !order.file_hasil) {
            return res.status(400).json({ success: false, message: "Kirim minimal 1 hasil (file/link/foto) sebelum menandai selesai." });
        }

        await prisma.order.update({
            where: { id },
            data: { status_pengerjaan: 'REVIEW' }
        });

        await prisma.notification.create({
            data: {
                user_id: order.client_id,
                title: "Tugas Sudah Selesai Dikerjakan! 🎓",
                message: `Worker sudah menyelesaikan ${order.order_id_custom}. Silakan review dan terima hasilnya.`
            }
        });

        // 👇 TEMBAK EMAIL KE KLIEN KALO TUGAS UDAH KELAR
        if (order.client?.email) {
            emailTugasSelesai(order.client.email, order.judul_tugas);
        }

        res.status(200).json({ success: true, message: "Tugas ditandai selesai. Menunggu review klien." });
    } catch (error) {
        console.error("Error Complete Order:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// PUT /api/orders/:id/accept (User Terima Hasil)
// ============================================================
export const acceptOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const order = await prisma.order.findFirst({
            where: { id, client_id: userId, status_pengerjaan: 'REVIEW' }
        });
        if (!order) return res.status(400).json({ success: false, message: "Order tidak valid atau belum dalam tahap review." });

        const existingPelunasan = await prisma.invoice.findFirst({
            where: { order_id: id, tipe: 'PELUNASAN' }
        });

        if (!existingPelunasan) {
            const sisa = (order.harga_deal || order.harga_total) - (order.dp_amount || 0);
            if (sisa > 0) {
                await prisma.invoice.create({
                    data: {
                        order_id: id,
                        jumlah: sisa,
                        tipe: 'PELUNASAN',
                        status: 'PENDING'
                    }
                });
            }
        }

        await prisma.order.update({
            where: { id },
            data: { status_pengerjaan: 'DONE' }
        });

        if (order.worker_id) {
            await prisma.notification.create({
                data: {
                    user_id: order.worker_id,
                    title: "Hasil Diterima Klien! 🎉",
                    message: `Klien menerima hasil ${order.order_id_custom}. Menunggu pelunasan pembayaran.`
                }
            });
        }

        res.status(200).json({ success: true, message: "Hasil diterima! Silakan lakukan pelunasan." });
    } catch (error) {
        console.error("Error Accept Order:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// POST /api/orders/:id/revision (User Minta Revisi — Max 3x Gratis)
// ============================================================
export const requestRevision = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { catatan } = req.body;

        const order = await prisma.order.findFirst({
            where: { id, client_id: userId, status_pengerjaan: 'REVIEW' }
        });
        if (!order) return res.status(400).json({ success: false, message: "Order tidak valid atau belum dalam tahap review." });

        const newCount = order.revision_count + 1;
        const isOverLimit = newCount > 3;

        const extraCharge = isOverLimit ? 3500 : 0;
        const currentHargaDeal = order.harga_deal || order.harga_total;
        const newHargaDeal = currentHargaDeal + extraCharge;

        await prisma.order.update({
            where: { id },
            data: {
                status_pengerjaan: 'ON_PROGRESS',
                revision_count: newCount,
                catatan_revisi: catatan || null,
                harga_deal: newHargaDeal
            }
        });

        await prisma.orderResult.deleteMany({ where: { order_id: id } });

        if (order.worker_id) {
            await prisma.notification.create({
                data: {
                    user_id: order.worker_id,
                    title: isOverLimit ? "⚠️ Revisi ke-" + newCount + " (Extra Fee!)" : `Revisi ke-${newCount} 🔄`,
                    message: isOverLimit
                        ? `Klien minta revisi ke-${newCount} (${order.order_id_custom}). Terdapat biaya tambahan Rp 3.500.${catatan ? ' Catatan: ' + catatan : ''}`
                        : `Klien minta revisi ${order.order_id_custom}.${catatan ? ' Catatan: ' + catatan : ''}`
                }
            });
        }

        res.status(200).json({
            success: true,
            message: isOverLimit
                ? `Revisi ke-${newCount}. Dikenakan biaya tambahan Rp 3.500 ke tagihan akhir.`
                : `Revisi ke-${newCount} dari 3 berhasil diajukan.`,
            data: { revision_count: newCount, over_limit: isOverLimit, extra_charge: extraCharge }
        });
    } catch (error) {
        console.error("Error Request Revision:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// ============================================================
// POST /api/orders/estimate-price (Estimasi Harga AI)
// ============================================================
export const estimatePriceWithAI = async (req, res) => {
    try {
        const { type, description } = req.body;

        if (!description || description.length < 20) {
            return res.status(200).json({ success: true, estimate: null });
        }

        const systemPrompt = `Anda adalah sistem estimasi harga otomatis untuk layanan JokiFast (jasa pembuatan tugas, web, desain).
Tugas Anda adalah memprediksi range harga wajar berdasarkan jenis tugas dan deskripsi user.
Gunakan patokan harga (Katalog JokiFast) ini sebagai dasar, TETAPI berikan harga yang fleksibel (bisa lebih murah/mahal) jika deskripsinya sangat gampang atau sangat rumit/banyak.

=== KATALOG HARGA DASAR (REFERENSI) ===
- Web Sederhana (CRUD Basic, HTML/CSS/PHP): Rp 300.000 - Rp 600.000
- Sistem Menengah / Kompleks (Bot, Manajemen Organisasi): Rp 1.000.000 - Rp 2.500.000
- Tugas Koding & Algoritma (Praktikum Mingguan CLI): Rp 100.000 - Rp 250.000
- Bug Fixing / Error Kecil: Rp 50.000 - Rp 100.000
- Laporan Praktikum / Bab 1-3 Skripsi: Rp 500.000 - Rp 1.500.000
- Full All-in (App + Laporan + Sidang): Rp 3.000.000 - Rp 6.000.000+
- Makalah / Esai / Resume Jurnal: Rp 50.000 - Rp 150.000
- Presentasi PPT: Rp 50.000 - Rp 100.000
- UI/UX Wireframe (1-5 screen): Rp 100.000 - Rp 250.000
- UI/UX Full Prototype: Rp 300.000 - Rp 700.000+

Keluarkan OUTPUT HANYA DALAM FORMAT JSON BERIKUT (jangan ada teks/penjelasan lain):
{
  "estimate_formatted": "Rp X.XXX.XXX - Rp Y.YYY.YYY",
  "bottom_price": angka_paling_murah_tanpa_titik // contoh: 300000
}

Tipe Tugas dari User: ${type}
Deskripsi Tugas: ${description}`;

        const chatCompletion = await getGroqClient().chat.completions.create({
            messages: [{ role: 'system', content: systemPrompt }],
            model: 'llama3-8b-8192',
            temperature: 0.3,
            max_tokens: 150,
            response_format: { type: "json_object" }
        });

        const rawContent = chatCompletion.choices[0]?.message?.content || '{}';
        console.log("RAW GROQ RESPONSE:", rawContent);

        let cleanedContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
        let parsed = { estimate_formatted: "Menganalisa Harga...", bottom_price: 0 };

        try {
            parsed = JSON.parse(cleanedContent);
        } catch (parseError) {
            console.error("JSON Parse Failed. Trying Regex Extraction.", parseError);
            const estMatch = rawContent.match(/"estimate_formatted"\s*:\s*"([^"]+)"/);
            const botMatch = rawContent.match(/"bottom_price"\s*:\s*(\d+)/);

            if (estMatch && botMatch) {
                parsed = {
                    estimate_formatted: estMatch[1],
                    bottom_price: parseInt(botMatch[1], 10)
                };
            }
        }

        res.status(200).json({
            success: true,
            estimate: parsed.estimate_formatted || "Rp 0",
            bottom_price: parsed.bottom_price || 0
        });
    } catch (error) {
        console.error("Error Estimating Price:", error);
        res.status(200).json({ success: true, estimate: "Menganalisa Harga...", bottom_price: 0 });
    }
};

export const berikanRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, ulasan } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: 'Rating harus antara 1 sampai 5 bintang.' });
        }

        const userKlien = await prisma.user.findUnique({ where: { id: userId } });
        const order = await prisma.order.findUnique({ where: { id } });

        if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan.' });

        if (order.client_id !== userId && order.nama_klien !== userKlien.nama) {
            return res.status(403).json({ success: false, message: 'Ini bukan pesanan Anda.' });
        }

        if (order.status_pengerjaan !== 'DONE') {
            return res.status(400).json({ success: false, message: 'Pesanan belum selesai dikerjakan.' });
        }
        if (order.rating) {
            return res.status(400).json({ success: false, message: 'Anda sudah memberikan ulasan untuk pesanan ini.' });
        }

        await prisma.order.update({
            where: { id },
            data: { rating, ulasan }
        });

        if (order.worker_id) {
            await prisma.notification.create({
                data: {
                    user_id: order.worker_id,
                    title: `Dapat Rating ${rating} Bintang! ⭐`,
                    message: `Klien baru saja memberikan ulasan untuk tugas "${order.judul_tugas}".`
                }
            });
        }

        res.status(200).json({ success: true, message: 'Terima kasih atas ulasan Anda!' });
    } catch (error) {
        console.error("Error beri rating:", error);
        res.status(500).json({ success: false, message: 'Gagal mengirim ulasan.' });
    }
};