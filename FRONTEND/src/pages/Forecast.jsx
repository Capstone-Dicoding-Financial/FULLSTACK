import { useState, useEffect, useCallback } from "react";
import "../css/Forecast.css";

const EXPRESS_URL = "http://localhost:5000";
const FASTAPI_URL = "http://localhost:8000";

function buildDailyCashflow(transactions, days = 7) {
  const map = {};

  transactions.forEach((t) => {
    const day = t.date.split("T")[0];
    if (!map[day]) map[day] = 0;
    if (t.type === "INCOME")  map[day] += t.amount;
    if (t.type === "EXPENSE") map[day] -= t.amount;
  });
  const sorted = Object.keys(map).sort();
  const last   = sorted.slice(-days);
  const result = last.map((d) => map[d]);

  while (result.length < days) result.unshift(0);
  return result.slice(-days);
}

function calcCurrentBalance(transactions) {
  return transactions.reduce((acc, t) => {
    return t.type === "INCOME" ? acc + t.amount : acc - t.amount;
  }, 0);
}

function ForecastChart({ actual, predicted, period }) {
  const allPts = [...actual, ...predicted.slice(1)];
  const minY = Math.min(...allPts.map((p) => p[1])) - 8;
  const maxY = Math.max(...allPts.map((p) => p[1])) + 8;
  const W = 760, H = 160;

  const scaleX = (x) => (x / 720) * W;
  const scaleY = (y) => H - ((y - minY) / (maxY - minY)) * H;

  const toPath = (pts) =>
    pts.map(([x, y], i) =>
      `${i === 0 ? "M" : "L"}${scaleX(x).toFixed(1)},${scaleY(y).toFixed(1)}`
    ).join(" ");

  const toArea = (pts) => {
    const path = toPath(pts);
    return `${path} L${scaleX(pts[pts.length - 1][0]).toFixed(1)},${H} L${scaleX(pts[0][0]).toFixed(1)},${H} Z`;
  };

  const upper = predicted.map(([x, y]) => [x, Math.max(minY + 1, y - 6)]);
  const lower = predicted.map(([x, y]) => [x, Math.min(maxY - 1, y + 6)]);
  const bandPath =
    `${toPath(upper)} L${scaleX(lower[lower.length - 1][0])},${scaleY(lower[lower.length - 1][1])} ` +
    lower.slice().reverse().map(([x, y]) => `L${scaleX(x).toFixed(1)},${scaleY(y).toFixed(1)}`).join(" ") + " Z";

  const gridY = [25, 50, 75].map((pct) => minY + ((maxY - minY) * pct) / 100);
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

        {gridY.map((y, i) => (
          <line key={i} x1="0" y1={scaleY(y).toFixed(1)} x2={W} y2={scaleY(y).toFixed(1)}
            stroke="#e2e8f0" strokeWidth="0.6" />
        ))}
        <line x1={dividerX} y1="0" x2={dividerX} y2={H}
          stroke="#94a3b8" strokeWidth="1" strokeDasharray="5 3" />
        <text x={dividerX + 6} y="12" fontSize="9" fill="#94a3b8" fontFamily="Plus Jakarta Sans, sans-serif">
          Hari ini
        </text>

        <path d={bandPath} fill="url(#fcBandGrad)" />
        <path d={toArea(actual)} fill="url(#fcActGrad)" />
        <path d={toArea(predicted)} fill="url(#fcPredGrad)" />

        <path d={toPath(actual)} fill="none" stroke="#1d4ed8" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />
        <path d={toPath(predicted)} fill="none" stroke="#0ea5e9" strokeWidth="2"
          strokeDasharray="8 5" strokeLinecap="round" strokeLinejoin="round" />

        {actual.map(([x, y], i) => (
          <circle key={i} cx={scaleX(x).toFixed(1)} cy={scaleY(y).toFixed(1)}
            r="3.5" fill="#fff" stroke="#1d4ed8" strokeWidth="2" />
        ))}
        <circle cx={scaleX(predicted[0][0]).toFixed(1)} cy={scaleY(predicted[0][1]).toFixed(1)}
          r="5.5" fill="#fff" stroke="#0ea5e9" strokeWidth="2.5" />
      </svg>

      <div className="fc-xaxis">
        {["M1", "M2", "M3",
          period === "30" ? "M4 (Prediksi)" :
          period === "60" ? "M4–M6 (Prediksi)" : "M4–M7 (Prediksi)"
        ].map((m, i) => (
          <span key={i} className={`fc-xlabel ${i === 3 ? "fc-xlabel-pred" : ""}`}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, subColor, highlight }) {
  return (
    <div className={`kpi-card ${highlight ? "kpi-highlight" : ""}`}>
      <div className="kpi-top">
        <span className="kpi-icon" style={{ display: "flex", alignItems: "center" }}>{icon}</span>
        <span className="kpi-label">{label}</span>
      </div>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub" style={{ color: subColor }}>{sub}</div>}
    </div>
  );
}

function SkenarioCard({ type, val, growth, active, onClick }) {
  const map = {
    optimis: {
      icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
      label: "Optimis", color: "#16a34a", bg: "#f0fdf4", border: "#86efac",
    },
    normal: {
      icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      label: "Normal", color: "#2563eb", bg: "#eff6ff", border: "#93c5fd",
    },
    pesimis: {
      icon: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
      label: "Pesimis", color: "#dc2626", bg: "#fff5f5", border: "#fca5a5",
    },
  };
  const m = map[type];
  return (
    <button
      className={`skenario-card ${active ? "skenario-active" : ""}`}
      style={active ? { background: m.bg, borderColor: m.border } : {}}
      onClick={onClick}
    >
      <div className="skenario-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
        {m.icon}
      </div>
      <div className="skenario-label">{m.label}</div>
      <div className="skenario-val" style={{ color: active ? m.color : "#1e293b" }}>{val}</div>
      <div className="skenario-growth" style={{ color: m.color }}>{growth}</div>
      {active && <div className="skenario-active-dot" style={{ background: m.color }} />}
    </button>
  );
}

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

function InsightCard({ icon, type, title, text, action }) {
  const cls = { pos: "ins-pos", warn: "ins-warn", tip: "ins-tip" }[type];
  return (
    <div className={`ins-card ${cls}`}>
      <div className="ins-icon" style={{ display: "flex", alignItems: "center" }}>{icon}</div>
      <div className="ins-body">
        <p className="ins-title">{title}</p>
        <p className="ins-text">{text}</p>
        {action && <button className="ins-action">{action} →</button>}
      </div>
    </div>
  );
}

function MetricPill({ label, value, desc, color }) {
  return (
    <div className="metric-pill">
      <div className="metric-val" style={{ color }}>{value}</div>
      <div className="metric-label">{label}</div>
      {desc && <div className="metric-desc">{desc}</div>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="fc-page">
      <div className="fc-header">
        <div>
          <div style={{ height: 28, width: 240, background: "#e2e8f0", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 16, width: 360, background: "#f1f5f9", borderRadius: 6 }} />
        </div>
      </div>
      <div className="fc-kpi-row">
        {[1,2,3,4].map(i => (
          <div key={i} className="kpi-card" style={{ minHeight: 100 }}>
            <div style={{ height: 16, width: "60%", background: "#e2e8f0", borderRadius: 4, marginBottom: 12 }} />
            <div style={{ height: 28, width: "80%", background: "#f1f5f9", borderRadius: 4 }} />
          </div>
        ))}
      </div>
      <div className="fc-card" style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#94a3b8" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
          <p>Menjalankan model GRU...</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="fc-page">
      <div className="fc-card" style={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "#dc2626", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h3 style={{ marginBottom: 8, color: "#1e293b" }}>Gagal Memuat Forecast</h3>
          <p style={{ color: "#64748b", marginBottom: 16 }}>{message}</p>
          <button className="btn-primary" onClick={onRetry}>Coba Lagi</button>
        </div>
      </div>
    </div>
  );
}

export default function ForecastArusKas() {
  const [period, setPeriod]               = useState("30");
  const [activeSkenario, setActiveSkenario] = useState("normal");
  const [forecastData, setForecastData]   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  const token  = localStorage.getItem("token");

  const fetchForecast = useCallback(async () => {
    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const txRes = await fetch(`${EXPRESS_URL}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!txRes.ok) throw new Error("Gagal mengambil data transaksi dari server.");

      const txBody       = await txRes.json();
      const transactions = txBody.transactions ?? txBody;

      if (!Array.isArray(transactions) || transactions.length === 0) {
        throw new Error("Belum ada data transaksi. Tambahkan transaksi terlebih dahulu untuk melihat forecast.");
      }

      // Hitung cashflow dari seluruh transaksi historis
      const allDailyCashflow = buildDailyCashflow(transactions, 999); 
      const cashflow7        = allDailyCashflow.slice(-7);            
      const currentBalance   = Math.max(calcCurrentBalance(transactions), 0);

      // Split data income & expense asli riil dari pembukuan database
      const totalIncome  = transactions
        .filter(t => t.type === "INCOME")
        .reduce((s, t) => s + t.amount, 0);

      const totalExpense = transactions
        .filter(t => t.type === "EXPENSE")
        .reduce((s, t) => s + t.amount, 0);

      // Kirim payload lengkap ke backend FastAPI server AI
      const fcRes = await fetch(`${FASTAPI_URL}/forecast`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cashflow:         cashflow7,
          cashflow_history: allDailyCashflow,  
          period:           parseInt(period),
          current_balance:  currentBalance || 1_000_000,
          total_income:     totalIncome,       
          total_expense:    totalExpense,      
        }),
      });

      if (!fcRes.ok) {
        const errBody = await fcRes.json().catch(() => ({}));
        throw new Error(errBody.detail || "FastAPI error: gagal menghitung prediksi.");
      }

      const data = await fcRes.json();
      setForecastData(data);

    } catch (err) {
      console.error("Forecast error:", err);
      setError(err.message || "Terjadi kesalahan tidak diketahui.");
    } finally {
      setLoading(false);
    }
  }, [period, token]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  if (loading) return <LoadingSkeleton />;
  if (error)   return <ErrorState message={error} onRetry={fetchForecast} />;
  if (!forecastData) return null;

  const d = forecastData;

  return (
    <div className="fc-page">
      <div className="fc-header">
        <div>
          <h1 className="fc-title">Forecast Arus Kas</h1>
          <p className="fc-sub">Prediksi arus kas UMKM berdasarkan model GRU · Data real-time</p>
        </div>
        <div className="fc-header-right">
          <div className="period-tabs">
            {["30", "60", "90"].map((p) => (
              <button
                key={p}
                className={`period-tab ${period === p ? "period-tab-active" : ""}`}
                onClick={() => setPeriod(p)}
                disabled={loading}
              >
                {p} Hari
              </button>
            ))}
          </div>
          <button className="fc-dl-btn" title="Download laporan">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      <div className="fc-kpi-row">
        <KpiCard
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M21 12h-4v2h4"/></svg>}
          label="Prediksi Saldo Akhir"
          value={d.saldoAkhir}
          sub={`${d.saldoChange >= 0 ? "↑" : "↓"} ${d.saldoChange >= 0 ? "+" : ""}${d.saldoChange}% dari saat ini`}
          subColor={d.saldoChange >= 0 ? "#16a34a" : "#dc2626"}
          highlight
        />
        <KpiCard
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>}
          label="Prediksi Pemasukan"
          value={d.pemasukan}
          sub={`${d.pemasukanChange >= 0 ? "↑" : "↓"} ${d.pemasukanChange >= 0 ? "+" : ""}${d.pemasukanChange}% vs tren lalu`} // 🔥 Dinamis mirip saldo akhir
          subColor={d.pemasukanChange >= 0 ? "#16a34a" : "#dc2626"} // Hijau jika naik, merah jika turun
        />
        <KpiCard
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/></svg>}
          label="Prediksi Pengeluaran"
          value={d.pengeluaran}
          sub={`${d.pengeluaranChange >= 0 ? "↑" : "↓"} ${d.pengeluaranChange >= 0 ? "+" : ""}${d.pengeluaranChange}% vs tren lalu`} // 🔥 Dinamis mirip saldo akhir
          subColor={d.pengeluaranChange <= 0 ? "#16a34a" : "#dc2626"} // 💡 UX Trick: Untuk pengeluaran, kalau TURUN (minus) justru berwarna HIJAU (hemat)!
        />
        <KpiCard
          icon={<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>}
          label="Akurasi Model"
          value={`${d.accuracy}%`}
          sub={`MAPE ${d.mape}`}
          subColor="#7c3aed"
        />
      </div>

      <div className="fc-card fc-card-chart">
        <div className="fc-card-head">
          <div>
            <h2 className="fc-card-title">Grafik Prediksi Arus Kas · {period} Hari</h2>
            <p className="fc-card-desc">Proyeksi net cash flow berdasarkan model GRU dengan confidence interval 90%</p>
          </div>
          <div className="chart-legend-row">
            <span className="fcleg-item"><span className="fcleg-line fcleg-actual" />Aktual</span>
            <span className="fcleg-item"><span className="fcleg-line fcleg-pred" />Prediksi</span>
            <span className="fcleg-item"><span className="fcleg-band" />Confidence Band</span>
          </div>
        </div>
        <ForecastChart actual={d.chartActual} predicted={d.chartPred} period={period} />
      </div>

      <div className="fc-row fc-row-mid">
        <div className="fc-card card-skenario">
          <h2 className="fc-card-title">Skenario Forecast</h2>
          <p className="fc-card-desc">Proyeksi saldo akhir dalam 3 kemungkinan kondisi</p>
          <div className="skenario-grid">
            {["optimis", "normal", "pesimis"].map((s) => (
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
            <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="7"/><path d="M8 7v4"/><circle cx="8" cy="5.5" r=".5" fill="currentColor" stroke="none"/>
            </svg>
            Skenario dihitung dari variasi ±1σ dan ±2σ pada output model GRU
          </div>
        </div>

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

      <div className="fc-card card-insights">
        <div className="fc-card-head">
          <div>
            <h2 className="fc-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="title-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
              </span>
              Insight Forecast AI
            </h2>
            <p className="fc-card-desc">Analisis otomatis dari model berdasarkan data {period} hari ke depan</p>
          </div>
          <span className="badge-model">Model: GRU</span>
        </div>
        <div className="insights-grid">
          <InsightCard
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
            type={d.saldoChange >= 0 ? "pos" : "warn"}
            title={d.saldoChange >= 0 ? "Tren Positif" : "Perhatian: Tren Menurun"}
            text={`Kas diperkirakan ${d.saldoChange >= 0 ? "meningkat" : "menurun"} ${Math.abs(d.saldoChange)}% dalam ${period} hari ke depan berdasarkan pola historis transaksi kamu.`}
            action="Lihat detail tren"
          />
          <InsightCard
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
            type="warn"
            title="Akurasi Model"
            text={`Model GRU memiliki akurasi ${d.accuracy}% dengan MAPE ${d.mape}. ${parseFloat(d.mape) > 15 ? "Tambahkan lebih banyak data transaksi untuk meningkatkan akurasi prediksi." : "Akurasi model sudah dalam target yang baik."}`}
            action="Kelola pengeluaran"
          />
          <InsightCard
            icon={<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>}
            type="tip"
            title="Saran Optimasi"
            text="Rutin catat transaksi harian untuk meningkatkan akurasi model prediksi. Semakin banyak data historis, semakin akurat prediksi arus kas kamu."
            action="Lihat rencana stok"
          />
        </div>
      </div>

      <div className="fc-card card-eval">
        <div className="fc-card-head">
          <div>
            <h2 className="fc-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="title-icon">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </span>
              Evaluasi Model AI
            </h2>
            <p className="fc-card-desc">Performa model GRU berdasarkan data validasi historis</p>
          </div>
          <div className="eval-badge-wrap">
            <span className="eval-badge">GRU</span>
            <span className="eval-badge eval-badge-blue">TensorFlow</span>
          </div>
        </div>

        <div className="eval-body">
          <div className="eval-metrics">
            <MetricPill label="Accuracy"  value={`${d.accuracy}%`} desc="Tingkat akurasi keseluruhan"  color="#1d4ed8" />
            <MetricPill label="MAPE"      value={d.mape}           desc="Mean Absolute Percentage Error" color="#7c3aed" />
            <MetricPill label="Horizon"   value={`${period}h`}     desc="Jangkauan prediksi aktif"     color="#059669" />
            <MetricPill label="Input"     value="7 hari"           desc="Window historis model"        color="#0891b2" />
          </div>

          <div className="eval-info">
            <div className="eval-info-row">
              <span className="eval-info-label">Arsitektur</span>
              <span className="eval-info-val">GRU (64 unit) → Dense (32) → Output (1)</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label">Fitur Input</span>
              <span className="eval-info-val">Net cash flow harian (7 hari terakhir)</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label">Preprocessing</span>
              <span className="eval-info-val">MinMaxScaler (Rp 93rb – Rp 939jt)</span>
            </div>
            <div className="eval-info-row">
              <span className="eval-info-label">Prediksi</span>
              <span className="eval-info-val">Iterative sliding-window ({period} langkah)</span>
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