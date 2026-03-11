import 'dotenv/config';
import prisma from './src/config/db.js';

async function checkOrders() {
  try {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3
    });
    console.log("Recent 3 Orders:");
    orders.forEach(o => console.log(`- ${o.order_id_custom} | ${o.judul_tugas} | ${o.createdAt}`));
    
    const count = await prisma.order.count();
    console.log("Total Orders:", count);
  } catch(e) {
    console.error("DEBUG ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
checkOrders();
