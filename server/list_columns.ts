import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const result = await prisma.$queryRawUnsafe(\`
    SELECT column_name, data_type, udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'banner_events'
  \`)
  console.log(JSON.stringify(result, null, 2))
}
main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
