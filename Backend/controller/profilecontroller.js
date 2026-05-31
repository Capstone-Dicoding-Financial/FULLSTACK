import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await prisma.merchantProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profil usaha belum dibuat!" });
    }

    return res.status(200).json({
      namaToko: profile.namaToko,
      pemilik: profile.pemilik,
      jenisUsaha: profile.jenisUsaha,
      deskripsi: profile.deskripsi,
      telepon: profile.telepon,
      email: profile.emailUsaha,
      alamat: profile.alamat,
      kota: profile.kota,
      provinsi: profile.provinsi,
      kodePOS: profile.kodePOS,
      berdiriSejak: profile.berdiriSejak.toISOString().split('T')[0],
      logoToko: profile.logoToko,
      npwp: profile.npwp,
      nib: profile.nib,
    });

  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
};

export const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const {
    namaToko,
    pemilik,
    jenisUsaha,
    deskripsi,
    telepon,
    email,
    alamat,
    kota,
    provinsi,
    kodePOS,
    berdiriSejak,
    logoToko,
    npwp,
    nib,
  } = req.body;

  if (!namaToko || !pemilik || !jenisUsaha || !telepon || !email || !alamat || !kota || !provinsi || !kodePOS || !berdiriSejak) {
    return res.status(400).json({ error: "Semua field utama harus diisi!" });
  }

  try {
    const updatedProfile = await prisma.merchantProfile.upsert({
      where: { userId },
      update: {
        namaToko,
        pemilik,
        jenisUsaha,
        deskripsi,
        telepon,
        emailUsaha: email,
        alamat,
        kota,
        provinsi,
        kodePOS,
        berdiriSejak: new Date(berdiriSejak),
        logoToko,
        npwp,
        nib,
      },
      create: {
        userId,
        namaToko,
        pemilik,
        jenisUsaha,
        deskripsi,
        telepon,
        emailUsaha: email,
        alamat,
        kota,
        provinsi,
        kodePOS,
        berdiriSejak: new Date(berdiriSejak),
        logoToko,
        npwp,
        nib,
      },
    });

    return res.status(200).json({ 
      message: "Profil berhasil diperbarui!", 
      data: updatedProfile 
    });

  } catch (error) {
    return res.status(500).json({ error: "Gagal menyimpan data profil ke database" });
  }
};