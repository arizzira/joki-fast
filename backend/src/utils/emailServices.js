import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Inisialisasi Resend pakai API Key dari .env
const resend = new Resend(process.env.RESEND_API_KEY);

// Default email pengirim (Sandbox Resend)
const SENDER_EMAIL = 'JokiFast <onboarding@resend.dev>';

// Helper Format Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka || 0);
};

// Fungsi inti pengirim email
const sendMail = async (to, subject, htmlContent) => {
    try {
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: [to],
            subject: subject,
            html: htmlContent,
        });

        if (error) {
            console.error(`❌ Gagal kirim email ke ${to}:`, error.message);
            return { success: false, error };
        }
        console.log(`✅ Email sukses terkirim ke: ${to} (ID: ${data.id})`);
        return { success: true, data };
    } catch (err) {
        console.error("❌ Error sistem email:", err);
        return { success: false, err };
    }
};

// ============================================================
// 👷 TEMPLATE EMAIL UNTUK WORKER
// ============================================================

export const emailWorkerDiterima = (email, nama) => {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">🎉 Selamat Datang di JokiFast, ${nama}!</h2>
            <p>Kabar gembira! Profil dan portofolio kamu sudah kami review, dan kamu <b>Resmi Diterima</b> sebagai Worker di JokiFast.</p>
            <p>Untuk sementara waktu, silakan bergabung ke grup WhatsApp khusus Worker kami untuk kordinasi dan informasi tugas:</p>
            <div style="margin: 25px 0;">
                <a href="https://chat.whatsapp.com/FGN7FFZTZG9LoFsU3b2cVI" style="padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Gabung Grup WA Worker</a>
            </div>
            <p>Selamat bekerja, kumpulkan rating bintang 5, dan raih cuan sebanyak-banyaknya! 🚀</p>
            <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
            <p style="font-size: 12px; color: #888;">JokiFast: Learn Fast. Scale Faster.</p>
        </div>
    `;
    sendMail(email, '🎉 Akun Worker JokiFast Diterima!', html);
};

export const emailOrderBaruKeWorker = (email, judulTugas, budget) => {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3b82f6;">🔥 Ada Tugas Baru di Bursa!</h2>
            <p>Klien baru saja memposting tugas yang butuh dieksekusi segera.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><b>Judul:</b> ${judulTugas}</p>
                <p style="margin: 0; color: #10b981; font-weight: bold;">Estimasi Budget: ${formatRupiah(budget)}</p>
            </div>
            <p>Segera login ke dashboard dan <b>Ambil Tugas</b> ini sebelum diambil oleh Mitra lain!</p>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">JokiFast: Learn Fast. Scale Faster.</p>
        </div>
    `;
    sendMail(email, '🔥 Ada Orderan Baru Masuk di JokiFast!', html);
};

export const emailWithdrawSelesai = (email, nama, nominal) => {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">💸 Pencairan Dana Berhasil!</h2>
            <p>Halo <b>${nama}</b>,</p>
            <p>Permintaan penarikan dana kamu sebesar <b style="color: #10b981; font-size: 18px;">${formatRupiah(nominal)}</b> sudah berhasil kami transfer ke rekening kamu.</p>
            <p>Silakan cek mutasi rekening atau e-wallet kamu. Terima kasih atas kerja kerasnya, dan terus semangat ambil orderan di JokiFast! 🚀</p>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">JokiFast Finance Team</p>
        </div>
    `;
    sendMail(email, '💸 Penarikan Dana Berhasil', html);
};

// ============================================================
// 👨‍💻 TEMPLATE EMAIL UNTUK USER / KLIEN
// ============================================================

export const emailPembayaranSukses = (email, judulTugas, tipePembayaran, nominal) => {
    const statusText = tipePembayaran === 'DP' ? 'Down Payment (DP)' : 'Pelunasan';
    const isLunas = tipePembayaran === 'PELUNASAN';
    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">✅ Pembayaran ${statusText} Diterima</h2>
            <p>Terima kasih! Kami telah menerima pembayaran kamu sebesar <b>${formatRupiah(nominal)}</b> untuk tugas:</p>
            <p style="background-color: #f8fafc; padding: 15px; border-radius: 8px; font-weight: bold;">"${judulTugas}"</p>
            <p>${isLunas ? 'Pembayaran lunas! Kamu sekarang bisa mengunduh file hasil (tanpa watermark).' : 'Sistem kami telah mengupdate status pesananmu. Worker akan segera/sedang memproses tugasmu.'}</p>
            <p>Pantau terus progressnya di menu Pesanan Saya.</p>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">JokiFast Support</p>
        </div>
    `;
    sendMail(email, `✅ Pembayaran ${statusText} Berhasil`, html);
};

export const emailOrderDiambil = (email, judulTugas, namaWorker) => {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #3b82f6;">🤝 Tugas Kamu Sedang Dikerjakan!</h2>
            <p>Halo, tugas kamu yang berjudul <b>"${judulTugas}"</b> saat ini sudah diambil dan sedang ditangani oleh Mitra andalan kami: <b>${namaWorker}</b>.</p>
            <p>Silakan login ke JokiFast untuk memantau progress pengerjaan, atau gunakan fitur Chat untuk berdiskusi langsung dengan Worker.</p>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">JokiFast Notification</p>
        </div>
    `;
    sendMail(email, '🤝 Pekerja Ditemukan untuk Tugasmu!', html);
};

export const emailTugasSelesai = (email, judulTugas) => {
    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #10b981;">🎯 Pekerjaan Telah Selesai!</h2>
            <p>Halo! Worker baru saja menandai bahwa tugas <b>"${judulTugas}"</b> telah selesai dikerjakan.</p>
            <p>Silakan login ke JokiFast untuk <b>mereview hasil tugasnya</b>. Jika sudah sesuai, segera lakukan pelunasan untuk mengunduh file asli, atau minta revisi jika ada yang kurang.</p>
            <p style="font-size: 12px; color: #888; margin-top: 30px;">JokiFast Notification</p>
        </div>
    `;
    sendMail(email, '🎯 Hasil Tugas Kamu Sudah Siap Direview!', html);
};

// ============================================================
// 👑 TEMPLATE EMAIL UNTUK SUPER ADMIN
// ============================================================

export const emailAdminRequestWorker = (namaEmail) => {
    // Pastikan ADMIN_EMAIL ada di .env
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return console.log("⚠️ ADMIN_EMAIL belum diset di .env");

    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 2px solid #ef4444; border-radius: 10px;">
            <h2 style="color: #ef4444;">🚨 Pendaftar Worker Baru!</h2>
            <p>Bos, ada user baru dengan email <b>${namaEmail}</b> yang baru saja melengkapi form Onboarding pendaftaran Worker.</p>
            <p>Segera buka Dashboard Super Admin untuk meninjau profil dan portofolionya, lalu tentukan untuk di-<b>Approve</b> atau <b>Reject</b>.</p>
        </div>
    `;
    sendMail(adminEmail, '🚨 Action Required: Pendaftar Worker Baru', html);
};

export const emailAdminRequestWithdraw = (namaWorker, nominal, bank, noRek) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return console.log("⚠️ ADMIN_EMAIL belum diset di .env");

    const html = `
        <div style="font-family: sans-serif; color: #333; max-w-2xl; margin: 0 auto; padding: 20px; border: 2px solid #f59e0b; border-radius: 10px;">
            <h2 style="color: #f59e0b;">💰 Ada Request Withdraw!</h2>
            <p>Worker <b>${namaWorker}</b> baru saja meminta penarikan dana.</p>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0;"><b>Nominal:</b> ${formatRupiah(nominal)}</p>
                <p style="margin: 0 0 5px 0;"><b>Bank:</b> ${bank}</p>
                <p style="margin: 0;"><b>No. Rekening:</b> ${noRek}</p>
            </div>
            <p>Harap segera transfer ke rekening tersebut dan tandai "Selesai" di Dashboard Admin.</p>
        </div>
    `;
    sendMail(adminEmail, `💰 Request Withdraw: Rp ${nominal} dari ${namaWorker}`, html);
};