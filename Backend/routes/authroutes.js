import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { register, login } from '../controller/authcontroller.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Registrasi user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User berhasil dibuat
 *       400:
 *         description: Email sudah digunakan atau data tidak valid
 *       500:
 *         description: Kesalahan server
 */
router.post(
  '/register',
  [
    body('name').notEmpty().trim().withMessage('Nama tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password minimal harus 6 karakter')
  ],
  validate,
  register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user dan mendapatkan token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email pengguna
 *               password:
 *                 type: string
 *                 description: Email pengguna
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Login berhasil!"
 *                 token:
 *                   type: string
 *                   description: JWT token untuk otentikasi
 *       401:
 *         description: Email atau password salah
 *       500:
 *         description: Kesalahan server
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi')
  ],
  validate,
  login
);

export default router;