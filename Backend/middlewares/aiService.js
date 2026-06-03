/**
 * aiService.js
 * Helper untuk komunikasi Express ↔ HuggingFace FastAPI
 * Menangani cold start, retry, dan timeout otomatis
 */

const axios = require("axios");

const AI_BASE_URL = process.env.PYTHON_AI_URL;  // dari env var Vercel kamu
const TIMEOUT_MS  = 90_000;  // 90 detik (HuggingFace cold start bisa lama)
const MAX_RETRIES = 4;
const RETRY_DELAY = 8_000;   // tunggu 8 detik antar retry

if (!AI_BASE_URL) {
  console.error("❌ PYTHON_AI_URL tidak di-set di environment variables!");
}

/**
 * Warm-up HuggingFace Space — hit /health sampai model siap.
 * Dipanggil sebelum /forecast agar tidak langsung 503.
 */
async function warmUpSpace(retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🔄 Warm-up HuggingFace Space (attempt ${i + 1}/${retries})...`);
      const res = await axios.get(`${AI_BASE_URL}/health`, { timeout: TIMEOUT_MS });
      if (res.data?.status === "ready") {
        console.log("✅ HuggingFace Space siap!");
        return true;
      }
    } catch (err) {
      const status = err.response?.status;
      const detail = err.response?.data?.detail || err.message;
      console.warn(`⚠️  Warm-up attempt ${i + 1} gagal (${status}): ${detail}`);

      // 503 = model masih loading → tunggu dan retry
      if (status === 503 && i < retries - 1) {
        console.log(`⏳ Menunggu ${RETRY_DELAY / 1000}s sebelum retry...`);
        await sleep(RETRY_DELAY);
        continue;
      }

      // Error lain (network, 404, dsb) → langsung lempar
      if (status !== 503) throw err;
    }
  }
  throw new Error("HuggingFace Space tidak merespons setelah beberapa kali retry. Coba lagi dalam 1-2 menit.");
}

/**
 * Call endpoint FastAPI dengan warm-up otomatis + retry.
 * @param {string} path     - Path endpoint, misal "/forecast"
 * @param {object} payload  - Body JSON untuk POST
 * @param {"GET"|"POST"} method
 */
async function callFastAPI(path, payload = {}, method = "POST") {
  // Pastikan Space tidak sedang tidur sebelum request utama
  await warmUpSpace();

  try {
    const res = await axios({
      method,
      url: `${AI_BASE_URL}${path}`,
      data: method === "POST" ? payload : undefined,
      params: method === "GET" ? payload : undefined,
      timeout: TIMEOUT_MS,
    });
    return res.data;
  } catch (err) {
    const status  = err.response?.status;
    const detail  = err.response?.data?.detail || err.message;
    const error   = new Error(detail);
    error.status  = status || 500;
    error.detail  = detail;
    throw error;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = { callFastAPI, warmUpSpace };