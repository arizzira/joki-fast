import 'dotenv/config';
import jwt from 'jsonwebtoken';
import prisma from './src/config/db.js';

async function test() {
  try {
    const users = await prisma.user.findMany();
    for (const user of users) {
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
      
      try {
          const res = await fetch('http://localhost:5000/api/chat/unread-count', {
              headers: { Authorization: `Bearer ${token}` }
          });
          const text = await res.text();
          if (res.status !== 200) console.log(`Unread Count for ${user.nama} (${user.role}):`, res.status, text);
      } catch(e) {
          console.error(`Unread Error ${user.nama}:`, e);
      }

      try {
          const res2 = await fetch('http://localhost:5000/api/chat/rooms', {
              headers: { Authorization: `Bearer ${token}` }
          });
          const text2 = await res2.text();
          if (res2.status !== 200) console.log(`Rooms Error for ${user.nama} (${user.role}):`, res2.status, text2);
      } catch(e) {
          console.error(`Rooms Error ${user.nama}:`, e);
      }
    }
    console.log("Done checking all users.");
  } catch(e) {
    console.error("DEBUG ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
