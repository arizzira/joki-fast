import 'dotenv/config';
import prisma from './src/config/db.js';

async function test() {
  try {
    const orders = await prisma.order.findMany({
      where: {
          OR: [
              { client_id: "test" },
              { worker_id: "test" }
          ]
      },
      select: { id: true }
    });
    console.log("Orders:", orders);
    const orderIds = orders.map(o => o.id);
    const totalUnread = await prisma.chatMessage.count({
        where: {
            orderId: { in: orderIds },
            senderId: { not: "test" },
            isRead: false
        }
    });
    console.log("Total unread:", totalUnread);
  } catch(e) {
    console.error("DEBUG ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
