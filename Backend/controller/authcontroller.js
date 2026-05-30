import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

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