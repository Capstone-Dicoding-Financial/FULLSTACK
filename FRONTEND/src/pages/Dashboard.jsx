import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";

// ── 1. KOMPONEN SPARKLINE CHART (RIIL DATA MODEL GRU) ───────────────────────
function SparklineChart({ kasHistoris, kasPrediksi }) {
  const dataHistori = kasHistoris || [];
  const dataMasaDepan = kasPrediksi || [];

  if (dataHistori.length === 0 && dataMasaDepan.length === 0) {
    return <div style={{ color: "#94a3b8", fontSize: "13px", padding: "20px 0" }}>Menghitung proyeksi grafik model AI...</div>;
  }

  // Acuan batas X dan Y dari gabungan KEDUA data asli
  const semuaPoin = [...dataHistori, ...dataMasaDepan];
  const xValues = semuaPoin.map((p) => p.x);
  const yValues = semuaPoin.map((p) => p.y);

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  
  const realMinY = Math.min(...yValues);
  const realMaxY = Math.max(...yValues);

  // Berikan padding visual 15% atas-bawah agar grafik tidak menabrak border SVG
  const selisihY = realMaxY - realMinY;
  const minY = realMinY - (selisihY === 0 ? 10000 : selisihY * 0.15);
  const maxY = realMaxY + (selisihY === 0 ? 10000 : selisihY * 0.15);

  const chartWidth = 540; 
  const svgWidth = 640;
  const svgHeight = 110;

  // Fungsi konversi nilai asli ke koordinat piksel SVG menggunakan acuan global
  const hitungKoordinat = (pts) => {
    return pts.map((p) => {
      const xNorm = maxX === minX ? 0 : ((p.x - minX) / (maxX - minX)) * chartWidth;
      const yNorm = maxY === minY ? svgHeight / 2 : svgHeight - ((p.y - minY) / (maxY - minY)) * svgHeight;
      return { x: xNorm, y: yNorm };
    });
  };

  const koordinatHistori = hitungKoordinat(dataHistori);
  const koordinatPrediksi = hitungKoordinat(dataMasaDepan);

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const toArea = (pts) => {
    if (pts.length === 0) return "";
    return `${toPath(pts)} L ${pts[pts.length - 1].x.toFixed(1)} ${svgHeight} L ${pts[0].x.toFixed(1)} ${svgHeight} Z`;
  };

  // Titik pertemuan ujung grafik histori dan awal grafik prediksi (Hari Ini)
  const titikHariIni = koordinatHistori[koordinatHistori.length - 1] || { x: 360, y: 50 };

  // Format label angka rupiah terlokalisasi Indonesia di sumbu Y (Jt / Rb)
  const formatK = (num) => {
    const nilaiMutlak = Math.abs(num);
    if (nilaiMutlak >= 1000000) return (num / 1000000).toFixed(1) + " Jt";
    if (nilaiMutlak >= 1000) return (num / 1000).toFixed(0) + " Rb";
    return num.toFixed(0);
  };

  const nilaiGrid = [
    realMaxY,
    realMinY + (realMaxY - realMinY) / 2,
    realMinY
  ];

  return (
    <div className="chart-container" style={{ position: "relative" }}>
      {/* Label Hari Ini */}
      <div 
        className="chart-label-today" 
        style={{ 
          left: `${(titikHariIni.x / svgWidth) * 100}%`,
          top: `${titikHariIni.y - 25}px`,
          color: "white"
        }}
      >
        Hari ini
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none" className="sparkline-svg" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
          </linearGradient>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.00" />
          </linearGradient>
        </defs>
        
        {/* Render Garis Pandu & Label Sumbu Y */}
        {nilaiGrid.map((val, index) => {
          const yPos = maxY === minY ? svgHeight / 2 : svgHeight - ((val - minY) / (maxY - minY)) * svgHeight;
          return (
            <g key={index}>
              <line x1="0" y1={yPos} x2={chartWidth} y2={yPos} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
              <text x={chartWidth + 12} y={yPos + 4} fill="#94a3b8" fontSize="10px" fontFamily="sans-serif" textAnchor="start">
                {formatK(val)}
              </text>
            </g>
          );
        })}

        {/* Isi Gradasi Area Bawah Garis */}
        {koordinatHistori.length > 0 && <path d={toArea(koordinatHistori)} fill="url(#areaGrad)" />}
        {koordinatPrediksi.length > 0 && <path d={toArea(koordinatPrediksi)} fill="url(#projGrad)" />}
        
        {/* Garis Realisasi Historis (Biru) */}
        {koordinatHistori.length > 0 && (
          <path d={toPath(koordinatHistori)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
        
        {/* Garis Proyeksi 30 Hari Kedepan GRU (Putus-putus) */}
        {koordinatPrediksi.length > 0 && (
          <path d={toPath(koordinatPrediksi)} fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" strokeLinejoin="round" />
        )}
        
        {/* Bulatan Anchor di Titik Hari Ini */}
        <circle cx={titikHariIni.x} cy={titikHariIni.y} r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

// ── 2. HALAMAN UTAMA DASHBOARD ──────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  // Inisialisasi sesuai dengan variabel penampung dari backend
  const [summary, setSummary] = useState({ saldoKas: 0, pemasukan: 0, pengeluaran: 0 });
  const [transaksiList, setTransaksiList] = useState([]);
  
  // State data murni dari Model AI
  const [aiChartData, setAiChartData] = useState({ historis: [], prediksi: [] });
  const [aiInsights, setAiInsights] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka || 0);
  };

  const formatTanggal = (stringTanggal) => {
    const opsi = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(stringTanggal).toLocaleDateString('id-ID', opsi);
  };

  useEffect(() => {
    const fetchDataDashboard = async () => {
      try {
        const token = localStorage.getItem("token"); 
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        };

        // Ambil data finansial dasar dan data AI secara paralel
        const [resSummary, resTrx, resAI] = await Promise.all([
          fetch("https://fullstack-backend-capstone.vercel.app/api/transactions/summary", { headers }),
          fetch("https://fullstack-backend-capstone.vercel.app/api/transactions", { headers }),
          fetch("https://fullstack-backend-capstone.vercel.app/api/predict/cashflow", { headers })
        ]);

        if (!resSummary.ok || !resTrx.ok) {
          throw new Error("Gagal mengambil data dari server database");
        }

        const dataSummary = await resSummary.json();
        const dataTrx = await resTrx.json();

        // 🔄 PERBAIKAN 1: Ambil objek 'summary' sesuai kiriman backend
        if (dataSummary.summary) {
          setSummary(dataSummary.summary);
        }

        // 🔄 PERBAIKAN 2: Ambil dari dataTrx.data karena backend mengirim properti '.data'
        const daftarTransaksi = dataTrx.data || dataTrx.transactions;
        if (daftarTransaksi && Array.isArray(daftarTransaksi)) {
          const dataTerbaru = [...daftarTransaksi]
            .sort((a, b) => new Date(b.date) - new Date(a.date)) 
            .slice(0, 5);
          setTransaksiList(dataTerbaru);
        }

        // Pengolahan data dari model GRU asli
        if (resAI && resAI.ok) {
          const dataAI = await resAI.json();
          if (dataAI.success) {
            setAiChartData({
              historis: dataAI.historis,
              prediksi: dataAI.prediksi
            });
            setAiInsights(dataAI.insights);
          }
        } else {
          throw new Error("Koneksi model AI terputus. Pastikan main.py FastAPI Anda aktif!");
        }
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDataDashboard();
  }, []);

  if (loading) return <div className="loading-state">Memuat kecerdasan buatan model GRU...</div>;
  if (error) return <div className="error-state" style={{ color: "#ef4444", fontWeight: "600" }}>Error: {error}</div>;

  return (
    <div className="dashboard-page">
      {/* TOPBAR */}
      <div className="dashboard-topbar">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Ringkasan keuangan bisnis Anda hari ini.</p>
        </div>
        <button className="notif-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="notif-dot" />
        </button>
      </div>

      {/* DASHBOARD BODY */}
      <div className="dashboard-body">
        <div className="dashboard-left">
          {/* STATS CARDS */}
          <div className="summary-cards">
            <div className="card card-kas">
              <div className="card-header">
                <span className="card-label">Total Saldo Kas</span>
                <span className="card-icon card-icon-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                  </svg>
                </span>
              </div>
              {/* 🔄 PERBAIKAN: disesuaikan dengan key 'saldoKas' dari backend */}
              <div className="card-amount">{formatRupiah(summary.saldoKas)}</div>
              <div className="card-trend trend-up">↗ Update otomatis</div>
            </div>

            <div className="card card-pemasukan">
              <div className="card-header">
                <span className="card-label">Total Pemasukan</span>
                <span className="card-icon card-icon-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </span>
              </div>
              {/* 🔄 PERBAIKAN: disesuaikan dengan key 'pemasukan' dari backend */}
              <div className="card-amount">{formatRupiah(summary.pemasukan)}</div>
              <div className="card-trend trend-up">↗ Berhasil dirangkum</div>
            </div>

            <div className="card card-pengeluaran">
              <div className="card-header">
                <span className="card-label">Total Pengeluaran</span>
                <span className="card-icon card-icon-red">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                </span>
              </div>
              {/* 🔄 PERBAIKAN: disesuaikan dengan key 'pengeluaran' dari backend */}
              <div className="card-amount">{formatRupiah(summary.pengeluaran)}</div>
              <div className="card-trend trend-down">↘ Batas pengeluaran aman</div>
            </div>
          </div>

          {/* AI GRAPH PREDIKSI */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Prediksi Arus Kas (AI)</h2>
                <p className="chart-desc">Proyeksi 30 hari ke depan berdasarkan model GRU TensorFlow.</p>
              </div>
              <span className="chart-badge" style={{ backgroundColor: "#10b981", color: "white" }}>Model GRU Aktif</span>
            </div>
            <SparklineChart kasHistoris={aiChartData.historis} kasPrediksi={aiChartData.prediksi} />
          </div>

          {/* TABLE TRANSAKSI TERAKHIR */}
          <div className="transaksi-card">
            <div className="transaksi-header">
              <h2 className="section-title">Transaksi Terakhir</h2>
              <button className="lihat-semua-btn" onClick={() => navigate("/transaksi")}>Lihat Semua</button>
            </div>
            <table className="transaksi-table">
              <thead>
                <tr>
                  <th>Keterangan</th>
                  <th>Tanggal</th>
                  <th>Status</th>
                  <th>Nominal</th>
                </tr>
              </thead>
              <tbody>
                {transaksiList.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>Belum ada data transaksi.</td>
                  </tr>
                ) : (
                  transaksiList.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <span className="trx-icon">{t.type === "INCOME" ? "🏪" : "🛒"}</span>
                        {t.category} {t.description ? `- ${t.description}` : ""}
                      </td>
                      <td className="trx-tanggal">{formatTanggal(t.date)}</td>
                      <td>
                        <span className="trx-status status-sukses">Sukses</span>
                      </td>
                      <td className={`trx-nominal ${t.type === "INCOME" ? "nominal-plus" : "nominal-minus"}`}>
                        {t.type === "INCOME" ? "+ " : "- "} {formatRupiah(t.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR SEBELAH KANAN - INSIGHTS CERDAS MODEL GRU */}
        <div className="dashboard-right">
          <div className="insights-card">
            <div className="insights-header">
              <h2 className="insights-title">Insights Cerdas</h2>
            </div>
            <p className="insights-desc">
              Hasil analisis pola keuangan toko Anda langsung dari model AI neural network.
            </p>

            {aiInsights.map((insight) => (
              <div key={insight.id} className={`insight-item ${insight.type === "positive" ? "insight-positive" : "insight-warning"}`}>
                <div className="insight-item-header">
                  <span className={`insight-badge ${insight.type === "positive" ? "insight-badge-green" : "insight-badge-yellow"}`}>
                    {insight.badge}
                  </span>
                </div>
                <p>{insight.text}</p>
              </div>
            ))}

            <button className="btn-detail-ai" onClick={() => navigate("/ai-insights")}>
              Lihat Detail Laporan AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}