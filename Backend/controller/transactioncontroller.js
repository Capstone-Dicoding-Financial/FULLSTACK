import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const addTransaction = async (req, res) => {
  const { type, amount, category, description, date } = req.body;
  const userId = req.user.id;

  try {
    const transaction = await prisma.transaction.create({
      data: { userId, type, amount, category, description, date: new Date(date) }
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: "Gagal menambah transaksi" });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id }
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data" });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.transaction.delete({ where: { id } });
    res.json({ message: "Transaksi berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ error: "Transaksi tidak ditemukan" });
  }
};