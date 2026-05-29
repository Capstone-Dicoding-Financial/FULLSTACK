import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/landingpage.css"; // ← Import file CSS khusus

/* ── ICONS ── */
const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const TrendUp     = () => <Icon d="M23 6 13.5 15.5 8.5 10.5 1 18M17 6h6v6" />;
const BookOpen    = () => <Icon d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />;
const BrainIcon   = () => <Icon d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.03-4.79A2.5 2.5 0 0 1 4 9.5a2.5 2.5 0 0 1 .46-1.47A2.5 2.5 0 0 1 9.5 2ZM14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.03-4.79A2.5 2.5 0 0 0 20 9.5a2.5 2.5 0 0 0-.46-1.47A2.5 2.5 0 0 0 14.5 2Z" />;
const Bell        = () => <Icon d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />;
const User        = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const ArrowRight = () => <Icon d="M5 12h14M12 5l7 7-7 7" size={16} />;
const PlayCircle = () => <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM10 8l6 4-6 4V8z" size={16} />;
const Shield     = () => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" size={22} />;
const BankCol    = () => (
  <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/>
  </svg>
);
const ChevronDown = ({ open }) => (
  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
    className={open ? "icon-rotated" : "icon-default"}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const BarChart = () => <Icon d="M12 20V10M18 20V4M6 20v-4" size={22} />;
const Layers   = () => <Icon d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" size={22} />;
const Zap      = () => <Icon d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" size={22} />;

/* ── DATA ── */
const NAV = [];

const STATS = [
  { value: "< 15%", label: "MAPE Prediksi" },
  { value: "Real-time", label: "Rekonsiliasi" },
  { value: "OJK", label: "Terawasi Penuh" },
];

const FEATURES = [
  {
    icon: <TrendUp />, color: "blue",
    title: "Predictive Cash Flow",
    desc: "Algoritma LSTM/GRU menganalisis histori transaksi untuk memprediksi arus kas jangka pendek — bantu Anda hindari defisit sebelum terjadi.",
    badge: "Deep Learning",
  },
  {
    icon: <BookOpen />, color: "green",
    title: "Integrated Bookkeeping",
    desc: "Pencatatan pemasukan & pengeluaran per kategori secara otomatis. Rekonsiliasi akurat tanpa proses manual.",
    badge: "Otomatis",
  },
  {
    icon: <BrainIcon />, color: "rose",
    title: "AI Insights",
    desc: "Rekomendasi cerdas tentang efisiensi biaya dan peluang peningkatan pendapatan berdasarkan profil unik bisnis Anda.",
    badge: "AI-Powered",
  },
];

const STEPS = [
  { num: "01", icon: <Layers />, title: "Catat Transaksi", desc: "Input pemasukan & pengeluaran dengan kategori bisnis yang mudah dipahami." },
  { num: "02", icon: <BarChart />, title: "AI Analisis Data", desc: "Model Deep Learning (LSTM/GRU) mempelajari pola arus kas historis Anda secara otomatis." },
  { num: "03", icon: <Zap />, title: "Lihat Prediksi & Insight", desc: "Dashboard interaktif menampilkan grafik cash flow, prediksi, dan rekomendasi finansial real-time." },
];

const TESTIMONIALS = [
  {
    init: "BW", bgClass: "bg-blue",
    name: "Budi Wibowo", role: "Pemilik Toko Kelontong Maju",
    quote: "Semenjak pakai DanaUMKM, saya tidak pernah lagi pusing catat manual. Prediksi AI-nya sangat membantu saya siapkan stok sebelum puasa.",
  },
  {
    init: "SA", bgClass: "bg-teal",
    name: "Siti Aminah", role: "Owner Kafe Senja",
    quote: "Laporan keuangannya rapi dan mudah dibaca. Fitur pengingat hutang benar-benar menyelamatkan bisnis saya dari masalah cash flow.",
  },
  {
    init: "RH", bgClass: "bg-purple",
    name: "Rizky Handoko", role: "Pemilik Konveksi Maju Jaya",
    quote: "Dashboard prediksi arus kasnya akurat sekali. Saya jadi bisa merencanakan pembelian bahan baku jauh lebih baik dari sebelumnya.",
  },
];

const FAQS = [
  { q: "Apakah data keuangan saya aman?", a: "Ya. Semua data dienkripsi AES-256 dan disimpan di server yang terdaftar serta diawasi OJK dan Kominfo. Kami tidak pernah menjual data Anda ke pihak ketiga." },
  { q: "Apakah perlu keahlian akuntansi untuk menggunakannya?", a: "Tidak sama sekali. DanaUMKM dirancang khusus untuk pemilik UMKM tanpa latar belakang akuntansi. Antarmuka sangat intuitif dan ada panduan langkah demi langkah." },
  { q: "Seberapa akurat prediksi arus kasnya?", a: "Model LSTM/GRU kami menargetkan MAPE (Mean Absolute Percentage Error) di bawah 15%. Akurasi meningkat seiring bertambahnya data historis transaksi Anda." },
  { q: "Apakah tersedia versi mobile?", a: "Saat ini DanaUMKM adalah sistem berbasis web yang sudah responsif untuk semua perangkat. Versi mobile app sedang dalam pengembangan." },
  { q: "Bagaimana cara memulai?", a: "Klik tombol 'Mulai Sekarang', daftarkan bisnis Anda, lalu mulai catat transaksi. Setup awal hanya butuh 5 menit dan tidak perlu kartu kredit." },
];

const TRUST = [
  { icon: <Shield />, label: "OJK" },
  { icon: <BankCol />, label: "Bank Indonesia" },
  { icon: <Shield />, label: "Kominfo" },
];

/* ── ACCORDION ITEM ── */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(!open)} className={`faq-item-box ${open ? "open" : "closed"}`}>
      <div className="faq-trigger">
        <span className="faq-question">{q}</span>
        <span className="faq-arrow"><ChevronDown open={open} /></span>
      </div>
      {open && (
        <p className="faq-answer">{a}</p>
      )}
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function DanaUMKMLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="dana-umkm-container">

      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="nav-container">
          <span className="nav-logo">DanaUMKM</span>

          <ul className="nav-links hide-mobile">
            {NAV.map(n => (
              <li key={n} className="nav-item">
                {n}
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <button
  className="btn-primary-sm"
  onClick={() => navigate("/login")}
>
  Mulai Sekarang
</button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle show-mobile">
              ☰
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            {NAV.map(n => (
              <div key={n} className="mobile-nav-item">{n}</div>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="grid-two-col">
          <div>
            <div className="hero-badge">
              <span className="badge-dot" />
              Coding Camp 2026 · DBS Foundation
            </div>

            <h1 className="hero-title"> 
               Smart Financial Dashboard<br />
              <span>Untuk UMKM Indonesia</span>
            </h1>

            <p className="hero-desc">
              Sistem manajemen keuangan UMKM berbasis web dengan teknologi Deep Learning (LSTM/GRU).
              Catat transaksi, prediksi cash flow, dan dapatkan insight finansial — dalam satu dashboard.
            </p>

            <div className="btn-group">
              <button
  className="btn-hero-primary"
  onClick={() => navigate("/login")}
>Mulai Sekarang <ArrowRight /></button>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mockup-container">
            <div className="mockup-header">
              <span className="mockup-title">DanaUMKM Dashboard</span>
              <div className="mockup-dots">
                <div className="mockup-dot dot-red" />
                <div className="mockup-dot dot-amber" />
                <div className="mockup-dot dot-green" />
              </div>
            </div>
            
            <div className="mockup-stats-grid">
              <div className="mockup-stat-card">
                <div className="mockup-stat-label">Pemasukan Bulan Ini</div>
                <div className="mockup-stat-val text-green">Rp 12,4 Jt</div>
              </div>
              <div className="mockup-stat-card">
                <div className="mockup-stat-label">Pengeluaran</div>
                <div className="mockup-stat-val text-red">Rp 7,1 Jt</div>
              </div>
              <div className="mockup-stat-card">
                <div className="mockup-stat-label">Prediksi Minggu Depan</div>
                <div className="mockup-stat-val text-blue">Rp 4,2 Jt</div>
              </div>
              <div className="mockup-stat-card">
                <div className="mockup-stat-label">MAPE Model</div>
                <div className="mockup-stat-val text-purple">11.3%</div>
              </div>
            </div>
            
            <div className="mockup-chart-container">
              <div className="mockup-chart-title">Tren Cash Flow — 6 Bulan</div>
              <svg viewBox="0 0 340 100" className="mockup-svg-chart">
                <defs>
                  <linearGradient id="gr1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="gr2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15"/>
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="340" y2="20" stroke="#f1f5f9" strokeWidth="1"/>
                <line x1="0" y1="50" x2="340" y2="50" stroke="#f1f5f9" strokeWidth="1"/>
                <line x1="0" y1="80" x2="340" y2="80" stroke="#f1f5f9" strokeWidth="1"/>
                
                <path d="M0,75 C40,65 80,55 120,60 C160,65 200,45 240,40 C280,35 310,30 340,25 L340,100 L0,100Z" fill="url(#gr2)"/>
                <path d="M0,75 C40,65 80,55 120,60 C160,65 200,45 240,40 C280,35 310,30 340,25" fill="none" stroke="#22c55e" strokeWidth="2"/>
                
                <path d="M240,40 C260,38 290,28 340,22 L340,100 L240,100Z" fill="url(#gr1)" opacity="0.6"/>
                <path d="M240,40 C260,38 290,28 340,22" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5 3"/>
                
                <circle cx="0" cy="75" r="4" fill="#22c55e" stroke="#fff" strokeWidth="2"/>
                <circle cx="80" cy="55" r="4" fill="#22c55e" stroke="#fff" strokeWidth="2"/>
                <circle cx="160" cy="65" r="4" fill="#22c55e" stroke="#fff" strokeWidth="2"/>
                <circle cx="240" cy="40" r="4" fill="#22c55e" stroke="#fff" strokeWidth="2"/>
                
                <text x="10" y="98" fontSize="8" fill="#94a3b8">Jan</text>
                <text x="70" y="98" fontSize="8" fill="#94a3b8">Feb</text>
                <text x="130" y="98" fontSize="8" fill="#94a3b8">Mar</text>
                <text x="190" y="98" fontSize="8" fill="#94a3b8">Apr</text>
                <text x="250" y="98" fontSize="8" fill="#94a3b8">Mei</text>
                <text x="310" y="98" fontSize="8" fill="#94a3b8">Jun</text>
                
                <circle cx="260" cy="12" r="3" fill="#22c55e"/>
                <text x="266" y="15" fontSize="8" fill="#64748b">Aktual</text>
                <line x1="290" y1="12" x2="300" y2="12" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 2"/>
                <text x="303" y="15" fontSize="8" fill="#64748b">Prediksi</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="stats-strip">
        <div className="stats-grid">
          {STATS.map(s => (
            <div key={s.label}>
              <div className="stat-val">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Solusi Cerdas untuk Bisnis Anda</h2>
            <p className="section-desc">
              Fitur unggulan dirancang khusus untuk menyederhanakan manajemen keuangan UMKM Indonesia.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className={`feature-card ${f.color}`}>
                <div className="feature-top">
                  <div className="feature-icon-wrapper">
                    {f.icon}
                  </div>
                  <span className="feature-badge">
                    {f.badge}
                  </span>
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="steps-section">
        <div className="steps-container">
          <div className="section-header">
            <h2 className="section-title">Cara Kerjanya Sederhana</h2>
            <p className="section-desc">
              Tiga langkah mudah dari pencatatan sampai insight finansial berbasis AI.
            </p>
          </div>

          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-wrapper">
                {i < STEPS.length - 1 && (
                  <div className="step-arrow">→</div>
                )}
                <div className="step-card">
                  <div className="step-icon-wrapper">{s.icon}</div>
                  <div className="step-number">{s.num}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="trust-section">
        <div className="trust-container">
          <p className="trust-title">Dipercaya Oleh &amp; Diawasi Oleh</p>
          <div className="trust-flex">
            {TRUST.map(t => (
              <div key={t.label} className="trust-item">
                <span className="trust-icon">{t.icon}</span>
                <span className="trust-label">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <h2 className="section-title section-title-center">
            Kata Mereka yang Sudah Pakai
          </h2>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="testimonial-card">
                <div className="testimonial-quote-mark">"</div>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-user">
                  <div className={`testimonial-avatar ${t.bgClass}`}>{t.init}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq-section">
        <div className="faq-container">
          <h2 className="section-title section-title-center">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-title">DanaUMKM</div>
              <p className="footer-brand-desc">
                Sistem Informasi Manajemen Keuangan UMKM dengan Prediksi Arus Kas berbasis Deep Learning.
              </p>
              <div className="footer-brand-sub">CC26-PSU367 · DBS Foundation 2026</div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 DanaUMKM Indonesia. Terdaftar dan Diawasi OJK.</span>
            <span>Dibuat oleh Tim Capstone  CC26-PSU367</span>
          </div>
        </div>
      </footer>
    </div>
  );
}