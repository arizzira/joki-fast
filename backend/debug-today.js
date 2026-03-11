import 'dotenv/config';
import prisma from './src/config/db.js';

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    console.log("Recent 10 Orders:");
    orders.forEach(o => {
        console.log(`- ${o.order_id_custom} | ${o.judul_tugas} | ${o.harga_total} | ${o.client_id} | ${o.createdAt.toISOString()}`);
    });
  } catch(e) {
    console.error("DEBUG ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
checkOrders();
