import 'dotenv/config';
import jwt from 'jsonwebtoken';
import FormData from 'form-data';
import prisma from './src/config/db.js';

async function test() {
  try {
    const user = await prisma.user.findFirst({ where: { role: 'USER' }});
    if (!user) return console.log("No user found");
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const form = new FormData();
    form.append('nama_klien', user.nama);
    form.append('wa_klien', '081234567890');
    form.append('judul_tugas', 'Test Order AI');
    form.append('deskripsi', '[Tipe: Tugas Koding] \n\nIni adalah deskripsi test.');
    form.append('harga_total', '50000');

    // Menggunakan dynamic import untuk fetch, Node 18+ sudah built-in fetch
    const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: form
    });
    
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);

  } catch(e) {
    console.error("Test Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
