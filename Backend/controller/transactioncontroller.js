import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getTransactionSummary = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      success: true,
      data: { totalIncome, totalExpense, balance }
    });
  } catch (error) {
    return res.status(500).json({ error: "Gagal mengambil ringkasan transaksi" });
  }
};

export const addTransaction = async (req, res) => {
  try {

    console.log("Data masuk dari Frontend:", req.body);

    const { type, amount, category, description, date } = req.body;

    const userId = req.user?.userId || req.user?.id;
    
    if (!userId) {
      console.log("userId tidak ditemukan di token JWT");
      return res.status(401).json({ error: "Sesi login tidak valid. Silakan login ulang." });
    }

    if (!type || !amount || !category || !date) {
      console.log("Ada field yang kosong");
      return res.status(400).json({ error: "Semua field wajib harus diisi!" });
    }

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
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id }
    });
    return res.status(200).json({ message: "Data berhasil diambil!", transactions });
  } catch (error) {
    return res.status(500).json({ error: "Gagal mengambil data" });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.transaction.delete({ where: { id } });
    return res.status(200).json({ message: "Transaksi berhasil dihapus!" });
  } catch (error) {
    return res.status(400).json({ error: "Transaksi tidak ditemukan" });
  }
};