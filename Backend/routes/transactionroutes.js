import express from 'express';
import { addTransaction, getTransactions, deleteTransaction } from '../controller/transactioncontroller.js';
import { verifyToken } from '../middlewares/authmiddlewares.js';

const router = express.Router();

router.use(verifyToken);

/**
 * @openapi
 * /api/transactions:
 *   get:
 *     summary: Mendapatkan semua transaksi
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: List transaksi berhasil diambil
 */
router.get('/', getTransactions);

/**
 * @openapi
 * /api/transactions:
 *   post:
 *     summary: Menambah transaksi baru
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 */
router.post('/', addTransaction);

/**
 * @openapi
 * /api/transactions/{id}:
 *   delete:
 *     summary: Hapus transaksi
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaksi berhasil dihapus
 */
router.delete('/:id', deleteTransaction);

export default router;