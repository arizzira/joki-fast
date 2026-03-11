import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// 1. Konfigurasi akses ke Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Bikin aturan penyimpanan
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    // KITA UBAH PARAMS JADI FUNGSI DINAMIS BIAR BISA NANGKEP NAMA FILE
    params: async (req, file) => {
        // Biar namanya rapi, kita ganti spasi di nama file asli jadi underscore
        const namaAsli = file.originalname.replace(/\s+/g, '_');

        // Gabungin timestamp + nama asli (misal: 1700000-Tugas_Akhir.pdf)
        const namaFileUnik = `${Date.now()}-${namaAsli}`;

        return {
            folder: 'jokifast_tugas',
            resource_type: 'raw', // Tetap raw biar bebas Error 401
            public_id: namaFileUnik // <--- INI KUNCINYA! Ekstensi file otomatis ikut tersimpan
        };
    }
});

// 3. Ekspor fungsi multer
export const uploadTugas = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});