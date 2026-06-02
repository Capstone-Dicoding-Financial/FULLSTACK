import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { getTransactionSummary, addTransaction, getTransactions, deleteTransaction } from '../controller/transactioncontroller.js';
import { verifyToken } from '../middlewares/authmiddlewares.js';

const router = express.Router();

router.use(verifyToken);

const transactionValidationRules = [
  body('type')
    .isIn(['INCOME', 'EXPENSE'])
    .withMessage('Type harus bernilai INCOME atau EXPENSE'),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount harus berupa angka dan harus lebih besar dari 0'),
  body('category')
    .notEmpty()
    .trim()
    .withMessage('Category tidak boleh kosong'),
  body('date')
    .isISO8601()
    .withMessage('Format tanggal tidak valid (gunakan YYYY-MM-DD)')
];

/**
 * @openapi
 * /api/transactions/summary:
 *   get:
 *     summary: Mendapatkan ringkasan total pemasukan, pengeluaran, dan saldo
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ringkasan data berhasil dihitung
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalIncome:
 *                       type: number
 *                     totalExpense:
 *                       type: number
 *                     balance:
 *                       type: number
 *       401:
 *         description: Token tidak valid
 *       500:
 *         description: Kesalahan server
 */
router.get('/summary', getTransactionSummary);

/**
 * @openapi
 * /api/transactions:
 *   get:
 *     summary: Mendapatkan semua transaksi
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Data berhasil diambil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 transactions:
 *                   type: array
 *       401:
 *         description: Token tidak valid
 *       500:
 *         description: Kesalahan server
 */
router.get('/', getTransactions);

/**
 * @openapi
 * /api/transactions:
 *   post:
 *     summary: Menambah transaksi baru
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - category
 *               - date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Transaksi berhasil ditambahkan
 *       400:
 *         description: Field tidak lengkap atau data tidak valid
 *       401:
 *         description: Token tidak valid
 */
router.post('/', addTransaction, transactionValidationRules, validate);

/**
 * @openapi
 * /api/transactions/{id}:
 *   delete:
 *     summary: Hapus transaksi
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaksi berhasil dihapus
 *       400:
 *         description: Transaksi tidak ditemukan
 *       401:
 *         description: Token tidak valid
 */
router.delete('/:id', deleteTransaction);

export default router;