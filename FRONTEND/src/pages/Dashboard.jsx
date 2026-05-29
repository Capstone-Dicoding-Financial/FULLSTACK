import { useState } from "react";
import "../css/dashboard.css";

// Mini sparkline chart (SVG)
function SparklineChart() {
  const points = [
    { x: 0, y: 80 },
    { x: 40, y: 65 },
    { x: 80, y: 72 },
    { x: 120, y: 50 },
    { x: 160, y: 60 },
    { x: 200, y: 40 },
    { x: 240, y: 55 },
    { x: 280, y: 35 },
    { x: 320, y: 45 },
    { x: 360, y: 30 },
    { x: 380, y: 38 },
  ];

  const projected = [
    { x: 380, y: 38 },
    { x: 420, y: 28 },
    { x: 460, y: 20 },
    { x: 500, y: 25 },
    { x: 540, y: 15 },
    { x: 580, y: 18 },
    { x: 620, y: 10 },
  ];

  const toPath = (pts) =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  const toArea = (pts) =>
    `${toPath(pts)} L ${pts[pts.length - 1].x} 100 L ${pts[0].x} 100 Z`;

  return (
    <div className="chart-container">
      <div className="chart-label-today">Hari ini</div>
      <svg viewBox="0 0 640 110" preserveAspectRatio="none" className="sparkline-svg">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {/* Area fill - actual */}
        <path d={toArea(points)} fill="url(#areaGrad)" />
        {/* Area fill - projected */}
        <path d={toArea(projected)} fill="url(#projGrad)" />
        {/* Line - actual */}
        <path d={toPath(points)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        {/* Line - projected (dashed) */}
        <path d={toPath(projected)} fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
        {/* Today dot */}
        <circle cx="380" cy="38" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

const transaksi = [
  {
    id: 1,
    icon: "🏪",
    keterangan: "Penjualan Toko (Cash)",
    tanggal: "Hari ini, 14:30",
    status: "Sukses",
    statusClass: "status-sukses",
    nominal: "+ Rp 1.250.000",
    nominalClass: "nominal-plus",
  },
  {
    id: 2,
    icon: "🛒",
    keterangan: "Belanja Bahan Baku",
    tanggal: "Kemarin, 09:15",
    status: "Lunas",
    statusClass: "status-lunas",
    nominal: "- Rp 3.400.000",
    nominalClass: "nominal-minus",
  },
  {
    id: 3,
    icon: "⚡",
    keterangan: "Tagihan Listrik & Air",
    tanggal: "12 Okt 2023",
    status: "Menunggu",
    statusClass: "status-menunggu",
    nominal: "- Rp 850.000",
    nominalClass: "nominal-minus",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* Top Bar */}
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

      <div className="dashboard-body">
        {/* LEFT COLUMN */}
        <div className="dashboard-left">
          {/* Summary Cards */}
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
              <div className="card-amount">Rp 45.230.000</div>
              <div className="card-trend trend-up">↗ +12.5% vs bulan lalu</div>
            </div>

            <div className="card card-pemasukan">
              <div className="card-header">
                <span className="card-label">Pemasukan Bulan Ini</span>
                <span className="card-icon card-icon-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </span>
              </div>
              <div className="card-amount">Rp 128.500.000</div>
              <div className="card-trend trend-up">↗ +8.2% target tercapai</div>
            </div>

            <div className="card card-pengeluaran">
              <div className="card-header">
                <span className="card-label">Pengeluaran Bulan Ini</span>
                <span className="card-icon card-icon-red">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <polyline points="19 12 12 19 5 12" />
                  </svg>
                </span>
              </div>
              <div className="card-amount">Rp 83.270.000</div>
              <div className="card-trend trend-down">↘ -2.1% dari batas aman</div>
            </div>
          </div>

          {/* Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">
                  <span className="chart-title-icon">✦</span> Prediksi Arus Kas (AI)
                </h2>
                <p className="chart-desc">Proyeksi 30 hari ke depan berdasarkan tren historis.</p>
              </div>
              <span className="chart-badge">30 Hari</span>
            </div>
            <SparklineChart />
          </div>

          {/* Transaksi Terakhir */}
          <div className="transaksi-card">
            <div className="transaksi-header">
              <h2 className="section-title">Transaksi Terakhir</h2>
              <button className="lihat-semua-btn">Lihat Semua</button>
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
                {transaksi.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span className="trx-icon">{t.icon}</span>
                      {t.keterangan}
                    </td>
                    <td className="trx-tanggal">{t.tanggal}</td>
                    <td>
                      <span className={`trx-status ${t.statusClass}`}>{t.status}</span>
                    </td>
                    <td className={`trx-nominal ${t.nominalClass}`}>{t.nominal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN - AI Insights */}
        <div className="dashboard-right">
          <div className="insights-card">
            <div className="insights-header">
              <span className="insights-icon">🤖</span>
              <h2 className="insights-title">Insights Cerdas</h2>
            </div>
            <p className="insights-desc">
              Sistem AI kami mendeteksi pola pada keuangan toko Anda minggu ini.
            </p>

            <div className="insight-item insight-positive">
              <div className="insight-item-header">
                <span className="insight-badge insight-badge-green">↗ Potensi Penjualan Tinggi</span>
              </div>
              <p>
                Akhir pekan ini diprediksi ada lonjakan pembeli 20% berdasarkan tren gajian akhir bulan.
              </p>
            </div>

            <div className="insight-item insight-warning">
              <div className="insight-item-header">
                <span className="insight-badge insight-badge-yellow">⚠ Awas Stok Menipis</span>
              </div>
              <p>
                Pengeluaran untuk Bahan Baku A lebih rendah dari rata-rata. Cek inventaris agar tidak kehabisan saat ramai.
              </p>
            </div>

            <button className="btn-detail-ai">Lihat Detail Laporan AI</button>
          </div>
        </div>
      </div>
    </div>
  );
}
