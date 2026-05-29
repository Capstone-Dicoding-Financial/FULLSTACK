import { useState } from "react";
import "../css/AiInsights.css";

// ── Sparkline SVG untuk prediksi arus kas ──────────────────────────────────
function CashFlowChart() {
  const actual = [
    [0, 85], [60, 78], [120, 60], [180, 55], [240, 68],
    [300, 50], [360, 42],
  ];
  const predicted = [
    [360, 42], [420, 35], [480, 22], [540, 18],
    [600, 12], [660, 20], [720, 8],
  ];

  const toPath = (pts) =>
    pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");

  const toArea = (pts) => {
    const path = toPath(pts);
    return `${path} L${pts[pts.length - 1][0]},100 L${pts[0][0]},100 Z`;
  };

  const months = ["M1", "M2", "M3", "M4 (Est.)"];

  return (
    <div className="chart-wrapper">
      <svg viewBox="0 0 740 110" preserveAspectRatio="none" className="cf-svg">
        <defs>
          <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="cfGradPred" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" y1={y} x2="740" y2={y}
            stroke="#e2e8f0" strokeWidth="0.5" />
        ))}
        <path d={toArea(actual)} fill="url(#cfGrad)" />
        <path d={toArea(predicted)} fill="url(#cfGradPred)" />
        <path d={toPath(actual)} fill="none" stroke="#2563eb"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={toPath(predicted)} fill="none" stroke="#93c5fd"
          strokeWidth="2" strokeDasharray="7 4"
          strokeLinecap="round" strokeLinejoin="round" />
        <line x1="360" y1="0" x2="360" y2="100"
          stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
        {actual.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.5"
            fill="#fff" stroke="#2563eb" strokeWidth="2" />
        ))}
        <circle cx="360" cy="42" r="5.5"
          fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
      </svg>
      <div className="cf-xaxis">
        {months.map((m, i) => (
          <span key={i}
            className={`cf-xlabel ${m.includes("Est") ? "cf-xlabel-est" : ""}`}>
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Donut ring ─────────────────────────────────────────────────────────────
function DonutRing({ value, size = 120, stroke = 12, color = "#2563eb", label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <div className="donut-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div className="donut-center">
        <span className="donut-val">{value}%</span>
        {label && <span className="donut-lbl">{label}</span>}
      </div>
    </div>
  );
}

// ── Bar horizontal ─────────────────────────────────────────────────────────
function HBar({ label, pct, amount, color, delta, sub }) {
  return (
    <div className="hbar-row">
      <div className="hbar-left">
        <span className="hbar-dot" style={{ background: color }} />
        <div>
          <span className="hbar-label">{label}</span>
          {sub && <span className="hbar-sub">{sub}</span>}
        </div>
      </div>
      <div className="hbar-right">
        <span className="hbar-pct">{pct}%</span>
        {delta !== undefined && (
          <span className={`hbar-delta ${delta >= 0 ? "delta-up" : "delta-dn"}`}>
            {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className="hbar-track">
        <div className="hbar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Score bar ──────────────────────────────────────────────────────────────
function ScoreBar({ label, val, max = 100, color }) {
  return (
    <div className="sbar-row">
      <span className="sbar-label">{label}</span>
      <div className="sbar-track">
        <div className="sbar-fill" style={{ width: `${(val / max) * 100}%`, background: color }} />
      </div>
      <span className="sbar-val">{val}/{max}</span>
    </div>
  );
}

// ── Kinerja item ──────────────────────────────────────────────────────────
function KinerjaItem({ icon, label, value, status, desc }) {
  const statusClass = {
    good: "kinerja-status-good",
    warn: "kinerja-status-warn",
    info: "kinerja-status-info",
  }[status] || "kinerja-status-info";

  return (
    <div className={`kinerja-item ${statusClass}`}>
      <div className="kinerja-icon">{icon}</div>
      <div className="kinerja-body">
        <div className="kinerja-label">{label}</div>
        <div className="kinerja-value">{value}</div>
        {desc && <div className="kinerja-desc">{desc}</div>}
      </div>
    </div>
  );
}

// ── Key Insight item ──────────────────────────────────────────────────────
function KeyInsightItem({ icon, text, tag, tagColor }) {
  return (
    <div className="ki-item">
      <span className="ki-icon">{icon}</span>
      <span className="ki-text">{text}</span>
      {tag && (
        <span className="ki-tag" style={{ background: tagColor?.bg, color: tagColor?.fg }}>
          {tag}
        </span>
      )}
    </div>
  );
}

// ── Anomali item ──────────────────────────────────────────────────────────
function AnomalyItem({ icon, title, desc, severity }) {
  const cls = severity === "high" ? "anomaly-high" : severity === "med" ? "anomaly-med" : "anomaly-low";
  return (
    <div className={`anomaly-item ${cls}`}>
      <span className="anomaly-icon">{icon}</span>
      <div>
        <p className="anomaly-title">{title}</p>
        <p className="anomaly-desc">{desc}</p>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AiInsights() {
  const [period, setPeriod] = useState("Bulan Ini (Oktober 2024)");

  return (
    <div className="ai-page">

      {/* ── Top bar ── */}
      <div className="ai-topbar">
        <div>
          <h1 className="ai-title">AI Insights &amp; Analytics</h1>
          <p className="ai-sub">Deep dive into your financial data patterns and AI-driven forecasts.</p>
        </div>
        <div className="ai-topbar-actions">
          <button className="period-btn">
            {period}
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="5 8 10 13 15 8" />
            </svg>
          </button>
          <button className="dl-btn" title="Download laporan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Baris 1: Chart + Akurasi ── */}
      <div className="ai-row ai-row-chart">

        {/* Prediksi Arus Kas */}
        <div className="ai-card card-chart">
          <div className="card-head">
            <div>
              <h2 className="card-title">Prediksi Arus Kas (30 Hari Kedepan)</h2>
              <p className="card-desc">Berdasarkan data historis 12 bulan terakhir</p>
            </div>
            <span className="badge badge-green">↗ Optimis (+12%)</span>
          </div>
          <CashFlowChart />
          <div className="chart-legend">
            <span className="legend-item">
              <span className="legend-line legend-actual" />Aktual
            </span>
            <span className="legend-item">
              <span className="legend-line legend-pred" />Prediksi
            </span>
          </div>
        </div>

        {/* Akurasi Model AI */}
        <div className="ai-card card-akurasi">
          <h2 className="card-title">Akurasi Model AI</h2>
          <div className="akurasi-center">
            <DonutRing value={92} size={130} stroke={13} color="#1a2a6c" label="Tingkat Akurasi" />
          </div>
          <div className="akurasi-stats">
            <div className="akurasi-row">
              <span className="akurasi-dot dot-blue" />
              <span className="akurasi-key">Data Historis</span>
              <span className="akurasi-val-tag tag-strong">Kuat</span>
            </div>
            <div className="akurasi-row">
              <span className="akurasi-dot dot-red" />
              <span className="akurasi-key">Anomali Terdeteksi</span>
              <span className="akurasi-val-tag">2 Bulan Lalu</span>
            </div>
            <div className="akurasi-row">
              <span className="akurasi-dot dot-green" />
              <span className="akurasi-key">MAPE Model</span>
              <span className="akurasi-val-tag tag-success">&lt; 15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Baris 2: Ringkasan Kinerja + Analisis Pengeluaran ── */}
      <div className="ai-row ai-row-middle">

        {/* Ringkasan Kinerja Keuangan */}
        <div className="ai-card card-kinerja">
          <h2 className="card-title">
            <span className="title-icon">📋</span> Ringkasan Kinerja Keuangan
          </h2>
          <p className="card-desc" style={{ marginBottom: 14 }}>Status keuangan toko bulan Oktober 2024</p>

          <div className="kinerja-grid">
            <KinerjaItem
              icon="💧"
              label="Cash Flow"
              value="Stabil"
              status="good"
              desc="Arus kas konsisten 3 bulan terakhir"
            />
            <KinerjaItem
              icon="🏦"
              label="Likuiditas"
              value="Aman"
              status="good"
              desc="Saldo kas cukup untuk 18 hari operasional"
            />
            <KinerjaItem
              icon="📊"
              label="Rasio Pengeluaran"
              value="Tinggi"
              status="warn"
              desc="Bahan baku melebihi 50% dari total biaya"
            />
            <KinerjaItem
              icon="📈"
              label="Pertumbuhan"
              value="+12%"
              status="info"
              desc="Dibanding bulan September 2024"
            />
          </div>

          <div className="kinerja-bars">
            <ScoreBar label="Arus Kas" val={85} color="#1D9E75" />
            <ScoreBar label="Rasio Pengeluaran" val={62} color="#BA7517" />
            <ScoreBar label="Konsistensi" val={78} color="#2563eb" />
            <ScoreBar label="Likuiditas" val={70} color="#7F77DD" />
          </div>
        </div>

        {/* Analisis Pengeluaran */}
        <div className="ai-card card-pengeluaran">
          <div className="card-head">
            <div className="card-title-group">
              <span className="card-title-bar" />
              <h2 className="card-title">Analisis Pengeluaran</h2>
            </div>
          </div>

          <div className="pengeluaran-body">
            <div className="pengeluaran-donut">
              <div className="pdonut-wrap">
                <svg viewBox="0 0 110 110" className="pdonut-svg">
                  <circle cx="55" cy="55" r="42" fill="none" stroke="#e2e8f0" strokeWidth="14" />
                  <circle cx="55" cy="55" r="42" fill="none" stroke="#1a2a6c" strokeWidth="14"
                    strokeDasharray={`${0.55 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                    strokeDashoffset={0}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                  <circle cx="55" cy="55" r="42" fill="none" stroke="#22c55e" strokeWidth="14"
                    strokeDasharray={`${0.30 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                    strokeDashoffset={`${-(0.55) * 2 * Math.PI * 42}`}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                  <circle cx="55" cy="55" r="42" fill="none" stroke="#ef4444" strokeWidth="14"
                    strokeDasharray={`${0.15 * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                    strokeDashoffset={`${-(0.85) * 2 * Math.PI * 42}`}
                    style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }} />
                  <text x="55" y="50" textAnchor="middle" className="pdonut-text-sm">Total</text>
                  <text x="55" y="64" textAnchor="middle" className="pdonut-text-lg">Rp 12.4M</text>
                </svg>
              </div>
            </div>

            <div className="pengeluaran-detail">
              <HBar label="Bahan Baku" pct={55} color="#1a2a6c"
                delta={5} sub="AI merekomendasikan supplier baru" />
              <HBar label="Operasional" pct={30} color="#22c55e"
                delta={-2} sub="Stabil bulan ini" />
              <HBar label="Lainnya" pct={15} color="#ef4444"
                delta={undefined} sub="Pengeluaran tak terduga" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Baris 3: Key Insights + Rekomendasi AI ── */}
      <div className="ai-row ai-row-middle">

        {/* Key Insights Bulanan */}
        <div className="ai-card card-keyinsights">
          <h2 className="card-title">
            <span className="title-icon">🔍</span> Key Insights Bulan Ini
          </h2>
          <p className="card-desc" style={{ marginBottom: 16 }}>Pola dan temuan penting dari data transaksi Oktober 2024</p>

          <div className="ki-list">
            <KeyInsightItem
              icon="📈"
              text="Pendapatan naik 12% dibanding bulan lalu"
              tag="Positif"
              tagColor={{ bg: "#dcfce7", fg: "#166534" }}
            />
            <KeyInsightItem
              icon="📉"
              text="Pengeluaran operasional naik 8% — perlu dipantau"
              tag="Perhatian"
              tagColor={{ bg: "#fef3c7", fg: "#92400e" }}
            />
            <KeyInsightItem
              icon="⚠️"
              text="Pembelian bahan baku tertinggi terjadi di minggu ke-2"
              tag="Pola"
              tagColor={{ bg: "#eff6ff", fg: "#1e40af" }}
            />
            <KeyInsightItem
              icon="🎯"
              text="Produk kategori A menyumbang 45% dari total omzet"
              tag="Unggulan"
              tagColor={{ bg: "#f5f3ff", fg: "#5b21b6" }}
            />
            <KeyInsightItem
              icon="🗓️"
              text="Hari Selasa & Jumat secara konsisten menghasilkan pemasukan tertinggi"
              tag="Tren"
              tagColor={{ bg: "#eff6ff", fg: "#1e40af" }}
            />
            <KeyInsightItem
              icon="💰"
              text="Rata-rata transaksi meningkat dari Rp 85rb menjadi Rp 97rb"
              tag="Positif"
              tagColor={{ bg: "#dcfce7", fg: "#166534" }}
            />
          </div>
        </div>

        {/* Rekomendasi AI */}
        <div className="ai-card card-alerts">
          <h2 className="card-title">Rekomendasi AI</h2>

          <div className="alert-item alert-green">
            <div className="alert-icon alert-icon-green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" /><path d="M12 16h.01" />
              </svg>
            </div>
            <div>
              <p className="alert-title">Peluang Penghematan</p>
              <p className="alert-text">
                AI mendeteksi pola pembelian bahan baku yang bisa dioptimalkan.
                Beli dalam jumlah besar di pertengahan bulan dapat menghemat hingga 8%.
              </p>
              <button className="alert-link">Lihat Detail Analisis →</button>
            </div>
          </div>

          <div className="alert-item alert-red">
            <div className="alert-icon alert-icon-red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <p className="alert-title">Peringatan Arus Kas</p>
              <p className="alert-text">
                Terdapat tagihan hutang jatuh tempo dalam 5 hari kedepan yang melebihi saldo kas saat ini.
                Segera tindak lanjuti faktur yang belum terbayar.
              </p>
              <button className="alert-link alert-link-red">Kelola Hutang Piutang →</button>
            </div>
          </div>

          <div className="alert-item alert-blue">
            <div className="alert-icon alert-icon-blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div>
              <p className="alert-title">Tren Positif Terdeteksi</p>
              <p className="alert-text">
                Pemasukan bulan ini meningkat 12% dibanding bulan lalu.
                Model LSTM memproyeksikan tren ini berlanjut 3 minggu ke depan.
              </p>
              <button className="alert-link alert-link-blue">Lihat Proyeksi →</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Baris 4: Anomali Terdeteksi ── */}
      <div className="ai-row" style={{ gridTemplateColumns: "1fr" }}>
        <div className="ai-card card-anomali">
          <div className="card-head">
            <div>
              <h2 className="card-title">
                <span className="title-icon">🔔</span> Anomali Terdeteksi
              </h2>
              <p className="card-desc">Perubahan signifikan yang terdeteksi oleh model AI bulan ini</p>
            </div>
            <span className="badge badge-yellow">3 Anomali</span>
          </div>
          <div className="anomali-grid">
            <AnomalyItem
              icon="⚡"
              title="Pengeluaran listrik naik 32%"
              desc="Minggu ke-3 Oktober — jauh di atas rata-rata 3 bulan terakhir (Rp 780rb → Rp 1.03jt)"
              severity="high"
            />
            <AnomalyItem
              icon="📦"
              title="Pembelian stok melonjak 2.1×"
              desc="Terjadi pada tanggal 14–15 Oktober, kemungkinan persiapan stok akhir bulan"
              severity="med"
            />
            <AnomalyItem
              icon="📉"
              title="Penurunan pemasukan minggu ke-3"
              desc="Pemasukan turun 18% di minggu ke-3, pola berulang dibanding bulan sebelumnya"
              severity="med"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
