import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/login.css";

const BankIcon = () => (
  <svg width={22} height={22} fill="none" viewBox="0 0 24 24" stroke="#1e3a8a" strokeWidth={1.8}>
    <line x1="3" y1="22" x2="21" y2="22"/>
    <line x1="6" y1="18" x2="6" y2="11"/>
    <line x1="10" y1="18" x2="10" y2="11"/>
    <line x1="14" y1="18" x2="14" y2="11"/>
    <line x1="18" y1="18" x2="18" y2="11"/>
    <polygon points="12 2 20 7 4 7"/>
  </svg>
);

const MailIcon = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m2 7 10 7 10-7"/>
  </svg>
);

const LockIcon = () => (
  <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const EyeIcon = () => (
  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SparkIcon = () => (
  <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={1.5}>
    <path d="M12 2 9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
    <path d="M5 5l1.5 1.5M18.5 5 17 6.5M5 19l1.5-1.5M17 17.5l1.5 1.5" strokeLinecap="round"/>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // sementara langsung masuk dashboard
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <div className="login-page">
      {/* ── LEFT PANEL ── */}
      <div className="login-left">
        {/* decorative blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        <div className="login-left__content">
          
          <h2 className="login-left__title">
            Kelola Keuangan<br />UMKM Lebih Mudah
          </h2>
          <p className="login-left__desc">
            DanaUMKM membantu Anda melacak pemasukan, pengeluaran, dan hutang dalam satu platform yang aman dan terpercaya.
          </p>

          <div className="login-left__stats">
            {[
              { val: "< 15%", desc: "Error Prediksi" },
              { val: "2K+", desc: "UMKM Aktif" },
              { val: "OJK", desc: "Terawasi" },
            ].map(s => (
              <div key={s.val} className="login-left__stat">
                <span className="login-left__stat-val">{s.val}</span>
                <span className="login-left__stat-desc">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* background image overlay */}
        <img
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=900&auto=format&fit=crop"
          alt=""
          className="login-left__bg"
        />
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="login-right">
        <div className="login-form-wrap">


          {/* Logo */}
          <div className="login-logo">
            <BankIcon />
            <span className="login-logo__text">DanaUMKM</span>
          </div>

          <h1 className="login-title">Selamat Datang Kembali</h1>
          <p className="login-subtitle">Silakan masuk ke akun Anda untuk melanjutkan.</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrap">
                <span className="input-icon"><MailIcon /></span>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="contoh@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><LockIcon /></span>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-eye"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="form-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span className="checkbox-custom" />
                <span className="checkbox-text">Ingat saya</span>
              </label>
              <a href="#" className="forgot-link">Lupa Password?</a>
            </div>

            {/* Submit */}
            <button type="submit" className={`btn-login${loading ? " btn-login--loading" : ""}`} disabled={loading}>
              {loading ? (
                <span className="btn-spinner" />
              ) : "Masuk"}
            </button>
          </form>

          <p className="login-register">
            Belum punya akun?{" "}
            <Link to="/register" className="login-register__link">Daftar Akun Baru</Link>
          </p>

          <p className="login-footer">© 2026 DanaUMKM Indonesia. Aman &amp; Terlindungi.</p>
        </div>
      </div>
    </div>
  );
}
