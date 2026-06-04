import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "../css/Resetpassword.css"; // Memastikan mengarah ke file CSS Anda

const LockIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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

    if (!token) {
      setError("Token tidak valid atau tidak ditemukan di URL. Silakan minta tautan baru.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("https://fullstack-backend-capstone.vercel.app/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: form.password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memperbarui password");

      setMessage(data.message || "Password Anda berhasil diperbarui!");
      setForm({ password: "", confirmPassword: "" });

      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (err) {
      console.error("Reset Password Error:", err);
      setError(err.message || "Terjadi kesalahan server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-page">
      {/* SISI PANEL KIRI */}
      <div className="rp-left">
        <div className="rp-left-bg"></div>
        
        <div className="rp-left-content">
          <div className="rp-brand">
            <div className="rp-brand-name">DanaUMKM</div>
          </div>
          <h2 className="rp-left-title">
            Perbarui Kata Sandi
            <br />
            Akun Anda.
          </h2>
          <p className="rp-left-desc">
            Amankan kembali akun DanaUMKM Anda dengan membuat kata sandi baru. 
            Pastikan menggunakan kombinasi karakter yang kuat dan sulit ditebak.
          </p>
          <div className="rp-stats">
            <div className="rp-stat">
              <strong>2K+</strong>
              <span>UMKM Aktif</span>
            </div>
            <div className="rp-stat">
              <strong>95%</strong>
              <span>Prediksi Akurat</span>
            </div>
            <div className="rp-stat">
              <strong>OJK</strong>
              <span>Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* SISI PANEL KANAN */}
      <div className="rp-right">
        <div className="rp-form-wrap">
          <h2 className="rp-title">Password Baru</h2>
          <p className="rp-subtitle">
            Silakan masukkan kata sandi baru Anda di bawah ini
          </p>

          {/* Alert Status Info */}
          {error && <div className="rp-alert rp-alert-error">{error}</div>}
          {message && <div className="rp-alert rp-alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="rp-form">
            <div className="rp-fgroup">
              <label>Password Baru</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">
                  <LockIcon />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimal 6 karakter"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading || !!message}
                  required
                />
              </div>
            </div>

            <div className="rp-fgroup">
              <label>Konfirmasi Password Baru</label>
              <div className="rp-input-wrap">
                <span className="rp-input-icon">
                  <LockIcon />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Ulangi password baru"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading || !!message}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="rp-submit-btn" 
              disabled={loading || !!message}
            >
              {loading ? "Memperbarui Password..." : "Simpan Password Baru"}
            </button>
          </form>

          <p className="rp-footer">
            Batal mengubah? 
            <Link to="/login"> Kembali ke Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}