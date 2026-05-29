import { useState } from "react";
import "../css/Forecast.css";

// ─────────────────────────────────────────────
// DATA DUMMY (nanti diganti output model GRU/LSTM)
// ─────────────────────────────────────────────
const DATA = {
  "30": {
    saldoAkhir: "Rp 52.400.000", saldoChange: +15,
    pemasukan: "Rp 78.200.000",
    pengeluaran: "Rp 25.800.000",
    mape: "12.3%", accuracy: 92,
    skenario: {
      optimis: { val: "Rp 58.000.000", growth: "+20.8%" },
      normal:  { val: "Rp 52.400.000", growth: "+15.0%" },
      pesimis: { val: "Rp 45.700.000", growth: "+0.4%"  },
    },
    timeline: [
      { label: "Minggu 1", pred: "Rp 48.100.000", change: +5.2, ci: "±1.2jt" },
      { label: "Minggu 2", pred: "Rp 50.300.000", change: +4.6, ci: "±1.5jt" },
      { label: "Minggu 3", pred: "Rp 53.700.000", change: +6.8, ci: "±2.1jt" },
      { label: "Minggu 4", pred: "Rp 52.400.000", change: -2.4, ci: "±2.4jt" },
    ],
    chartActual:   [[0,72],[60,68],[120,75],[180,64],[240,58],[300,62],[360,55]],
    chartPred:     [[360,55],[420,50],[480,44],[540,40],[600,35],[660,38],[720,30]],
  },
  "60": {
    saldoAkhir: "Rp 61.800.000", saldoChange: +36,
    pemasukan: "Rp 148.500.000",
    pengeluaran: "Rp 51.300.000",
    mape: "14.1%", accuracy: 89,
    skenario: {
      optimis: { val: "Rp 70.500.000", growth: "+55.4%" },
      normal:  { val: "Rp 61.800.000", growth: "+36.1%" },
      pesimis: { val: "Rp 51.200.000", growth: "+12.8%" },
    },
    timeline: [
      { label: "Minggu 1–2",  pred: "Rp 48.100.000", change: +5.2,  ci: "±1.4jt" },
      { label: "Minggu 3–4",  pred: "Rp 52.400.000", change: +8.9,  ci: "±2.0jt" },
      { label: "Minggu 5–6",  pred: "Rp 56.900.000", change: +8.6,  ci: "±2.8jt" },
      { label: "Minggu 7–8",  pred: "Rp 61.800.000", change: +8.6,  ci: "±3.5jt" },
    ],
    chartActual:   [[0,72],[60,68],[120,75],[180,64],[240,58],[300,62],[360,55]],
    chartPred:     [[360,55],[450,48],[540,40],[630,32],[720,22]],
  },
  "90": {
    saldoAkhir: "Rp 74.200.000", saldoChange: +63,
    pemasukan: "Rp 218.000.000",
    pengeluaran: "Rp 78.900.000",
    mape: "16.8%", accuracy: 85,
    skenario: {
      optimis: { val: "Rp 88.000.000", growth: "+93.8%" },
      normal:  { val: "Rp 74.200.000", growth: "+63.4%" },
      pesimis: { val: "Rp 59.600.000", growth: "+31.2%" },
    },
    timeline: [
      { label: "Bulan 1", pred: "Rp 52.400.000", change: +15.0, ci: "±2.0jt" },
      { label: "Bulan 2", pred: "Rp 61.800.000", change: +17.9, ci: "±3.5jt" },
      { label: "Bulan 3", pred: "Rp 74.200.000", change: +20.1, ci: "±5.0jt" },
    ],
    chartActual:   [[0,72],[60,68],[120,75],[180,64],[240,58],[300,62],[360,55]],
    chartPred:     [[360,55],[480,44],[600,32],[720,18]],
  },
};

// ─────────────────────────────────────────────
// Komponen Chart Besar
// ─────────────────────────────────────────────
function ForecastChart({ actual, predicted, period }) {
  const allPts = [...actual, ...predicted.slice(1)];
  const minY = Math.min(...allPts.map(p => p[1])) - 8;
  const maxY = Math.max(...allPts.map(p => p[1])) + 8;
  const W = 760, H = 160;

  const scaleX = (x) => (x / 720) * W;
  const scaleY = (y) => H - ((y - minY) / (maxY - minY)) * H;

  const toPath = (pts) =>
    pts.map(([x, y], i) =>
      `${i === 0 ? "M" : "L"}${scaleX(x).toFixed(1)},${scaleY(y).toFixed(1)}`
    ).join(" ");

  const toArea = (pts, baseline = H) => {
    const path = toPath(pts);
    return `${path} L${scaleX(pts[pts.length - 1][0]).toFixed(1)},${baseline} L${scaleX(pts[0][0]).toFixed(1)},${baseline} Z`;
  };

  // Confidence band untuk predicted
  const upper = predicted.map(([x, y]) => [x, Math.max(minY + 1, y - 6)]);
  const lower = predicted.map(([x, y]) => [x, Math.min(maxY - 1, y + 6)]);
  const bandPath = `${toPath(upper)} L${scaleX(lower[lower.length - 1][0])},${scaleY(lower[lower.length - 1][1])} ` +
    lower.slice().reverse().map(([x, y]) => `L${scaleX(x).toFixed(1)},${scaleY(y).toFixed(1)}`).join(" ") + " Z";

  // Grid Y lines
  const gridY = [25, 50, 75].map(pct => minY + ((maxY - minY) * pct / 100));

  const dividerX = scaleX(360);

  return (
    <div className="forecast-chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="forecast-svg">
        <defs>
          <linearGradient id="fcActGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="fcPredGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.01" />
          </linearGradient>
          <linearGradient id="fcBandGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* Grid */}
        {gridY.map((y, i) => (
          <line key={i}
            x1="0" y1={scaleY(y).toFixed(1)} x2={W} y2={scaleY(y).toFixed(1)}
            stroke="#e2e8f0" strokeWidth="0.6" />
        ))}

        {/* Today divider */}
        <line x1={dividerX} y1="0" x2={dividerX} y2={H}
          stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 3" />
        <text x={dividerX + 6} y="12" fontSize="9" fill="#94a3b8" fontFamily="Plus Jakarta Sans, sans-serif">Hari ini</text>

        {/* Confidence band */}
        <path d={bandPath} fill="url(#fcBandGrad)" />

        {/* Area fills */}
        <path d={toArea(actual)} fill="url(#fcActGrad)" />
        <path d={toArea(predicted)} fill="url(#fcPredGrad)" />

        {/* Lines */}
        <path d={toPath(actual)} fill="none" stroke="#1d4ed8" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={toPath(predicted)} fill="none" stroke="#0ea5e9" strokeWidth="2"
          strokeDasharray="8 5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots on actual */}
        {actual.map(([x, y], i) => (
          <circle key={i}
            cx={scaleX(x).toFixed(1)} cy={scaleY(y).toFixed(1)} r="3.5"
            fill="#fff" stroke="#1d4ed8" strokeWidth="2" />
        ))}

        {/* Junction dot */}
        <circle
          cx={scaleX(predicted[0][0]).toFixed(1)}
          cy={scaleY(predicted[0][1]).toFixed(1)}
          r="5.5" fill="#fff" stroke="#0ea5e9" strokeWidth="2.5" />
      </svg>

      {/* X-axis labels */}
      <div className="fc-xaxis">
        {["M1", "M2", "M3", period === "30" ? "M4 (Prediksi)" : period === "60" ? "M4–M6 (Prediksi)" : "M4–M7 (Prediksi)"].map((m, i) => (
          <span key={i} className={`fc-xlabel ${i === 3 ? "fc-xlabel-pred" : ""}`}>{m}</span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, subColor, highlight }) {
  return (
    <div className={`kpi-card ${highlight ? "kpi-highlight" : ""}`}>
      <div className="kpi-top">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub" style={{ color: subColor }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Skenario Card
// ─────────────────────────────────────────────
function SkenarioCard({ type, val, growth, active, onClick }) {
  const map = {
    optimis: { icon: "🚀", label: "Optimis",  color: "#16a34a", bg: "#f0fdf4", border: "#86efac" },
    normal:  { icon: "📊", label: "Normal",   color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" },
    pesimis: { icon: "⚠️", label: "Pesimis",  color: "#dc2626", bg: "#fff5f5", border: "#fca5a5" },
  };
  const m = map[type];
  return (
    <button
      className={`skenario-card ${active ? "skenario-active" : ""}`}
      style={active ? { background: m.bg, borderColor: m.border } : {}}
      onClick={onClick}
    >
      <div className="skenario-icon">{m.icon}</div>
      <div className="skenario-label">{m.label}</div>
      <div className="skenario-val" style={{ color: active ? m.color : "#1e293b" }}>{val}</div>
      <div className="skenario-growth" style={{ color: m.color }}>{growth}</div>
      {active && <div className="skenario-active-dot" style={{ background: m.color }} />}
    </button>
  );
}

// ─────────────────────────────────────────────
// Timeline Row
// ─────────────────────────────────────────────
function TimelineRow({ label, pred, change, ci, index }) {
  const isUp = change >= 0;
  const barW = Math.min(Math.abs(change) * 5, 100);
  return (
    <div className="tl-row" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="tl-period">{label}</div>
      <div className="tl-pred">{pred}</div>
      <div className="tl-change-wrap">
        <div className="tl-bar-track">
          <div className="tl-bar-fill"
            style={{
              width: `${barW}%`,
              background: isUp ? "#22c55e" : "#ef4444",
              marginLeft: isUp ? "50%" : `calc(50% - ${barW}%)`,
            }}
          />
          <div className="tl-bar-center" />
        </div>
        <span className={`tl-change ${isUp ? "tl-up" : "tl-dn"}`}>
          {isUp ? "↑" : "↓"} {Math.abs(change)}%
        </span>
      </div>
      <div className="tl-ci">{ci}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Insight Card
// ─────────────────────────────────────────────
function InsightCard({ icon, type, title, text, action }) {
  const cls = { pos: "ins-pos", warn: "ins-warn", tip: "ins-tip" }[type];
  return (
    <div className={`ins-card ${cls}`}>
      <div className="ins-icon">{icon}</div>
      <div className="ins-body">
        <p className="ins-title">{title}</p>
        <p className="ins-text">{text}</p>
        {action && <button className="ins-action">{action} →</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Metric Pill (Evaluasi Model)
// ─────────────────────────────────────────────
function MetricPill({ label, value, desc, color }) {
  return (
    <div className="metric-pill">
      <div className="metric-val" style={{ color }}>{value}</div>
      <div className="metric-label">{label}</div>
      {desc && <div className="metric-desc">{desc}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function ForecastArusKas() {
  const [period, setPeriod] = useState("30");
  const [activeSkenario, setActiveSkenario] = useState("normal");
  const d = DATA[period];

  return (
    <div className="fc-page">

      {/* ── Header ── */}
      <div className="fc-header">
        <div>
          <h1 className="fc-title">Forecast Arus Kas</h1>
          <p className="fc-sub">Prediksi arus kas UMKM berdasarkan model GRU/LSTM · Data real-time</p>
        </div>
        <div className="fc-header-right">
          <div className="period-tabs">
            {["30", "60", "90"].map(p => (
              <button
                key={p}
                className={`period-tab ${period === p ? "period-tab-active" : ""}`}
                onClick={() => setPeriod(p)}
              >
                {p} Hari
              </button>
            ))}
          </div>
          <button className="fc-dl-btn" title="Download laporan">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* ── KPI Row ── */}
      <div className="fc-kpi-row">
        <KpiCard
          icon="💰"
          label="Prediksi Saldo Akhir"
          value={d.saldoAkhir}
          sub={`↑ +${d.saldoChange}% dari saat ini`}
          subColor="#16a34a"
          highlight
        />
        <KpiCard
          icon="📥"
          label="Prediksi Pemasukan"
          value={d.pemasukan}
          sub={`${period} hari ke depan`}
          subColor="#2563eb"
        />
        <KpiCard
          icon="📤"
          label="Prediksi Pengeluaran"
          value={d.pengeluaran}
          sub={`${period} hari ke depan`}
          subColor="#dc2626"
        />
        <KpiCard
          icon="🤖"
          label="Akurasi Model"
          value={`${d.accuracy}%`}
          sub={`MAPE ${d.mape}`}
          subColor="#7c3aed"
        />
      </div>

      {/* ── Grafik Utama ── */}
      <div className="fc-card fc-card-chart">
        <div className="fc-card-head">
          <div>
            <h2 className="fc-card-title">Grafik Prediksi Arus Kas · {period} Hari</h2>
            <p className="fc-card-desc">Proyeksi net cash flow berdasarkan model GRU/LSTM dengan confidence interval 90%</p>
          </div>
          <div className="chart-legend-row">
            <span className="fcleg-item">
              <span className="fcleg-line fcleg-actual" />Aktual
            </span>
            <span className="fcleg-item">
              <span className="fcleg-line fcleg-pred" />Prediksi
            </span>
            <span className="fcleg-item">
              <span className="fcleg-band" />Confidence Band
            </span>
          </div>
        </div>
        <ForecastChart actual={d.chartActual} predicted={d.chartPred} period={period} />
      </div>

      {/* ── Skenario + Timeline ── */}
      <div className="fc-row fc-row-mid">

        {/* Skenario */}
        <div className="fc-card card-skenario">
          <h2 className="fc-card-title">Skenario Forecast</h2>
          <p className="fc-card-desc">Proyeksi saldo akhir dalam 3 kemungkinan kondisi</p>
          <div className="skenario-grid">
            {["optimis", "normal", "pesimis"].map(s => (
              <SkenarioCard
                key={s}
                type={s}
                val={d.skenario[s].val}
                growth={d.skenario[s].growth}
                active={activeSkenario === s}
                onClick={() => setActiveSkenario(s)}
              />
            ))}
          </div>
          <div className="skenario-note">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7" /><path d="M8 7v4" /><circle cx="8" cy="5.5" r=".5" fill="currentColor" stroke="none" />
            </svg>
            Skenario dihitung dari variasi ±1σ dan ±2σ pada output model
          </div>
        </div>

        {/* Timeline */}
        <div className="fc-card card-timeline">
          <h2 className="fc-card-title">Timeline Prediksi</h2>
          <p className="fc-card-desc">Rincian proyeksi per periode dengan confidence interval</p>

          <div className="tl-header">
            <span>Periode</span>
            <span>Prediksi Saldo</span>
            <span>Perubahan</span>
            <span>CI (±)</span>
          </div>
          <div className="tl-list">
            {d.timeline.map((t, i) => (
              <TimelineRow key={i} {...t} index={i} />
            ))}
          </div>

          <div className="tl-footer">
            <span className="tl-footer-dot tl-dot-up" />Naik
            <span className="tl-footer-dot tl-dot-dn" style={{ marginLeft: 12 }} />Turun
            <span style={{ marginLeft: 8, color: "#94a3b8", fontSize: 11 }}>· CI = Confidence Interval</span>
          </div>
        </div>
      </div>

      {/* ── Insight AI ── */}
      <div className="fc-card card-insights">
        <div className="fc-card-head">
          <div>
            <h2 className="fc-card-title">
              <span className="title-icon">🔮</span> Insight Forecast AI
            </h2>
            <p className="fc-card-desc">Analisis otomatis dari model berdasarkan data {period} hari ke depan</p>
          </div>
          <span className="badge-model">Model: GRU + LSTM</span>
        </div>
        <div className="insights-grid">
          <InsightCard
            icon="📈"
            type="pos"
            title="Tren Positif"
            text={`Kas diperkirakan meningkat ${d.saldoChange}% dalam ${period} hari ke depan. Pola pemasukan konsisten pada hari Selasa & Jumat mendukung proyeksi ini.`}
            action="Lihat detail tren"
          />
          <InsightCard
            icon="⚠️"
            type="warn"
            title="Risiko Minggu ke-3"
            text="Pengeluaran diprediksi naik signifikan pada minggu ke-3 berdasarkan pola historis pembelian bahan baku. Siapkan buffer kas."
            action="Kelola pengeluaran"
          />
          <InsightCard
            icon="💡"
            type="tip"
            title="Saran Optimasi"
            text="Kurangi pembelian stok besar pada akhir bulan. Distribusikan pembelian ke minggu ke-1 dan ke-2 untuk menjaga likuiditas harian."
            action="Lihat rencana stok"
          />
        </div>
      </div>

      {/* ── Evaluasi Model ── */}
      <div className="fc-card card-eval">
        <div className="fc-card-head">
          <div>
            <h2 className="fc-card-title">
              <span className="title-icon">🧠</span> Evaluasi Model AI
            </h2>
            <p className="fc-card-desc">Performa model GRU + LSTM berdasarkan data validasi historis</p>
          </div>
          <div className="eval-badge-wrap">
            <span className="eval-badge">GRU</span>
            <span className="eval-badge">LSTM</span>
            <span className="eval-badge eval-badge-blue">Ensemble</span>
          </div>
        </div>

        <div className="eval-body">
          <div className="eval-metrics">
            <MetricPill label="Accuracy" value={`${d.accuracy}%`} desc="Tingkat akurasi keseluruhan" color="#1d4ed8" />
            <MetricPill label="MAPE" value={d.mape} desc="Mean Absolute Percentage Error" color="#7c3aed" />
            <MetricPill label="MAE" value="Rp 850rb" desc="Mean Absolute Error per prediksi" color="#0891b2" />
            <MetricPill label="Horizon" value={`${period}h`} desc="Jangkauan prediksi aktif" color="#059669" />
          </div>

          <div className="eval-info">
            <div className="eval-info-row">
              <span className="eval-info-label">Arsitektur</span>
              <span className="eval-info-val">GRU (64 unit) + LSTM (128 unit) Ensemble</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label">Data Training</span>
              <span className="eval-info-val">12 bulan historis (Jan–Des 2023)</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label">Fitur Input</span>
              <span className="eval-info-val">Pemasukan harian, pengeluaran, hari kerja, tren bulanan</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label">Terakhir Dilatih</span>
              <span className="eval-info-val">1 Oktober 2024 · Auto-retrain tiap bulan</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label">Status Model</span>
              <span className="eval-info-val">
                <span className="eval-status-dot" />Aktif &amp; Berjalan
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
