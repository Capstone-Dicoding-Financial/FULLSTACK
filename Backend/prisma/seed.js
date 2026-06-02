import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE_PATH = path.join(__dirname, '../umkm_cashflow_final.csv');

async function main() {
  console.log('👤 Mencari user di database untuk relasi transaksi...');
  
  let user = await prisma.user.findFirst();

  if (!user) {
    console.log('💡 DB Kosong. Membuat dummy user baru...');
    user = await prisma.user.create({
      data: {
        name: 'admin',
        email: 'admin@mail.com',
        password: 'password123', 
      },
    });
  }

  console.log(`🎯 Data seeder akan otomatis dimasukkan ke akun: ${user.email} (ID: ${user.id})\n`);
  const targetUserId = user.id;

  console.log('📖 Membaca file umkm_cashflow_final.csv...');
  const records = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const tanggal = row.tanggal;
        const kategoriUmkm = row.umkm_kategori; // Bernilai 'Warung Kelontong'
        const pemasukan = parseFloat(row.total_pemasukan) || 0;
        const pengeluaran = parseFloat(row.total_pengeluaran) || 0;
          if (pemasukan > 0) {
            records.push({
              type: 'INCOME',
              amount: pemasukan,
              date: new Date(tanggal),
              description: `Seeder: Pemasukan harian ${kategoriUmkm}`,
              userId: targetUserId,
              category: kategoriUmkm, // 🔥 SEKARANG DIINJEKSI DI SINI
            });
          }

          if (pengeluaran > 0) {
            records.push({
              type: 'EXPENSE',
              amount: pengeluaran,
              date: new Date(tanggal),
              description: `Seeder: Pengeluaran harian ${kategoriUmkm}`,
              userId: targetUserId,
              category: kategoriUmkm, // 🔥 SEKARANG DIINJEKSI DI SINI
            });
          }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  console.log(`✅ Selesai membaca CSV. Total ${records.length} baris data siap disuntik.`);
  console.log('🚀 Memasukkan data ke PostgreSQL via Prisma...');

  const result = await prisma.transaction.createMany({
    data: records,
    skipDuplicates: true, 
  });

  console.log(`\n🏁 Seeding BERHASIL! ${result.count} data transaksi berhasil masuk ke PostgreSQL.`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });