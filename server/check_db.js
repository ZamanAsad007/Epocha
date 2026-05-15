const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const counts = await prisma.place.groupBy({
      by: ['category'],
      _count: {
        _all: true
      }
    });
    console.log('Place counts by category:', counts);
    
    const total = await prisma.place.count();
    console.log('Total places:', total);

    const samples = await prisma.place.findMany({ take: 5 });
    console.log('Sample data:', samples);
  } catch (e) {
    console.error('Database Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
