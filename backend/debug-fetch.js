import 'dotenv/config';
import prisma from './src/config/db.js';

async function test(idStr) {
  try {
    const order = await prisma.order.findUnique({
        where: { id: idStr }
    });
    console.log("Found by ID?", !!order);
    
    if(!order) {
        const orderCustom = await prisma.order.findUnique({
            where: { order_id_custom: idStr }
        });
        console.log("Found by custom ID?", !!orderCustom);
    }
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test('5bcec3c7-0111-4c37-95d5-b9233bc75dd5');
