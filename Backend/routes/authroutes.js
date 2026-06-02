import express        from 'express';
import { body }       from 'express-validator';
import { validate }   from '../middlewares/validate.js';
import {register, login, forgotPassword, resetPassword} from '../controller/authcontroller.js';

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
 *          description: User berhasil dibuat
 *       400: 
 *          description: Email sudah digunakan atau data tidak valid
 *       500: 
 *          description: Kesalahan server
 */
router.post(
  '/register',
  [
    body('name').notEmpty().trim().withMessage('Nama tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password minimal harus 6 karakter'),
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
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: 
 *                    type: string 
 *                    example: "Login berhasil!"
 *                 token:   
 *                    type: string
 *                    description: JWT token untuk otentikasi
 *       401: 
 *          description: Email atau password salah
 *       500: 
 *          description: Kesalahan server
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Format email tidak valid'),
    body('password').notEmpty().withMessage('Password wajib diisi'),
  ],
  validate,
  login
);
/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Meminta token/link reset password lewat email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email akun terdaftar
 *     responses:
 *       200: 
 *          description: Instruksi reset berhasil dikirim
 *       400: 
 *          description: Input tidak valid
 *       404: 
 *          description: Email tidak terdaftar
 *       500: 
 *          description: Kesalahan server
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Format email tidak valid').normalizeEmail(),
  ],
  validate,
  forgotPassword
);
/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Eksekusi perubahan password baru menggunakan token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token JWT dari link reset password
 *               password:
 *                 type: string
 *                 description: Password baru user
 *     responses:
 *       200: 
 *          description: Password berhasil diperbarui
 *       400: 
 *          description: Token tidak valid/kedaluwarsa atau data tidak cocok
 *       500: 
 *          description: Kesalahan server
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token reset password wajib disertakan'),
    body('password').isLength({ min: 6 }).withMessage('Password baru minimal harus 6 karakter'),
  ],
  validate,
  resetPassword
);

export default router;