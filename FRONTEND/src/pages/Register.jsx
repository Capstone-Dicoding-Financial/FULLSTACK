import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/register.css";

/* ── Icons ── */
const UserIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const HomeIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

/* ── Strength helper ── */
function calcStrength(value) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const strengthLabels = ["", "Lemah", "Cukup", "Kuat", "Sangat kuat"];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const pwStrength = calcStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Password tidak sama!");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="reg-page">

      {/* ── LEFT PANEL ── */}
      <div className="reg-left">
        <div className="reg-left-bg" />

        <div className="reg-brand">
          <div className="reg-brand-icon">
            <HomeIcon />
          </div>
          <span className="reg-brand-name">DanaUMKM</span>
        </div>

        <div className="reg-left-content">
          <h2 className="reg-left-title">
            Kelola Keuangan<br />UMKM Lebih Mudah
          </h2>
          <p className="reg-left-desc">
            DanaUMKM membantu Anda melacak pemasukan, pengeluaran, dan hutang
            dalam satu platform yang aman dan terpercaya.
          </p>

          <div className="reg-stats">
            <div className="reg-stat">
              <strong>&lt;15%</strong>
              <span>Error Prediksi</span>
            </div>
            <div className="reg-stat">
              <strong>2K+</strong>
              <span>UMKM Aktif</span>
            </div>
            <div className="reg-stat">
              <strong>OJK</strong>
              <span>Terawasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="reg-right">
        <div className="reg-form-wrap">

        <div className="reg-logo-row">
          <HomeIcon />
          <span className="reg-logo-name">DanaUMKM</span>
        </div>

        <h1 className="reg-title">Buat Akun Baru</h1>
        <p className="reg-subtitle">Daftar untuk mulai menggunakan DanaUMKM</p>

        <form onSubmit={handleSubmit} className="reg-form">

          {/* Name row */}
          <div className="reg-row">
            <div className="reg-fgroup">
              <label>Nama Depan</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon"><UserIcon /></span>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Nama depan"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="reg-fgroup">
              <label>Nama Belakang</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon"><UserIcon /></span>
                <input
                  type="text"
                  name="lastName"
                  placeholder="Nama belakang"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="reg-fgroup">
            <label>Email</label>
            <div className="reg-input-wrap">
              <span className="reg-input-icon"><MailIcon /></span>
              <input
                type="email"
                name="email"
                placeholder="contoh@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="reg-fgroup">
            <label>Password</label>
            <div className="reg-input-wrap">
              <span className="reg-input-icon"><LockIcon /></span>
              <input
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="reg-eye-btn"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Strength bar */}
            {form.password && (
              <div className="reg-strength-row">
                <div className="reg-strength-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`reg-strength-seg seg-${i} ${pwStrength >= i ? "active" : ""}`}
                    />
                  ))}
                </div>
                <span className="reg-strength-txt">{strengthLabels[pwStrength]}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="reg-fgroup">
            <label>Konfirmasi Password</label>
            <div className="reg-input-wrap">
              <span className="reg-input-icon"><LockIcon /></span>
              <input
                type={showConfirmPw ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="reg-eye-btn"
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                aria-label={showConfirmPw ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showConfirmPw ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button type="submit" className="reg-submit-btn">
            Daftar Sekarang
          </button>

        </form>

        <p className="reg-footer">
          Sudah punya akun?{" "}
          <Link to="/login">Masuk</Link>
        </p>

        <p className="reg-copy">© 2026 DanaUMKM Indonesia. Aman &amp; Terlindungi.</p>

        </div>
      </div>
    </div>
  );
}
