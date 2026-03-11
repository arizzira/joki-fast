import 'dotenv/config';
import prisma from './src/config/db.js';

async function test() {
  try {
    const messages = await prisma.chatMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log("Recent messages:", messages);
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
