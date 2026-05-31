import express from 'express';
import { body, param } from 'express-validator';
import { validate } from '../middlewares/validate.js';
import { getProfile, updateProfile } from '../controller/profilecontroller.js';

const router = express.Router();

/**
 * @openapi
 * /api/profile/{userId}:
 *   get:
 *     summary: Mengambil data profil usaha berdasarkan ID User
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari user pemilik profil
 *     responses:
 *       200:
 *         description: Data profil berhasil ditemukan
 *       404:
 *         description: Profil usaha belum dibuat
 *       500:
 *         description: Kesalahan server
 */
router.get(
  '/:userId',
  [
    param('userId').notEmpty().withMessage('User ID di parameter tidak boleh kosong')
  ],
  validate,
  getProfile
);

/**
 * @openapi
 * /api/profile/{userId}:
 *   put:
 *     summary: Menyimpan atau memperbarui profil usaha (Upsert)
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID dari user pemilik profil
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - namaToko
 *               - pemilik
 *               - jenisUsaha
 *               - telepon
 *               - email
 *               - alamat
 *               - kota
 *               - provinsi
 *               - kodePOS
 *               - berdiriSejak
 *             properties:
 *               namaToko:
 *                 type: string
 *               pemilik:
 *                 type: string
 *               jenisUsaha:
 *                 type: string
 *               deskripsi:
 *                 type: string
 *               telepon:
 *                 type: string
 *               email:
 *                 type: string
 *               alamat:
 *                 type: string
 *               kota:
 *                 type: string
 *               provinsi:
 *                 type: string
 *               kodePOS:
 *                 type: string
 *               berdiriSejak:
 *                 type: string
 *                 format: date
 *                 example: "2026-03-15"
 *               npwp:
 *                 type: string
 *               nib:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       400:
 *         description: Semua field utama harus di isi atau data tidak valid
 *       500:
 *         description: Kesalahan server 
 */
router.put(
  '/:userId',
  [
    param('userId').notEmpty().withMessage('User ID di parameter tidak boleh kosong'),
    body('namaToko').notEmpty().trim().withMessage('Nama Toko tidak boleh kosong'),
    body('pemilik').notEmpty().trim().withMessage('Nama Pemilik tidak boleh kosong'),
    body('jenisUsaha').notEmpty().withMessage('Jenis Usaha tidak boleh kosong'),
    body('telepon').notEmpty().trim().withMessage('Nomor Telepon tidak boleh kosong'),
    body('email').isEmail().withMessage('Format email usaha tidak valid'),
    body('alamat').notEmpty().trim().withMessage('Alamat tidak boleh kosong'),
    body('kota').notEmpty().trim().withMessage('Kota tidak boleh kosong'),
    body('provinsi').notEmpty().trim().withMessage('Provinsi tidak boleh kosong'),
    body('kodePOS').notEmpty().trim().withMessage('Kode POS tidak boleh kosong'),
    body('berdiriSejak').isISO8601().withMessage('Format tanggal berdiri harus valid (YYYY-MM-DD)')
  ],
  validate,
  updateProfile
);

export default router;