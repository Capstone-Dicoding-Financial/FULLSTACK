import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/register.css";

const UserIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MailIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m2 7 10 7 10-7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Password dan Konfirmasi Password tidak sama!");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("https://fullstack-backend-capstone.vercel.app/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.nama,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Gagal melakukan registrasi");
      }
      alert("Registrasi Berhasil! Silakan masuk menggunakan akun baru Anda.");
      navigate("/login");

    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || "Terjadi kesalahan server. Coba beberapa saat lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reg-page">
      {/* SISI PANEL KIRI */}
      <div className="reg-left">
        <div className="reg-left-bg"></div>

        <div className="reg-brand">
          <div className="reg-brand-name">DanaUMKM</div>
        </div>

        <div className="reg-left-content">
          <h2 className="reg-left-title">
            Bangun Bisnis Lebih
            <br />
            Modern Bersama AI
          </h2>

          <p className="reg-left-desc">
            Kelola transaksi, prediksi arus kas, dan dapatkan insight bisnis dalam satu platform modern.
          </p>

          <div className="reg-stats">
            <div className="reg-stat">
              <strong>2K+</strong>
              <span>UMKM Aktif</span>
            </div>

            <div className="reg-stat">
              <strong>95%</strong>
              <span>Prediksi Akurat</span>
            </div>

            <div className="reg-stat">
              <strong>OJK</strong>
              <span>Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* SISI PANEL KANAN */}
      <div className="reg-right">
        <div className="reg-form-wrap">
          <h2 className="reg-title">Buat Akun Baru</h2>
          <p className="reg-subtitle">Daftar untuk mulai menggunakan DanaUMKM</p>

          {/* Banner Error - Sekarang 100% menggunakan class CSS */}
          {error && <div className="reg-error-banner">{error}</div>}

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-fgroup">
              <label>Nama Lengkap</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">
                  <UserIcon />
                </span>
                <input
                  type="text"
                  name="nama"
                  placeholder="Masukkan nama lengkap"
                  value={form.nama}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="reg-fgroup">
              <label>Email</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Masukkan email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="reg-fgroup">
              <label>Password</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">
                  <LockIcon />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Masukkan password minimum 6 karakter"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="reg-fgroup">
              <label>Konfirmasi Password</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">
                  <LockIcon />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Konfirmasi password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Button Submit - Sekarang status disabled diatur otomatis oleh CSS */}
            <button type="submit" className="reg-submit-btn" disabled={loading}>
              {loading ? "Memproses Pendaftaran..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className="reg-footer">
            Sudah punya akun? <Link to="/login">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}