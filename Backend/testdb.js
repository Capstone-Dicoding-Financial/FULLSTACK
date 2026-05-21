import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Mencoba koneksi ke database...");
  
  // Mencoba menghitung jumlah user di database
  const userCount = await prisma.user.count();
  console.log(`Berhasil terhubung! Jumlah user di database: ${userCount}`);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());