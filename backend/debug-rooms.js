import 'dotenv/config';
import jwt from 'jsonwebtoken';
import prisma from './src/config/db.js';

async function test() {
  try {
        const userId = "9ae1c84a-e607-47b4-99c1-edee090b6034"; // ariz's worker ID from previous script
        const role = "WORKER";
        
        const orders = await prisma.order.findMany({
            where: {
                OR: [
                    { client_id: userId },
                    { worker_id: userId }
                ],
                status_pengerjaan: {
                    in: ['NEGOTIATION', 'ON_PROGRESS', 'REVIEW', 'DONE']
                }
            },
            select: {
                id: true,
                order_id_custom: true,
                judul_tugas: true,
                status_pengerjaan: true,
                client: { select: { nama: true } },
                worker: { select: { nama: true } }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log("Found orders:", orders.length);
        
        const rooms = await Promise.all(orders.map(async (order) => {
            const lastMessage = await prisma.chatMessage.findFirst({
                where: { orderId: order.id },
                orderBy: { createdAt: 'desc' }
            });
            const unreadCount = await prisma.chatMessage.count({
                where: {
                    orderId: order.id,
                    senderId: { not: userId },
                    isRead: false
                }
            });
            return {
                ...order,
                last_message: lastMessage,
                unread_count: unreadCount,
                other_party_name: role === 'USER' ? (order.worker?.nama || 'Worker') : order.client.nama
            };
        }));
        
        rooms.sort((a, b) => {
            if (a.unread_count > 0 && b.unread_count === 0) return -1;
            if (a.unread_count === 0 && b.unread_count > 0) return 1;
            const timeA = a.last_message ? new Date(a.last_message.createdAt).getTime() : 0;
            const timeB = b.last_message ? new Date(b.last_message.createdAt).getTime() : 0;
            return timeB - timeA;
        });
        
        console.log(JSON.stringify(rooms, null, 2));

  } catch(e) {
    console.error("DEBUG ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
