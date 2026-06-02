import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// REGISTER
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Semua field harus diisi!" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });
    return res.status(201).json({ message: "User berhasil dibuat!" });
  } catch (error) {
    return res.status(400).json({ error: "Email sudah terdaftar!" });
  }
};

// LOGIN
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email atau Password salah!" });
    }

    const token = jwt.sign(
      { userId: user.id },  
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.id,      
        email: user.email,
        name: user.name
      }
    });

  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email wajib diisi!" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "Email tidak terdaftar!" });
    }

    // Buat token reset (berlaku 15 menit)
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    // Link mengarah ke halaman ResetPassword.jsx di frontend (Port 5173)
    const resetLink = `http://localhost:5173/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: '"DanaUMKM Support" <noreply@danaumkm.com>',
      to: email,
      subject: 'Permintaan Reset Password Akun DanaUMKM',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2563eb; margin-bottom: 20px;">Halo, ${user.name}!</h2>
          <p>Kami menerima permintaan untuk mereset password akun DanaUMKM Anda.</p>
          <p>Silakan klik tombol di bawah ini untuk memperbarui kata sandi Anda. Link ini hanya berlaku selama <strong>15 menit</strong>.</p>
          
          <div style="margin: 30px 0; text-align: center;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Reset Password Saya
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 13px;">Jika tombol di bawah tidak bekerja, silakan salin tautan berikut ke browser Anda:</p>
          <p style="color: #2563eb; font-size: 13px; word-break: break-all;">${resetLink}</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px;" />
          <p style="color: #94a3b8; font-size: 12px;">Abaikan email ini jika Anda tidak merasa meminta perubahan password.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Link reset password telah dikirim ke email Anda!" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ error: "Gagal mengirim email reset password." });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ error: "Token dan password baru wajib diisi!" });
  }

  try {
    // Verifikasi validitas token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password di database via Prisma
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ message: "Password berhasil diperbarui! Silakan login." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ error: "Tautan sudah kedaluwarsa. Silakan ajukan permintaan baru." });
    }
    return res.status(400).json({ error: "Tautan tidak valid atau rusak!" });
  }
};