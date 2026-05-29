import { useState } from "react";
import "../css/Laporan.css";

// ── Bar Chart SVG (pemasukan vs pengeluaran bulanan) ───────────────────────
function BarChart() {
  const data = [
    { bulan: "Mei", masuk: 95, keluar: 70 },
    { bulan: "Jun", masuk: 110, keluar: 80 },
    { bulan: "Jul", masuk: 88, keluar: 65 },
    { bulan: "Ags", masuk: 102, keluar: 75 },
    { bulan: "Sep", masuk: 118, keluar: 82 },
    { bulan: "Okt", masuk: 128, keluar: 83 },
  ];

  const maxVal = 140;
  const chartH = 120;
  const barW = 18;
  const gap = 8;
  const groupW = barW * 2 + gap;
  const groupGap = 28;
  const totalW = data.length * (groupW + groupGap) - groupGap;

  return (
    <div className="barchart-wrap">
      <svg viewBox={`0 0 ${totalW + 20} ${chartH + 30}`}
        preserveAspectRatio="xMidYMid meet" className="barchart-svg">
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = t * chartH;
          return (
            <line key={t} x1="0" y1={y} x2={totalW + 20} y2={y}
              stroke="#f1f5f9" strokeWidth="1" />
          );
        })}
        {data.map((d, i) => {
          const x = i * (groupW + groupGap) + 10;
          const hMasuk = (d.masuk / maxVal) * chartH;
          const hKeluar = (d.keluar / maxVal) * chartH;
          return (
            <g key={d.bulan}>
              {/* Pemasukan */}
              <rect x={x} y={chartH - hMasuk} width={barW} height={hMasuk}
                rx="4" fill="#2563eb" opacity="0.85" />
              {/* Pengeluaran */}
              <rect x={x + barW + gap} y={chartH - hKeluar}
                width={barW} height={hKeluar} rx="4" fill="#ef4444" opacity="0.75" />
              {/* Label bulan */}
              <text x={x + barW + gap / 2} y={chartH + 16}
                textAnchor="middle" fontSize="10" fill="#94a3b8"
                fontFamily="Plus Jakarta Sans, sans-serif">
                {d.bulan}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="barchart-legend">
        <span className="bcleg-item">
          <span className="bcleg-dot" style={{ background: "#2563eb" }} />
          Pemasukan
        </span>
        <span className="bcleg-item">
          <span className="bcleg-dot" style={{ background: "#ef4444" }} />
          Pengeluaran
        </span>
      </div>
    </div>
  );
}

// ── Line Chart SVG (tren laba bersih) ─────────────────────────────────────
function LineChart() {
  const data = [22, 28, 20, 25, 34, 42];
  const labels = ["Mei", "Jun", "Jul", "Ags", "Sep", "Okt"];
  const maxV = 50;
  const W = 320;
  const H = 90;

  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (v / maxV) * H,
  }));

  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${path} L${W},${H} L0,${H} Z`;

  return (
    <div className="linechart-wrap">
      <svg viewBox={`0 0 ${W} ${H + 24}`} preserveAspectRatio="none" className="linechart-svg">
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((t) => (
          <line key={t} x1="0" y1={t * H} x2={W} y2={t * H}
            stroke="#f1f5f9" strokeWidth="1" />
        ))}
        <path d={area} fill="url(#lineGrad)" />
        <path d={path} fill="none" stroke="#22c55e"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5"
              fill="#fff" stroke="#22c55e" strokeWidth="2" />
            <text x={p.x} y={H + 16} textAnchor="middle"
              fontSize="9" fill="#94a3b8"
              fontFamily="Plus Jakarta Sans, sans-serif">
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Data transaksi ─────────────────────────────────────────────────────────
const allTransaksi = [
  { id: 1, tanggal: "31 Okt 2024", keterangan: "Penjualan Toko (Cash)", kategori: "Pemasukan", nominal: 1250000, tipe: "masuk", status: "Sukses" },
  { id: 2, tanggal: "30 Okt 2024", keterangan: "Belanja Bahan Baku", kategori: "Bahan Baku", nominal: -3400000, tipe: "keluar", status: "Lunas" },
  { id: 3, tanggal: "29 Okt 2024", keterangan: "Penjualan Online", kategori: "Pemasukan", nominal: 2100000, tipe: "masuk", status: "Sukses" },
  { id: 4, tanggal: "28 Okt 2024", keterangan: "Tagihan Listrik & Air", kategori: "Operasional", nominal: -850000, tipe: "keluar", status: "Lunas" },
  { id: 5, tanggal: "27 Okt 2024", keterangan: "Penjualan Toko (Cash)", kategori: "Pemasukan", nominal: 980000, tipe: "masuk", status: "Sukses" },
  { id: 6, tanggal: "25 Okt 2024", keterangan: "Gaji Karyawan", kategori: "Operasional", nominal: -4500000, tipe: "keluar", status: "Lunas" },
  { id: 7, tanggal: "24 Okt 2024", keterangan: "Penjualan Grosir", kategori: "Pemasukan", nominal: 5800000, tipe: "masuk", status: "Sukses" },
  { id: 8, tanggal: "22 Okt 2024", keterangan: "Sewa Tempat", kategori: "Operasional", nominal: -2000000, tipe: "keluar", status: "Lunas" },
  { id: 9, tanggal: "20 Okt 2024", keterangan: "Penjualan Toko (Cash)", kategori: "Pemasukan", nominal: 1450000, tipe: "masuk", status: "Sukses" },
  { id: 10, tanggal: "18 Okt 2024", keterangan: "Pembelian Perlengkapan", kategori: "Lain-lain", nominal: -620000, tipe: "keluar", status: "Lunas" },
  { id: 11, tanggal: "15 Okt 2024", keterangan: "Penjualan Online", kategori: "Pemasukan", nominal: 3200000, tipe: "masuk", status: "Sukses" },
  { id: 12, tanggal: "12 Okt 2024", keterangan: "Belanja Bahan Baku", kategori: "Bahan Baku", nominal: -2800000, tipe: "keluar", status: "Lunas" },
];

function formatRp(val) {
  const abs = Math.abs(val);
  return `Rp ${abs.toLocaleString("id-ID")}`;
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function Laporan() {
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [filterTipe, setFilterTipe] = useState("semua");
  const [filterKategori, setFilterKategori] = useState("semua");
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("Oktober 2024");

  const tabs = [
    { id: "ringkasan", label: "Ringkasan" },
    { id: "transaksi", label: "Transaksi" },
    { id: "laba-rugi", label: "Laba & Rugi" },
  ];

  const filtered = allTransaksi.filter((t) => {
    const matchTipe = filterTipe === "semua" || t.tipe === filterTipe;
    const matchKat = filterKategori === "semua" || t.kategori === filterKategori;
    const matchSearch = t.keterangan.toLowerCase().includes(search.toLowerCase());
    return matchTipe && matchKat && matchSearch;
  });

  const totalMasuk = allTransaksi.filter(t => t.tipe === "masuk").reduce((a, t) => a + t.nominal, 0);
  const totalKeluar = allTransaksi.filter(t => t.tipe === "keluar").reduce((a, t) => a + Math.abs(t.nominal), 0);
  const laba = totalMasuk - totalKeluar;

  return (
    <div className="laporan-page">

      {/* ── Top bar ── */}
      <div className="lap-topbar">
        <div>
          <h1 className="lap-title">Laporan Keuangan</h1>
          <p className="lap-sub">Rekap lengkap pemasukan, pengeluaran, dan laba rugi usaha.</p>
        </div>
        <div className="lap-topbar-actions">
          <button className="period-btn">
            {period}
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="5 8 10 13 15 8" />
            </svg>
          </button>
          <button className="lap-export-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── Summary cards ── */}
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
            <p className="lap-scard-val">Rp 14.780.000</p>
            <p className="lap-scard-trend trend-up">↗ +8.2% vs bulan lalu</p>
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
            <p className="lap-scard-val">Rp 14.170.000</p>
            <p className="lap-scard-trend trend-down">↘ -2.1% dari batas aman</p>
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
            <p className="lap-scard-val">Rp 610.000</p>
            <p className="lap-scard-trend trend-up">↗ Margin 4.1%</p>
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
            <p className="lap-scard-val">Rp 45.230.000</p>
            <p className="lap-scard-trend trend-up">↗ +12.5% vs bulan lalu</p>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="lap-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`lap-tab ${activeTab === t.id ? "lap-tab-active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TAB: RINGKASAN ══ */}
      {activeTab === "ringkasan" && (
        <div className="lap-content">
          <div className="lap-grid-2">

            {/* Chart Pemasukan vs Pengeluaran */}
            <div className="lap-card">
              <div className="lap-card-head">
                <h2 className="lap-card-title">Pemasukan vs Pengeluaran</h2>
                <p className="lap-card-desc">6 bulan terakhir</p>
              </div>
              <BarChart />
            </div>

            {/* Tren Laba Bersih */}
            <div className="lap-card">
              <div className="lap-card-head">
                <h2 className="lap-card-title">Tren Laba Bersih</h2>
                <p className="lap-card-desc">6 bulan terakhir (juta Rp)</p>
              </div>
              <LineChart />
              <div className="laba-summary">
                <div className="laba-item">
                  <span className="laba-dot" style={{ background: "#22c55e" }} />
                  <span className="laba-key">Tertinggi</span>
                  <span className="laba-val">Rp 42jt (Okt)</span>
                </div>
                <div className="laba-item">
                  <span className="laba-dot" style={{ background: "#ef4444" }} />
                  <span className="laba-key">Terendah</span>
                  <span className="laba-val">Rp 20jt (Jul)</span>
                </div>
                <div className="laba-item">
                  <span className="laba-dot" style={{ background: "#2563eb" }} />
                  <span className="laba-key">Rata-rata</span>
                  <span className="laba-val">Rp 28.5jt</span>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown Pengeluaran */}
          <div className="lap-card">
            <div className="lap-card-head">
              <h2 className="lap-card-title">Breakdown Pengeluaran per Kategori</h2>
              <p className="lap-card-desc">Oktober 2024</p>
            </div>
            <div className="breakdown-grid">
              {[
                { label: "Bahan Baku", pct: 44, val: "Rp 6.200.000", color: "#1a2a6c" },
                { label: "Gaji Karyawan", pct: 32, val: "Rp 4.500.000", color: "#2563eb" },
                { label: "Sewa Tempat", pct: 14, val: "Rp 2.000.000", color: "#7F77DD" },
                { label: "Listrik & Air", pct: 6, val: "Rp 850.000", color: "#22c55e" },
                { label: "Lain-lain", pct: 4, val: "Rp 620.000", color: "#f59e0b" },
              ].map((k) => (
                <div key={k.label} className="breakdown-row">
                  <div className="breakdown-left">
                    <span className="breakdown-dot" style={{ background: k.color }} />
                    <span className="breakdown-label">{k.label}</span>
                  </div>
                  <div className="breakdown-bar-wrap">
                    <div className="breakdown-track">
                      <div className="breakdown-fill"
                        style={{ width: `${k.pct}%`, background: k.color }} />
                    </div>
                    <span className="breakdown-pct">{k.pct}%</span>
                  </div>
                  <span className="breakdown-val">{k.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: TRANSAKSI ══ */}
      {activeTab === "transaksi" && (
        <div className="lap-content">
          <div className="lap-card">
            {/* Filter bar */}
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
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="trx-filters">
                <select className="trx-select"
                  value={filterTipe}
                  onChange={(e) => setFilterTipe(e.target.value)}>
                  <option value="semua">Semua Tipe</option>
                  <option value="masuk">Pemasukan</option>
                  <option value="keluar">Pengeluaran</option>
                </select>
                <select className="trx-select"
                  value={filterKategori}
                  onChange={(e) => setFilterKategori(e.target.value)}>
                  <option value="semua">Semua Kategori</option>
                  <option value="Pemasukan">Pemasukan</option>
                  <option value="Bahan Baku">Bahan Baku</option>
                  <option value="Operasional">Operasional</option>
                  <option value="Lain-lain">Lain-lain</option>
                </select>
              </div>
            </div>

            {/* Tabel */}
            <div className="trx-table-wrap">
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
                      <td colSpan={5} className="trx-empty">
                        Tidak ada transaksi yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => (
                      <tr key={t.id}>
                        <td className="trx-keterangan">
                          <span className={`trx-type-dot ${t.tipe === "masuk" ? "dot-masuk" : "dot-keluar"}`} />
                          {t.keterangan}
                        </td>
                        <td>
                          <span className="trx-kategori-tag">{t.kategori}</span>
                        </td>
                        <td className="trx-tanggal">{t.tanggal}</td>
                        <td>
                          <span className={`trx-status status-${t.status.toLowerCase()}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className={`trx-nominal ${t.tipe === "masuk" ? "nominal-plus" : "nominal-minus"}`}>
                          {t.tipe === "masuk" ? "+" : "-"} {formatRp(t.nominal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="trx-footer">
              Menampilkan {filtered.length} dari {allTransaksi.length} transaksi
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB: LABA RUGI ══ */}
      {activeTab === "laba-rugi" && (
        <div className="lap-content">
          <div className="lap-grid-2">
            <div className="lap-card">
              <h2 className="lap-card-title">Laporan Laba & Rugi</h2>
              <p className="lap-card-desc" style={{ marginBottom: 16 }}>Oktober 2024</p>

              <div className="lr-section">
                <div className="lr-section-title lr-green-title">PENDAPATAN</div>
                {[
                  { label: "Penjualan Toko (Cash)", val: 3680000 },
                  { label: "Penjualan Online", val: 5300000 },
                  { label: "Penjualan Grosir", val: 5800000 },
                ].map((r) => (
                  <div key={r.label} className="lr-row">
                    <span className="lr-label">{r.label}</span>
                    <span className="lr-val lr-plus">{formatRp(r.val)}</span>
                  </div>
                ))}
                <div className="lr-subtotal">
                  <span>Total Pendapatan</span>
                  <span className="lr-plus">Rp 14.780.000</span>
                </div>
              </div>

              <div className="lr-section">
                <div className="lr-section-title lr-red-title">BEBAN USAHA</div>
                {[
                  { label: "Bahan Baku", val: 6200000 },
                  { label: "Gaji Karyawan", val: 4500000 },
                  { label: "Sewa Tempat", val: 2000000 },
                  { label: "Listrik & Air", val: 850000 },
                  { label: "Perlengkapan & Lain-lain", val: 620000 },
                ].map((r) => (
                  <div key={r.label} className="lr-row">
                    <span className="lr-label">{r.label}</span>
                    <span className="lr-val lr-minus">{formatRp(r.val)}</span>
                  </div>
                ))}
                <div className="lr-subtotal">
                  <span>Total Beban</span>
                  <span className="lr-minus">Rp 14.170.000</span>
                </div>
              </div>

              <div className="lr-total">
                <span className="lr-total-label">LABA BERSIH</span>
                <span className="lr-total-val">Rp 610.000</span>
              </div>
            </div>

            {/* Rasio & Analisis */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="lap-card">
                <h2 className="lap-card-title">Rasio Keuangan</h2>
                <p className="lap-card-desc" style={{ marginBottom: 14 }}>Indikator kesehatan usaha</p>
                {[
                  { label: "Profit Margin", val: "4.1%", status: "warn", desc: "Di bawah rata-rata sektor (8%)" },
                  { label: "Rasio Pengeluaran", val: "95.9%", status: "bad", desc: "Terlalu tinggi, perlu efisiensi" },
                  { label: "Pertumbuhan Pendapatan", val: "+8.2%", status: "good", desc: "Lebih baik dari bulan lalu" },
                  { label: "Likuiditas", val: "2.3×", status: "good", desc: "Arus kas cukup sehat" },
                ].map((r) => (
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
                  <p className="insight-card-text">
                    Profit margin bulan ini 4.1% masih di bawah target. AI menyarankan
                    efisiensi biaya bahan baku melalui pembelian grosir dan evaluasi
                    pengeluaran operasional yang bisa ditekan.
                  </p>
                  <button className="insight-card-btn">Lihat Detail AI →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
