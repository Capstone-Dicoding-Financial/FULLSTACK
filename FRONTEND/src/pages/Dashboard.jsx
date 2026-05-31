import { useState, useEffect } from "react";
import "../css/dashboard.css";

function SparklineChart() {
  const points = [
    { x: 0, y: 80 }, { x: 40, y: 65 }, { x: 80, y: 72 }, { x: 120, y: 50 },
    { x: 160, y: 60 }, { x: 200, y: 40 }, { x: 240, y: 55 }, { x: 280, y: 35 },
    { x: 320, y: 45 }, { x: 360, y: 30 }, { x: 380, y: 38 },
  ];

  const projected = [
    { x: 380, y: 38 }, { x: 420, y: 28 }, { x: 460, y: 20 }, { x: 500, y: 25 },
    { x: 540, y: 15 }, { x: 580, y: 18 }, { x: 620, y: 10 },
  ];

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const toArea = (pts) => `${toPath(pts)} L ${pts[pts.length - 1].x} 100 L ${pts[0].x} 100 Z`;

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
        <path d={toArea(points)} fill="url(#areaGrad)" />
        <path d={toArea(projected)} fill="url(#projGrad)" />
        <path d={toPath(points)} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
        <path d={toPath(projected)} fill="none" stroke="#93c5fd" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
        <circle cx="380" cy="38" r="5" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [transaksiList, setTransaksiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
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

        const [resSummary, resTrx] = await Promise.all([
          fetch("http://localhost:5000/api/transactions/summary", { headers }),
          fetch("http://localhost:5000/api/transactions", { headers }),
        ]);

        if (!resSummary.ok || !resTrx.ok) {
          throw new Error("Gagal mengambil data dari server");
        }

        const dataSummary = await resSummary.json();
        const dataTrx = await resTrx.json();

        if (dataSummary.success) setSummary(dataSummary.data);
        if (dataTrx.transactions) setTransaksiList(dataTrx.transactions.slice(0, 3));
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDataDashboard();
  }, []);

  if (loading) return <div className="loading-state">Memuat data dashboard...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;

  return (
    <div className="dashboard-page">
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
        <div className="dashboard-left">
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
              <div className="card-amount">{formatRupiah(summary.balance)}</div>
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
              <div className="card-amount">{formatRupiah(summary.totalIncome)}</div>
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
              <div className="card-amount">{formatRupiah(summary.totalExpense)}</div>
              <div className="card-trend trend-down">↘ Batas pengeluaran aman</div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <h2 className="chart-title">Prediksi Arus Kas (AI)</h2>
                <p className="chart-desc">Proyeksi 30 hari ke depan berdasarkan tren historis.</p>
              </div>
              <span className="chart-badge">30 Hari</span>
            </div>
            <SparklineChart />
          </div>

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

        <div className="dashboard-right">
          <div className="insights-card">
            <div className="insights-header">
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