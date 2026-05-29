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

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
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
    <div className="register-page">

      {/* LEFT SIDE */}
      <div className="register-left">
        <div className="overlay"></div>

        <div className="register-left-content">
          <h1>DanaUMKM</h1>

          <h2>
            Bangun Bisnis Lebih
            <br />
            Modern Bersama AI
          </h2>

          <p>
            Kelola transaksi, prediksi arus kas,
            dan dapatkan insight bisnis dalam
            satu platform modern.
          </p>

          <div className="register-stats">
            <div>
              <strong>2K+</strong>
              <span>UMKM Aktif</span>
            </div>

            <div>
              <strong>15%</strong>
              <span>Prediksi Akurat</span>
            </div>

            <div>
              <strong>OJK</strong>
              <span>Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">

        <div className="register-card">

          <h2 className="register-title">
            Buat Akun Baru
          </h2>

          <p className="register-subtitle">
            Daftar untuk mulai menggunakan DanaUMKM
          </p>

          <form onSubmit={handleSubmit} className="register-form">

            <div className="form-group">
              <label>Nama Lengkap</label>

              <div className="input-group">
                <span className="input-icon">
                  <UserIcon />
                </span>

                <input
                  type="text"
                  name="nama"
                  placeholder="Masukkan nama lengkap"
                  value={form.nama}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>

              <div className="input-group">
                <span className="input-icon">
                  <MailIcon />
                </span>

                <input
                  type="email"
                  name="email"
                  placeholder="Masukkan email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <div className="input-group">
                <span className="input-icon">
                  <LockIcon />
                </span>

                <input
                  type="password"
                  name="password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Konfirmasi Password</label>

              <div className="input-group">
                <span className="input-icon">
                  <LockIcon />
                </span>

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Konfirmasi password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="register-btn">
              Daftar Sekarang
            </button>

          </form>

          <p className="register-footer">
            Sudah punya akun?
            <Link to="/login"> Masuk</Link>
          </p>

        </div>
      </div>
    </div>
  );
}