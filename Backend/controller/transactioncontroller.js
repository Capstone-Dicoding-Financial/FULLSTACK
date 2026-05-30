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
  const { type, amount, category, description, date } = req.body;
  const userId = req.user.id;

  if (!type || !amount || !category || !date) {
    return res.status(400).json({ error: "Semua field harus diisi!" });
  }

  try {
    const transaction = await prisma.transaction.create({
      data: { userId, type, amount, category, description, date: new Date(date) }
    });
    return res.status(201).json({ message: "Transaksi berhasil ditambahkan!", transaction });
  } catch (error) {
    return res.status(400).json({ error: "Gagal menambah transaksi" });
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