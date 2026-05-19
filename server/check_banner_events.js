const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const monthMap = {
  "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
  "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
};

async function main() {
  const rows = await prisma.$queryRaw`SELECT id, date_month, date_day, title, year, description FROM banner_events`;
  
  console.log('Total banner_events rows:', rows.length);

  const now = new Date();
  const monthInt = now.getMonth() + 1;
  const day = now.getDate();
  console.log(`Current JS local month/day: ${monthInt}/${day}`);

  // Try to find a row for May/17 if today (5/19) has none, just to demonstrate "Random row"
  const todayEvents = rows.filter(r => {
    const rowMonth = typeof r.date_month === 'string' ? (monthMap[r.date_month] || r.date_month) : r.date_month;
    return parseInt(rowMonth) === monthInt && parseInt(r.date_day) === day;
  });

  console.log(`Rows count for month/day ${monthInt}/${day}:`, todayEvents.length);

  if (todayEvents.length > 0) {
    const randomRow = todayEvents[Math.floor(Math.random() * todayEvents.length)];
    console.log('Random row for today:', JSON.stringify(randomRow, null, 2));
  } else {
    console.log('No rows found for today.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
