import axios from 'axios';

const AI_BASE_URL  = process.env.PYTHON_AI_URL;   // wajib di-set di Vercel!
const TIMEOUT_MS   = 90_000;   // 90 detik — HuggingFace cold start bisa lama
const MAX_RETRIES  = 4;
const RETRY_DELAY  = 8_000;    // 8 detik antar retry

// ─── Helper: sleep ────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Helper: warm-up Space sebelum request utama ─────────────────────────────
async function warmUpSpace() {
  if (!AI_BASE_URL) {
    throw new Error('PYTHON_AI_URL belum di-set di environment variables Vercel!');
  }

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      console.log(`🔄 Warm-up HuggingFace Space (attempt ${i + 1}/${MAX_RETRIES})...`);
      const res = await axios.get(`${AI_BASE_URL}/health`, { timeout: TIMEOUT_MS });
      if (res.data?.status === 'ready') {
        console.log('✅ HuggingFace Space siap!');
        return;
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message;
      console.warn(`⚠️  Warm-up attempt ${i + 1} gagal (HTTP ${status}): ${detail}`);

      // 503 = model masih loading → tunggu lalu retry
      if (status === 503 && i < MAX_RETRIES - 1) {
        console.log(`⏳ Menunggu ${RETRY_DELAY / 1000}s sebelum retry...`);
        await sleep(RETRY_DELAY);
        continue;
      }
      // Error non-503 (network down, 404, dll) → langsung lempar
      if (status !== 503) throw err;
    }
  }
  throw new Error(`HuggingFace Space tidak merespons setelah ${MAX_RETRIES}x retry. Coba lagi dalam 1–2 menit.`);
}

// ─── Controller utama ─────────────────────────────────────────────────────────
export const getCashflowPrediction = async (req, res) => {
  try {
    // ✅ FIX 1: Ambil data dari database / req.body — BUKAN hardcode!
    //    Sesuaikan bagian ini dengan struktur data di aplikasi kamu.
    //    Contoh di bawah menggunakan req.body (untuk POST) atau
    //    query params (untuk GET — sesuai route GET /cashflow kamu).
    const {
      cashflow_history  = [],
      current_balance   = 0,
      total_income      = 0,
      total_expense     = 0,
      period            = 30,       // default 30 hari
    } = req.body ?? req.query ?? {};

    // Validasi minimal sebelum kirim ke FastAPI
    if (cashflow_history.length < 7) {
      return res.status(400).json({
        success: false,
        message: 'cashflow_history minimal 7 data.',
      });
    }
    if (![30, 60, 90].includes(Number(period))) {
      return res.status(400).json({
        success: false,
        message: 'period harus 30, 60, atau 90.',
      });
    }

    const cashflowLast7Days = cashflow_history.slice(-7);

    const payload = {
      cashflow:         cashflowLast7Days,
      cashflow_history: cashflow_history,
      period:           Number(period),
      current_balance:  Number(current_balance),
      total_income:     Number(total_income),
      total_expense:    Number(total_expense),
    };

    // ✅ FIX 2: Warm-up dulu agar tidak langsung dapat 503 cold start
    await warmUpSpace();

    // ✅ FIX 3: Tambah timeout agar tidak hang selamanya
    const apiResponse = await axios.post(`${AI_BASE_URL}/forecast`, payload, {
      timeout: TIMEOUT_MS,
    });
    const aiResult = apiResponse.data;

    // Map chart data
    const chartActual = aiResult.chartActual.map(item => ({ x: item[0], y: item[1] }));
    const chartPred   = aiResult.chartPred.map(item => ({ x: item[0], y: item[1] }));

    return res.json({
      success:  true,
      historis: chartActual,
      prediksi: chartPred,
      summary: {
        saldoAkhir:   aiResult.saldoAkhir,
        saldoChange:  aiResult.saldoChange,
        pemasukan:    aiResult.pemasukan,
        pengeluaran:  aiResult.pengeluaran,
        accuracy:     aiResult.accuracy,
        mape:         aiResult.mape,
        mae:          aiResult.mae,
        skenario:     aiResult.skenario,
        timeline:     aiResult.timeline,
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
    // ✅ FIX 4: Error handling lebih detail — beda respons untuk beda jenis error
    const status = error.response?.status;
    const detail = error.response?.data?.detail || error.message;

    console.error('❌ getCashflowPrediction error:', error.message);
    if (error.response) {
      console.error('   FastAPI response:', error.response.data);
    }

    if (status === 503 || detail?.includes('belum dimuat') || detail?.includes('sedang dimuat')) {
      return res.status(503).json({
        success: false,
        message: 'Server AI sedang memuat model. Tunggu 30–60 detik lalu coba lagi.',
        detail,
      });
    }

    if (status === 400) {
      return res.status(400).json({
        success: false,
        message: 'Data yang dikirim tidak valid.',
        detail,
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        success: false,
        message: 'Request ke server AI timeout (>90 detik). Coba lagi.',
      });
    }

    if (!error.response) {
      return res.status(502).json({
        success: false,
        message: 'Tidak dapat terhubung ke server AI. Pastikan PYTHON_AI_URL benar dan HuggingFace Space aktif.',
        detail: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server AI gagal merespons.',
      detail,
    });
  }
};