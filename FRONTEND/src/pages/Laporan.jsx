import { useState, useEffect, useMemo } from "react";
import "../css/Laporan.css";

// Base URL API disesuaikan tanpa tanda titik di ujungnya
const apiBaseUrl = import.meta.env.VITE_API_URL || "https://fullstack-backend-capstone.vercel.app";

function fmtAxis(val) {
  const abs = Math.abs(val);
  const sign = val < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000)     return `${sign}${(abs / 1_000_000).toFixed(0)}jt`;
  if (abs >= 1_000)         return `${sign}${(abs / 1_000).toFixed(0)}rb`;
  return `${sign}${abs}`;
}

function BarChart({ data, maxVal }) {
  const LABEL_W = 44;   
  const PAD_T   = 12;
  const PAD_B   = 28;
  const PAD_R   = 12;
  const W       = 520;   
  const H       = 140;   
  const plotW   = W - LABEL_W - PAD_R;
  const plotH   = H;
  const totalH  = PAD_T + H + PAD_B;
  const safeMax = maxVal || 1;
  const ticks = [1, 0.75, 0.5, 0.25, 0];
  const groupSlice = plotW / (data.length || 1);
  const barW       = Math.max(14, groupSlice * 0.25); 
  const gap        = 4;  
  const groupWidth = barW * 2 + gap;

  return (
    <div className="barchart-wrap">
      <svg
        viewBox={`0 0 ${W} ${totalH}`}
        preserveAspectRatio="xMidYMid meet"
        className="barchart-svg"
        style={{ width: "100%", height: "auto" }}>

        {ticks.map((t) => {
          const y   = PAD_T + (1 - t) * plotH;
          const val = Math.round(safeMax * t);
          return (
            <g key={t}>
              <line
                x1={LABEL_W} y1={y.toFixed(1)}
                x2={W - PAD_R}  y2={y.toFixed(1)}
                stroke="#f1f5f9" strokeWidth="1"
              />
              <text
                x={LABEL_W - 6} y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94a3b8"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {fmtAxis(val)}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const sliceCenter = LABEL_W + (i + 0.5) * groupSlice;
          const xMasuk      = sliceCenter - groupWidth / 2;
          const xKeluar     = xMasuk + barW + gap;
          const hMasuk  = (d.masuk  / safeMax) * plotH;
          const hKeluar = (d.keluar / safeMax) * plotH;
          const yMasuk  = PAD_T + plotH - hMasuk;
          const yKeluar = PAD_T + plotH - hKeluar;

          return (
            <g key={d.bulan}>
              <rect
                x={xMasuk.toFixed(1)} y={yMasuk.toFixed(1)}
                width={barW} height={Math.max(0, hMasuk)}
                rx="3" fill="#2563eb" opacity="0.85"
              />
              <rect
                x={xKeluar.toFixed(1)} y={yKeluar.toFixed(1)}
                width={barW} height={Math.max(0, hKeluar)}
                rx="3" fill="#ef4444" opacity="0.75"
              />
              <text
                x={sliceCenter.toFixed(1)} y={PAD_T + plotH + 18}
                textAnchor="middle" fontSize="10"
                fill="#94a3b8"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {d.bulan}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="barchart-legend">
        <span className="bcleg-item">
          <span className="bcleg-dot" style={{ background: "#2563eb" }} />Pemasukan
        </span>
        <span className="bcleg-item">
          <span className="bcleg-dot" style={{ background: "#ef4444" }} />Pengeluaran
        </span>
      </div>
    </div>
  );
}

function LineChart({ dataPoints, labels, maxVal, minVal }) {
  const LABEL_W = 44;
  const PAD_T   = 12;
  const PAD_B   = 28;
  const PAD_R   = 12;
  const W       = 520;
  const H       = 140;
  const plotW   = W - LABEL_W - PAD_R;
  const plotH   = H;
  const totalH  = PAD_T + H + PAD_B;
  const range   = (maxVal - minVal) || 1;
  const ticks = [maxVal, minVal + range * 0.66, minVal + range * 0.33, minVal];
  const scaleY = (v) => PAD_T + plotH - ((v - minVal) / range) * plotH;
  const scaleX = (i) =>
    LABEL_W + (dataPoints.length > 1 ? (i / (dataPoints.length - 1)) * plotW : plotW / 2);
  const pts  = dataPoints.map((v, i) => ({ x: scaleX(i), y: scaleY(v) }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaBottom = PAD_T + plotH;
  const area = pts.length > 0
    ? `${path} L${scaleX(dataPoints.length - 1).toFixed(1)},${areaBottom} L${scaleX(0).toFixed(1)},${areaBottom} Z`
    : "";

  return (
    <div className="linechart-wrap">
      <svg
        viewBox={`0 0 ${W} ${totalH}`}
        preserveAspectRatio="xMidYMid meet"
        className="linechart-svg"
        style={{ width: "100%", height: "auto" }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {ticks.map((val, idx) => {
          const y = scaleY(val);
          return (
            <g key={idx}>
              <line
                x1={LABEL_W}   y1={y.toFixed(1)}
                x2={W - PAD_R} y2={y.toFixed(1)}
                stroke="#f1f5f9" strokeWidth="1"
              />
              <text
                x={LABEL_W - 6}
                y={Math.min(Math.max(y + 4, PAD_T + 4), PAD_T + plotH)}
                textAnchor="end" fontSize="10"
                fill={val < 0 ? "#ef4444" : "#94a3b8"}
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {fmtAxis(Math.round(val))}
              </text>
            </g>
          );
        })}

        {minVal < 0 && maxVal > 0 && (
          <line
            x1={LABEL_W}   y1={scaleY(0).toFixed(1)}
            x2={W - PAD_R} y2={scaleY(0).toFixed(1)}
            stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3"
          />
        )}
        {pts.length > 0 && (
          <>
            <path d={area} fill="url(#lineGrad)" />
            <path d={path} fill="none" stroke="#22c55e" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4"
              fill="#fff" stroke="#22c55e" strokeWidth="2" />
            <text x={p.x.toFixed(1)} y={PAD_T + plotH + 18}
              textAnchor="middle" fontSize="10"
              fill="#94a3b8" fontFamily="Plus Jakarta Sans, sans-serif">
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function formatRp(val) {
  const abs = Math.abs(val || 0);
  return `Rp ${abs.toLocaleString("id-ID")}`;
}

function formatTanggal(str) {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function Laporan() {
  const [activeTab, setActiveTab]         = useState("ringkasan");
  const [filterTipe, setFilterTipe]       = useState("semua");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [search, setSearch]               = useState("");
  const [period]                          = useState("Mei 2026");
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [aiInsight, setAiInsight]         = useState("Memuat rekomendasi AI...");
  const [isExporting, setIsExporting]     = useState(false);
  const [currentPage, setCurrentPage]     = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/api/transactions`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gagal mengambil data");

        setTransactions(data.data || []);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
    const fetchAIInsight = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/transactions/insights`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();
        setAiInsight(data.insight || "Gagal memproses rekomendasi.");
      } catch (err) {
        console.error(err);
        setAiInsight("Gagal memuat rekomendasi AI.");
      }
    };
    if (!loading) fetchAIInsight();
  }, [loading]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTipe, filterKategori]);

  const totalMasuk  = transactions.filter(t => t.type === "INCOME").reduce((a, t) => a + (t.amount || 0), 0);
  const totalKeluar = transactions.filter(t => t.type === "EXPENSE").reduce((a, t) => a + Math.abs(t.amount || 0), 0);
  const laba        = totalMasuk - totalKeluar;
  const saldoAkhir  = laba;

  const chartsData = useMemo(() => {
    const monthsShort = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Ags","Sep","Okt","Nov","Des"];
    const anchorDate  = new Date();
    const monthlyMap  = {};
    const chartStructure = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap[ym] = { bulan: monthsShort[d.getMonth()], masuk: 0, keluar: 0 };
      chartStructure.push(ym);
    }

    transactions.forEach(t => {
      if (!t.date) return;
      const d  = new Date(t.date);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthlyMap[ym]) return;
      const amt = Number(t.amount) || 0;
      if (t.type === "INCOME")  monthlyMap[ym].masuk  += amt;
      if (t.type === "EXPENSE") monthlyMap[ym].keluar += Math.abs(amt);
    });

    const barData    = chartStructure.map(ym => monthlyMap[ym]);
    const lineData   = barData.map(b => b.masuk - b.keluar);
    const labels     = barData.map(b => b.bulan);
    const maxBarVal  = Math.max(...barData.flatMap(b => [b.masuk, b.keluar]), 100_000);
    const maxLineVal = Math.max(...lineData,  100_000);
    const minLineVal = Math.min(...lineData, 0);

    return { barData, lineData, labels, maxBarVal, maxLineVal, minLineVal };
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const groups = {};
    transactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const cat = t.category || "Lain-lain";
      groups[cat] = (groups[cat] || 0) + Math.abs(t.amount || 0);
    });
    const colors = ["#1a2a6c","#2563eb","#7F77DD","#22c55e","#f59e0b","#6366f1","#ec4899"];
    return Object.keys(groups).map((cat, i) => {
      const val = groups[cat];
      const pct = totalKeluar > 0 ? Math.round((val / totalKeluar) * 100) : 0;
      return { label: cat, pct, val, color: colors[i % colors.length] };
    }).sort((a, b) => b.val - a.val);
  }, [transactions, totalKeluar]);

  const { incomeBreakdown, expenseBreakdown } = useMemo(() => {
    const inc = {}, exp = {};
    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const cat = t.category || "Lain-lain";
      if (t.type === "INCOME")  inc[cat] = (inc[cat] || 0) + amt;
      if (t.type === "EXPENSE") exp[cat] = (exp[cat] || 0) + Math.abs(amt);
    });
    return {
      incomeBreakdown:  Object.entries(inc).map(([label, val]) => ({ label, val })),
      expenseBreakdown: Object.entries(exp).map(([label, val]) => ({ label, val })),
    };
  }, [transactions]);

  const profitMargin      = totalMasuk > 0 ? ((laba / totalMasuk) * 100).toFixed(1) : 0;
  const rasioPengeluaran = totalMasuk > 0 ? ((totalKeluar / totalMasuk) * 100).toFixed(1) : 0;
  const likuiditas       = totalKeluar > 0 ? (totalMasuk / totalKeluar).toFixed(1) : 0;
  const pertumbuhan      = 8.2; 

  const allKategori = ["semua", ...new Set(transactions.map(t => t.category || "Lain-lain"))];

  const filtered = transactions.filter(t => {
    const matchTipe = filterTipe === "semua" || t.type === filterTipe;
    const matchKat = filterKategori === "semua" || (t.category || "Lain-lain") === filterKategori;
    const matchSearch = (t.description || "").toLowerCase().includes(search.toLowerCase());
    return matchTipe && matchKat && matchSearch;
  });

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const startNumber = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endNumber   = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "transaksi", label: "Transaksi" },
    { id: "laba-rugi", label: "Laba & Rugi" },
  ];

  const handleExportPDF = () => {
    setIsExporting(true);
    const targetElement = document.getElementById("printable-report-area");
    const executeExport = () => {
      const opt = {
        margin: 0.3,
        filename: `Laporan_Keuangan_UMKM_${period.replace(" ", "_")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" }
      };
      window.html2pdf()
        .set(opt)
        .from(targetElement)
        .save()
        .then(() => setIsExporting(false))
        .catch((err) => {
          console.error("PDF Export error:", err);
          setIsExporting(false);
        });
    };

    if (window.html2pdf) {
      executeExport();
    } else {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      script.onload = executeExport;
      script.onerror = () => {
        alert("Gagal memuat sistem pencetak PDF. Periksa koneksi internet Anda.");
        setIsExporting(false);
      };
      document.head.appendChild(script);
    }
  };

  return (
    <div className="laporan-page" id="printable-report-area">
      {/* Topbar Area */}
      <div className="lap-topbar">
        <div>
          <h1 className="lap-title">Laporan Keuangan</h1>
          <p className="lap-sub">Rekap lengkap pemasukan, pengeluaran, dan laba rugi usaha berbasis real data.</p>
        </div>
        <div className="lap-topbar-actions">
          <div className="period-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {period}
          </div>
          <button onClick={handleExportPDF} disabled={isExporting || loading} className="lap-export-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isExporting ? "Mengekspor..." : "Ekspor PDF"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="lap-summary">
        <div className="lap-scard lap-scard-blue">
          <div className="lap-scard-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p className="lap-scard-label">Total Pemasukan</p>
            <p className="lap-scard-val">{formatRp(totalMasuk)}</p>
            <p className="lap-scard-trend trend-up">↑ Berhasil Terdata</p>
          </div>
        </div>
        <div className="lap-scard lap-scard-red">
          <div className="lap-scard-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p className="lap-scard-label">Total Pengeluaran</p>
            <p className="lap-scard-val">{formatRp(totalKeluar)}</p>
            <p className="lap-scard-trend trend-down">↓ Biaya Operasional</p>
          </div>
        </div>
        <div className="lap-scard lap-scard-green">
          <div className="lap-scard-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          <div>
            <p className="lap-scard-label">Laba Bersih</p>
            <p className="lap-scard-val" style={{ color: laba < 0 ? "#dc2626" : "#16a34a" }}>{formatRp(laba)}</p>
            <p className="lap-scard-trend" style={{ color: laba < 0 ? "#dc2626" : "#16a34a" }}>
              {laba >= 0 ? "↑ Surplus Bisnis" : "↓ Defisit Bisnis"}
            </p>
          </div>
        </div>
        <div className="lap-scard lap-scard-purple">
          <div className="lap-scard-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2" ry="2"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          </div>
          <div>
            <p className="lap-scard-label">Saldo Akhir Kas</p>
            <p className="lap-scard-val">{formatRp(saldoAkhir)}</p>
            <p className="lap-scard-trend trend-up">✓ Dana Tersedia</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="lap-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`lap-tab ${activeTab === t.id ? "lap-tab-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="lap-card" style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#64748b" }}>Memuat data keuangan usaha...</p>
        </div>
      ) : (
        <div className="lap-content">
          {activeTab === "ringkasan" && (
            <div className="lap-grid-2">
              
              {/* KOREKSI: KOLOM KIRI (Grafik & Breakdown) */}
              <div className="laporan-left-column">
                <div className="lap-card">
                  <div className="lap-card-head">
                    <p className="lap-card-title">Grafik Arus Kas</p>
                    <p className="lap-card-desc">Perbandingan bulanan pemasukan dan pengeluaran 6 bulan terakhir.</p>
                  </div>
                  <BarChart data={chartsData.barData} maxVal={chartsData.maxBarVal} />
                </div>

                <div className="lap-card">
                  <div className="lap-card-head">
                    <p className="lap-card-title">Tren Laba Bersih</p>
                    <p className="lap-card-desc">Pergerakan profit bersih operasional Anda.</p>
                  </div>
                  <LineChart
                    dataPoints={chartsData.lineData}
                    labels={chartsData.labels}
                    maxVal={chartsData.maxLineVal}
                    minVal={chartsData.minLineVal}
                  />
                </div>

                <div className="lap-card">
                  <div className="lap-card-head">
                    <p className="lap-card-title">Breakdown Pengeluaran</p>
                    <p className="lap-card-desc">Distribusi alokasi pengeluaran berdasarkan kategori bisnis.</p>
                  </div>
                  <div className="breakdown-grid">
                    {categoryBreakdown.length === 0 ? (
                      <p style={{ fontSize: "13px", color: "#94a3b8" }}>Belum ada data pengeluaran.</p>
                    ) : (
                      categoryBreakdown.map(c => (
                        <div key={c.label} className="breakdown-row">
                          <div className="breakdown-left">
                            <span className="breakdown-dot" style={{ background: c.color }} />
                            <span className="breakdown-label">{c.label}</span>
                          </div>
                          <div className="breakdown-bar-wrap">
                            <div className="breakdown-track">
                              <div className="breakdown-fill" style={{ width: `${c.pct}%`, background: c.color }} />
                            </div>
                            <span className="breakdown-pct">{c.pct}%</span>
                          </div>
                          <span className="breakdown-val">{formatRp(c.val)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* KOREKSI: KOLOM KANAN (Rasio Keuangan & AI Insight Diupgrade) */}
              <div className="laporan-right-column">
                <div className="lap-card">
                  <div className="lap-card-head">
                    <p className="lap-card-title">Analisis Rasio Keuangan</p>
                    <p className="lap-card-desc">Indikator kesehatan performa bisnis Anda.</p>
                  </div>
                  <div className="rasio-list">
                    {[
                      {
                        label: "Margin Keuntungan Bersih",
                        val: `${profitMargin}%`,
                        status: profitMargin >= 20 ? "good" : profitMargin >= 0 ? "normal" : "bad",
                        desc: profitMargin >= 20 ? "Profitabilitas sangat baik" : profitMargin >= 0 ? "Keuntungan tergolong rendah" : "Mengalami kerugian"
                      },
                      {
                        label: "Rasio Pengeluaran",
                        val: `${rasioPengeluaran}%`,
                        status: rasioPengeluaran <= 70 ? "good" : "warn",
                        desc: rasioPengeluaran <= 70 ? "Efisiensi biaya menjaga operasional" : "Biaya operasional membengkak"
                      },
                      {
                        label: "Pertumbuhan Pendapatan",
                        val: `${pertumbuhan}%`,
                        status: "good",
                        desc: "Mengalami tren kenaikan positif"
                      },
                      {
                        label: "Likuiditas",
                        val: `${likuiditas}x`,
                        status: likuiditas >= 1 ? "good" : "warn",
                        desc: likuiditas >= 1 ? "Arus kas cukup sehat" : "Perputaran uang sedang lambat"
                      }
                    ].map(r => (
                      <div key={r.label} className="rasio-row">
                        <div className="rasio-left">
                          <span className="rasio-label">{r.label}</span>
                          <span className="rasio-desc">{r.desc}</span>
                        </div>
                        <span className={`rasio-val rasio-${r.status}`}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KARTU AI BARU YANG DIPENUHI KE BAWAH */}
                <div className="lap-card lap-card-insight upgraded-ai-card">
                  <div className="ai-header-zone">
                    <div className="insight-icon-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <div className="ai-title-status">
                      <p className="insight-card-title">Rekomendasi AI Pintar</p>
                      <span className="ai-badge-score">Skor Finansial: <b>85/100</b></span>
                    </div>
                  </div>

                  <div className="ai-content-zone">
                    <p className="insight-card-text">{aiInsight}</p>
                  </div>

                  <div className="ai-action-zone">
                    <p className="action-zone-title">Saran Tindakan Prioritas :</p>
                    <ul className="ai-action-list">
                      <li>
                        <span className="action-dot-indicator efisiensi"></span>
                        <p><b>Efisiensi Biaya:</b> Alokasi anggaran operasional non-esensial perlu dipantau agar rasio profit tetap stabil.</p>
                      </li>
                      <li>
                        <span className="action-dot-indicator kas"></span>
                        <p><b>Optimasi Kas:</b> Pertahankan sisa profit bulan ini sebagai bantalan dana cadangan darurat kas.</p>
                      </li>
                    </ul>
                  </div>

                  <div className="ai-footer-zone">
                    <button className="insight-card-btn" onClick={() => alert("Konsultasi PDF AI sedang disiapkan!")}>
                      Cetak Strategi Bisnis AI Lengkap →
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {activeTab === "transaksi" && (
            <div className="lap-card">
              <div className="trx-filter-bar">
                <div className="trx-search-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input
                    type="text"
                    placeholder="Cari deskripsi transaksi..."
                    className="trx-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="trx-filters">
                  <select className="trx-select" value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}>
                    <option value="semua">Semua Tipe</option>
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                  <select className="trx-select" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
                    {allKategori.map(cat => (
                      <option key={cat} value={cat}>{cat === "semua" ? "Semua Kategori" : cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="trx-table-wrap">
                <table className="trx-table">
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Kategori</th>
                      <th>Keterangan</th>
                      <th style={{ textAlign: "right" }}>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "#94a3b8" }}>Tidak ada transaksi ditemukan.</td>
                      </tr>
                    ) : (
                      paginatedTransactions.map(t => (
                        <tr key={t.id}>
                          <td>{formatTanggal(t.date)}</td>
                          <td><span className="trx-cat-badge">{t.category}</span></td>
                          <td>{t.description || "-"}</td>
                          <td style={{ textAlign: "right", fontWeight: "600", color: t.type === "INCOME" ? "#16a34a" : "#dc2626" }}>
                            {t.type === "INCOME" ? "+" : "-"}{formatRp(t.amount)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="trx-pagination" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "12px", color: "#64748b" }}>Menampilkan {startNumber}-{endNumber} dari {filtered.length} transaksi</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="trx-select" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Sebelumnya</button>
                  <button className="trx-select" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Selanjutnya</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "laba-rugi" && (
            <div className="lap-card">
              <div className="lap-card-head" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "12px", marginBottom: "16px" }}>
                <p className="lap-card-title">Laporan Laba Rugi Terperinci</p>
                <p className="lap-card-desc">Periode Berjalan: {period}</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#16a34a", marginBottom: "8px", textTransform: "uppercase" }}>1. Pendapatan Usaha</h3>
                  {incomeBreakdown.map(i => (
                    <div key={i.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", padding: "6px 0", borderBottom: "0.5px dashed #f1f5f9" }}>
                      <span style={{ color: "#475569" }}>Pendapatan {i.label}</span>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>{formatRp(i.val)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "14px", color: "#1e293b", background: "#f8fafc", padding: "10px", borderRadius: "6px", marginTop: "8px" }}>
                    <span>TOTAL PENDAPATAN</span>
                    <span>{formatRp(totalMasuk)}</span>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#dc2626", marginBottom: "8px", textTransform: "uppercase" }}>2. Beban Operasional</h3>
                  {expenseBreakdown.map(e => (
                    <div key={e.label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", padding: "6px 0", borderBottom: "0.5px dashed #f1f5f9" }}>
                      <span style={{ color: "#475569" }}>Beban Biaya {e.label}</span>
                      <span style={{ fontWeight: "600", color: "#1e293b" }}>{formatRp(e.val)}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700", fontSize: "14px", color: "#1e293b", background: "#f8fafc", padding: "10px", borderRadius: "6px", marginTop: "8px" }}>
                    <span>TOTAL BEBAN OPERASIONAL</span>
                    <span>{formatRp(totalKeluar)}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "15px", color: laba >= 0 ? "#16a34a" : "#dc2626", background: laba >= 0 ? "#e8f5e9" : "#ffebee", padding: "12px", borderRadius: "8px", marginTop: "12px", border: laba >= 0 ? "1px solid #c8e6c9" : "1px solid #ffcdd2" }}>
                  <span>{laba >= 0 ? "LABA BERSIH (SURPLUS)" : "RUGI BERSIH (DEFISIT)"}</span>
                  <span>{formatRp(laba)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}