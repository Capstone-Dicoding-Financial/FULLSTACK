import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTransactionSummary = async (req, res) => {
  try {
    // Amankan userId secara konsisten
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Akses ditolak. ID Pengguna tidak ditemukan di token!" });
    }

    // Hitung Total Pemasukan berdasarkan userId
    const totalPemasukan = await prisma.transaction.aggregate({
      where: {
        userId: userId,
        type: "INCOME"
      },
      _sum: {
        amount: true
      }
    });

    // Hitung Total Pengeluaran berdasarkan userId
    const totalPengeluaran = await prisma.transaction.aggregate({
      where: {
        userId: userId,
        type: "EXPENSE"
      },
      _sum: {
        amount: true
      }
    });

    const pemasukan = totalPemasukan._sum.amount || 0;
    const pengeluaran = totalPengeluaran._sum.amount || 0;
    const saldoKas = pemasukan - pengeluaran;

    return res.status(200).json({
      message: "Data ringkasan berhasil diambil!",
      summary: {
        saldoKas,
        pemasukan,
        pengeluaran
      }
    });

  } catch (error) {
    console.error("Error di getTransactionSummary:", error);
    return res.status(500).json({ error: "Gagal mengambil data summary" });
  }
};

export const addTransaction = async (req, res) => {
  try {
    console.log("Data masuk dari Frontend:", req.body);

    const { type, amount, category, description, date } = req.body;
    const userId = req.user?.id || req.user?.userId;
    
    if (!userId) {
      console.log("userId tidak ditemukan di token JWT");
      return res.status(401).json({ error: "Sesi login tidak valid. Silakan login ulang." });
    }

    if (!type || !amount || !category || !date) {
      return res.status(400).json({ error: "Semua field wajib harus diisi!" });
    }

    // PERBAIKAN UTAMA: Menggunakan variabel 'userId' yang sudah divalidasi di atas
    const transaction = await prisma.transaction.create({
      data: { 
        userId: userId, 
        type: type, 
        amount: Number(amount), 
        category: category, 
        description: description || "", 
        date: new Date(date) 
      }
    });

    console.log("Sukses simpan ke DB :", transaction);
    return res.status(201).json({ message: "Transaksi berhasil ditambahkan!", transaction });

  } catch (error) {
    console.error("ERROR PRISMA / SERVER:", error);
    return res.status(400).json({ error: `Gagal menambah transaksi: ${error.message}` });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Akses ditolak. Token tidak valid." });
    }

    // Mengambil transaksi yang HANYA dimiliki oleh user yang sedang login
    const transactions = await prisma.transaction.findMany({
      where: { 
        userId: userId 
      },
      orderBy: {
        date: 'desc' 
      }
    });

    return res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    console.error("Error di getTransactions:", error);
    return res.status(500).json({ error: "Gagal mengambil daftar transaksi" });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.id || req.user?.userId;

  try {
    if (!userId) {
      return res.status(401).json({ error: "Akses ditolak. Token tidak valid." });
    }

    // Proteksi Keamanan
    const transaction = await prisma.transaction.findFirst({
      where: { id: id, userId: userId }
    });

    if (!transaction) {
      return res.status(404).json({ error: "Transaksi tidak ditemukan atau Anda tidak memiliki akses!" });
    }

    await prisma.transaction.delete({ 
      where: { id: id } 
    });

    return res.status(200).json({ message: "Transaksi berhasil dihapus!" });
  } catch (error) {
    console.error("Error di deleteTransaction:", error);
    return res.status(400).json({ error: "Gagal menghapus transaksi" });
  }
};