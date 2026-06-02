import { useState, useEffect, useMemo } from "react";
import "../css/Laporan.css";

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
        const response = await fetch("http://localhost:5000/api/transactions", {
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
        const response = await fetch("http://localhost:5000/api/transactions/insights", {
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
  const rasioPengeluaran  = totalMasuk > 0 ? ((totalKeluar / totalMasuk) * 100).toFixed(1) : 0;
  const likuiditas        = totalKeluar > 0 ? (totalMasuk / totalKeluar).toFixed(1) : 0;
  const pertumbuhan       = 8.2;
  const allKategori = ["semua", ...new Set(transactions.map(t => t.category))];
  const filtered = transactions.filter(t => {
    const matchTipe   = filterTipe === "semua" || t.type === filterTipe;
    const matchKat    = filterKategori === "semua" || t.category === filterKategori;
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
        margin:       0.3,
        filename:     `Laporan_Keuangan_UMKM_${period.replace(" ", "_")}.pdf`,
        image:        { type: "jpeg", quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: "in", format: "letter", orientation: "portrait" }
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
    <div className="laporan-page">

      <div className="lap-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="lap-title">Laporan Keuangan</h1>
          <p className="lap-sub">Rekap lengkap pemasukan, pengeluaran, dan laba rugi usaha berbasis real data.</p>
        </div>

        <button 
          onClick={handleExportPDF} 
          disabled={isExporting || loading}
          className="trx-select"
          style={{
            background: "#2563eb",
            color: "#fff",
            padding: "10px 16px",
            fontWeight: "600",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: (isExporting || loading) ? 0.6 : 1,
            boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isExporting ? "Memproses PDF..." : "Export PDF"}
        </button>
      </div>
      <div id="printable-report-area">
        
        <div className="lap-summary">
          <div className="lap-scard lap-scard-blue">
            <div className="lap-scard-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            </div>
            <div>
              <p className="lap-scard-label">Total Pemasukan</p>
              <p className="lap-scard-val">{formatRp(totalMasuk)}</p>
            </div>
          </div>

          <div className="lap-scard lap-scard-red">
            <div className="lap-scard-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
            <div>
              <p className="lap-scard-label">Total Pengeluaran</p>
              <p className="lap-scard-val">{formatRp(totalKeluar)}</p>
            </div>
          </div>

          <div className="lap-scard lap-scard-green">
            <div className="lap-scard-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <p className="lap-scard-label">Laba Bersih</p>
              <p className="lap-scard-val">{formatRp(laba)}</p>
            </div>
          </div>

          <div className="lap-scard lap-scard-purple">
            <div className="lap-scard-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div>
              <p className="lap-scard-label">Saldo Akhir</p>
              <p className="lap-scard-val">{formatRp(saldoAkhir)}</p>
            </div>
          </div>
        </div>

        <div className="lap-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`lap-tab ${activeTab === t.id ? "lap-tab-active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "ringkasan" && (
          <div className="lap-content">
            <div className="lap-grid-2">
              <div className="lap-card">
                <div className="lap-card-head">
                  <h2 className="lap-card-title">Pemasukan vs Pengeluaran</h2>
                  <p className="lap-card-desc">6 Bulan Terakhir</p>
                </div>
                <BarChart data={chartsData.barData} maxVal={chartsData.maxBarVal} />
              </div>

              <div className="lap-card">
                <div className="lap-card-head">
                  <h2 className="lap-card-title">Tren Laba Bersih</h2>
                  <p className="lap-card-desc">Pergerakan Arus Kas</p>
                </div>
                <LineChart
                  dataPoints={chartsData.lineData}
                  labels={chartsData.labels}
                  maxVal={chartsData.maxLineVal}
                  minVal={chartsData.minLineVal}
                />
              </div>
            </div>

            <div className="lap-card" style={{ marginTop: "20px" }}>
              <div className="lap-card-head">
                <h2 className="lap-card-title">Breakdown Pengeluaran per Kategori</h2>
                <p className="lap-card-desc">Akumulasi Real-Time</p>
              </div>
              <div className="breakdown-grid">
                {categoryBreakdown.length === 0 ? (
                  <p style={{ color: "#94a3b8", padding: "10px 0" }}>Belum ada data pengeluaran.</p>
                ) : (
                  categoryBreakdown.map(k => (
                    <div key={k.label} className="breakdown-row">
                      <div className="breakdown-left">
                        <span className="breakdown-dot" style={{ background: k.color }} />
                        <span className="breakdown-label">{k.label}</span>
                      </div>
                      <div className="breakdown-bar-wrap">
                        <div className="breakdown-track">
                          <div className="breakdown-fill" style={{ width: `${k.pct}%`, background: k.color }} />
                        </div>
                        <span className="breakdown-pct">{k.pct}%</span>
                      </div>
                      <span className="breakdown-val">{formatRp(k.val)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "transaksi" && (
          <div className="lap-content">
            <div className="lap-card">
              <div className="trx-filter-bar">
                <div className="trx-search-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    className="trx-search"
                    placeholder="Cari transaksi..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="trx-filters">
                  <select className="trx-select" value={filterTipe} onChange={e => setFilterTipe(e.target.value)}>
                    <option value="semua">Semua Tipe</option>
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                  </select>
                  <select className="trx-select" value={filterKategori} onChange={e => setFilterKategori(e.target.value)}>
                    {allKategori.map(kat => (
                      <option key={kat} value={kat}>
                        {kat === "semua" ? "Semua Kategori" : kat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="trx-table-wrap">
                {loading ? (
                  <div style={{ padding: "20px", textAlign: "center" }}>Memuat data...</div>
                ) : (
                  <table className="trx-table">
                    <thead>
                      <tr>
                        <th>Keterangan</th>
                        <th>Kategori</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Nominal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="trx-empty">Tidak ada transaksi yang cocok.</td>
                        </tr>
                      ) : (
                        paginatedTransactions.map(t => (
                          <tr key={t.id}>
                            <td className="trx-keterangan">
                              <span className={`trx-type-dot ${t.type === "INCOME" ? "dot-masuk" : "dot-keluar"}`} />
                              {t.description}
                            </td>
                            <td><span className="trx-kategori-tag">{t.category}</span></td>
                            <td className="trx-tanggal">{formatTanggal(t.date)}</td>
                            <td><span className="trx-status status-sukses">Sukses</span></td>
                            <td className={`trx-nominal ${t.type === "INCOME" ? "nominal-plus" : "nominal-minus"}`}>
                              {t.type === "INCOME" ? "+" : "-"} {formatRp(t.amount)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="trx-footer" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px", marginTop:"14px" }}>
                <span>
                  Menampilkan {startNumber}–{endNumber} dari {filtered.length} transaksi (Total database: {transactions.length})
                </span>
                {totalPages > 1 && (
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <button
                      className="trx-select"
                      style={{ padding:"4px 12px", height:"auto", cursor: currentPage===1 ? "not-allowed" : "pointer", opacity: currentPage===1 ? 0.5 : 1, background:"#fff" }}
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(p-1, 1))}
                    >
                      &larr; Prev
                    </button>
                    <span style={{ fontSize:"13px", color:"#64748b" }}>
                      Hal <strong>{currentPage}</strong> dari {totalPages}
                    </span>
                    <button
                      className="trx-select"
                      style={{ padding:"4px 12px", height:"auto", cursor: currentPage===totalPages ? "not-allowed" : "pointer", opacity: currentPage===totalPages ? 0.5 : 1, background:"#fff" }}
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))}
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "laba-rugi" && (
          <div className="lap-content">
            <div className="lap-grid-2">
              <div className="lap-card">
                <h2 className="lap-card-title">Laporan Laba & Rugi</h2>
                <p className="lap-card-desc" style={{ marginBottom: 16 }}>{period}</p>

                <div className="lr-section">
                  <div className="lr-section-title lr-green-title">PENDAPATAN</div>
                  {incomeBreakdown.length > 0 ? (
                    incomeBreakdown.map(r => (
                      <div key={r.label} className="lr-row">
                        <span className="lr-label">{r.label}</span>
                        <span className="lr-val lr-plus">{formatRp(r.val)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="lr-row">
                      <span className="lr-label" style={{ color:"#94a3b8" }}>Belum ada data pendapatan</span>
                    </div>
                  )}
                  <div className="lr-subtotal">
                    <span>Total Pendapatan</span>
                    <span className="lr-plus">{formatRp(totalMasuk)}</span>
                  </div>
                </div>

                <div className="lr-section">
                  <div className="lr-section-title lr-red-title">BEBAN USAHA</div>
                  {expenseBreakdown.length > 0 ? (
                    expenseBreakdown.map(r => (
                      <div key={r.label} className="lr-row">
                        <span className="lr-label">{r.label}</span>
                        <span className="lr-val lr-minus">{formatRp(r.val)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="lr-row">
                      <span className="lr-label" style={{ color:"#94a3b8" }}>Belum ada data beban</span>
                    </div>
                  )}
                  <div className="lr-subtotal">
                    <span>Total Beban</span>
                    <span className="lr-minus">{formatRp(totalKeluar)}</span>
                  </div>
                </div>

                <div className="lr-total">
                  <span className="lr-total-label">LABA BERSIH</span>
                  <span className="lr-total-val">{formatRp(laba)}</span>
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div className="lap-card">
                  <h2 className="lap-card-title">Rasio Keuangan</h2>
                  <p className="lap-card-desc" style={{ marginBottom:14 }}>Indikator kesehatan usaha</p>
                  {[
                    { label:"Profit Margin",            val:`${profitMargin}%`,   status: profitMargin >= 10 ? "good" : "warn",    desc: profitMargin >= 10 ? "Margin profit terpantau sehat" : "Di bawah rata-rata target (10%)" },
                    { label:"Rasio Pengeluaran",         val:`${rasioPengeluaran}%`, status: rasioPengeluaran > 80 ? "bad" : "good", desc: rasioPengeluaran > 80 ? "Terlalu tinggi, perlu efisiensi" : "Beban operasional terkendali" },
                    { label:"Pertumbuhan Pendapatan",    val:`${pertumbuhan >= 0 ? "+" : ""}${pertumbuhan}%`, status: pertumbuhan >= 0 ? "good" : "bad", desc: pertumbuhan >= 0 ? "Lebih baik dari bulan lalu" : "Terjadi penurunan omset" },
                    { label:"Likuiditas",                val:`${likuiditas}×`,      status: likuiditas >= 1 ? "good" : "warn",       desc: likuiditas >= 1 ? "Arus kas cukup sehat" : "Perputaran uang sedang lambat" },
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

                <div className="lap-card lap-card-insight">
                  <div className="insight-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <p className="insight-card-title">Rekomendasi AI</p>
                    <p className="insight-card-text">{aiInsight}</p>
                    <button className="insight-card-btn">Lihat Detail AI →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}