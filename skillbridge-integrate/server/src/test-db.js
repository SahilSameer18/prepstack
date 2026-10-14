import prisma from './lib/prisma.js'

async function main() {
  // CREATE
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@gmail.com',
      password: 'test1234',
    }
  })
  console.log('✅ User created:', user)

  // READ
  const found = await prisma.user.findUnique({
    where: { email: 'test@gmail.com' }
  })
  console.log('✅ User found:', found)

  // DELETE (cleanup)
  await prisma.user.delete({ where: { id: user.id } })
  console.log('✅ User deleted — DB is working perfectly!')
}

main()
  .catch((e) => {
    console.error('❌ DB connection failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })