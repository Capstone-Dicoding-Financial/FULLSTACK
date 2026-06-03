import axios from 'axios';

// ─── Sesuaikan import ini dengan struktur project kamu ────────────────────────
// Ganti path-nya jika berbeda
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ─── Konstanta ────────────────────────────────────────────────────────────────
const AI_BASE_URL = process.env.PYTHON_AI_URL;
const TIMEOUT_MS  = 90_000;
const MAX_RETRIES = 4;
const RETRY_DELAY = 8_000;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Warm-up HuggingFace Space ────────────────────────────────────────────────
async function warmUpSpace() {
  if (!AI_BASE_URL) {
    throw new Error('PYTHON_AI_URL belum di-set di environment variables Vercel!');
  }
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`🔄 Warm-up Space (attempt ${i + 1}/${MAX_RETRIES})...`);
      const res = await axios.get(`${AI_BASE_URL}/health`, { timeout: TIMEOUT_MS });
      if (res.data?.status === 'ready') {
        console.log('✅ HuggingFace Space siap!');
        return;
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message;
      console.warn(`⚠️ Warm-up attempt ${i + 1} gagal (HTTP ${status}): ${detail}`);
      if (status === 503 && i < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY);
        continue;
      }
      if (status !== 503) throw err;
    }
  }
  throw new Error(`HuggingFace Space tidak merespons setelah ${MAX_RETRIES}x retry.`);
}

// ─── Controller utama ─────────────────────────────────────────────────────────
export const getCashflowPrediction = async (req, res) => {
  try {
    // ✅ FIX UTAMA: Ambil userId dari JWT token (sudah di-decode oleh auth middleware)
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Token tidak valid.' });
    }

    // ✅ Query transaksi milik user ini dari database
    // Ambil semua transaksi, urutkan dari yang terlama agar urutan cashflow benar
    const transactions = await prisma.transaction.findMany({
      where:   { userId },
      orderBy: { date: 'asc' },
      select:  { amount: true, type: true, date: true },
    });

    if (transactions.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'Minimal 7 data transaksi diperlukan untuk prediksi AI. Tambah data transaksi terlebih dahulu.',
      });
    }

    // ✅ Hitung cashflow harian: INCOME = +amount, EXPENSE = -amount
    const cashflow_history = transactions.map((t) =>
      t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)
    );

    // Ambil summary keuangan user dari tabel yang sama
    const totalIncome  = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const currentBalance = totalIncome - totalExpense;

    const payload = {
      cashflow:         cashflow_history.slice(-7),   // 7 hari terakhir
      cashflow_history: cashflow_history,              // semua histori
      period:           30,
      current_balance:  currentBalance,
      total_income:     totalIncome,
      total_expense:    totalExpense,
    };

    // ✅ Warm-up Space lalu call FastAPI
    await warmUpSpace();

    const apiResponse = await axios.post(`${AI_BASE_URL}/forecast`, payload, {
      timeout: TIMEOUT_MS,
    });
    const aiResult = apiResponse.data;

    const chartActual = aiResult.chartActual.map((item) => ({ x: item[0], y: item[1] }));
    const chartPred   = aiResult.chartPred.map((item)   => ({ x: item[0], y: item[1] }));

    return res.json({
      success:  true,
      historis: chartActual,
      prediksi: chartPred,
      summary: {
        saldoAkhir:  aiResult.saldoAkhir,
        saldoChange: aiResult.saldoChange,
        pemasukan:   aiResult.pemasukan,
        pengeluaran: aiResult.pengeluaran,
        accuracy:    aiResult.accuracy,
        mape:        aiResult.mape,
        mae:         aiResult.mae,
        skenario:    aiResult.skenario,
        timeline:    aiResult.timeline,
      },
      insights: [
        {
          id:    1,
          type:  aiResult.saldoChange >= 0 ? 'positive' : 'warning',
          badge: aiResult.saldoChange >= 0 ? '↗ Proyeksi Kas Naik' : '⚠ Proyeksi Kas Menurun',
          text:  `Akurasi model GRU: ${aiResult.accuracy}%. Saldo akhir diprediksi ${aiResult.saldoAkhir} (${aiResult.saldoChange}% perubahan).`,
        },
        {
          id:    2,
          type:  'positive',
          badge: '💡 Rekomendasi Skenario',
          text:  `Normal: ${aiResult.skenario.normal.val}. Optimis: ${aiResult.skenario.optimis.val}. Pesimis: ${aiResult.skenario.pesimis.val}.`,
        },
      ],
    });

  } catch (error) {
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.message;

    console.error('❌ getCashflowPrediction error:', error.message);

    if (status === 503 || detail?.includes('belum dimuat') || detail?.includes('sedang dimuat')) {
      return res.status(503).json({
        success: false,
        message: 'Server AI sedang memuat model. Tunggu 30–60 detik lalu coba lagi.',
        detail,
      });
    }
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ success: false, message: 'Request ke server AI timeout. Coba lagi.' });
    }
    if (!error.response) {
      return res.status(502).json({
        success: false,
        message: 'Tidak dapat terhubung ke server AI. Cek PYTHON_AI_URL dan pastikan HuggingFace Space aktif.',
        detail: error.message,
      });
    }

    return res.status(500).json({ success: false, message: 'Server AI gagal merespons.', detail });
  }
};