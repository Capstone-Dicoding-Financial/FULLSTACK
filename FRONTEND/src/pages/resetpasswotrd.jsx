import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import "../css/Resetpassword.css"; 

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
      setError("Token tidak valid atau tidak ditemukan di URL. Silakan minta link reset baru.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password baru dan Konfirmasi Password tidak sama!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("https://fullstack-backend-capstone.vercel.app/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memperbarui password");
      }

      setMessage(data.message || "Password berhasil diperbarui!");
      setTimeout(() => {
        navigate("/login");
      }, 2500);

    } catch (err) {
      console.error("Reset Password Error:", err);
      setError(err.message || "Terjadi kesalahan server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-left">
        <div className="overlay"></div>
        <div className="register-left-content">
          <h1>DanaUMKM</h1>
          <h2>
            Langkah Terakhir
            <br />
            Pemulihan Akun
          </h2>
          <p>
            Buat password baru yang kuat dan unik untuk memastikan keamanan 
            data finansial dan insight bisnis UMKM Anda tetap terjaga.
          </p>
          <div className="register-stats">
            <div>
              <strong>2K+</strong>
              <span>UMKM Aktif</span>
            </div>
            <div>
              <strong>95%</strong>
              <span>Prediksi Akurat</span>
            </div>
            <div>
              <strong>OJK</strong>
              <span>Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      <div className="register-right">
        <div className="register-card">
          <h2 className="register-title">Password Baru</h2>
          <p className="register-subtitle">
            Silakan masukkan password baru Anda minimum 6 karakter
          </p>

          {!token && !message && (
            <div className="register-error-banner" style={{ background: "#fff7ed", color: "#c2410c", border: "1px solid #fed7aa", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
              ⚠️ Ambil link reset terbaru dari terminal backend kamu bro.
            </div>
          )}

          {error && (
            <div className="register-error-banner" style={{ background: "#fee2e2", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid #fca5a5" }}>
              {error}
            </div>
          )}

          {message && (
            <div className="register-success-banner" style={{ background: "#dcfce7", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid #bbf7d0" }}>
              {message} <br /> <span style={{ fontSize: "11px", fontWeight: "normal" }}>Mengalihkan ke halaman login...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Password Baru</label>
              <div className="input-group">
                <span className="input-icon">
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

            <div className="form-group">
              <label>Konfirmasi Password Baru</label>
              <div className="input-group">
                <span className="input-icon">
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
              className="register-btn" 
              disabled={loading || !!message}
              style={{ opacity: (loading || !!message) ? 0.7 : 1, cursor: (loading || !!message) ? "not-allowed" : "pointer" }}
            >
              {loading ? "Memperbarui Password..." : "Simpan Password Baru"}
            </button>
          </form>

          <p className="register-footer">
            Batal mengubah? 
            <Link to="/login"> Kembali ke Masuk</Link>
          </p>

        </div>
      </div>
    </div>
  );
}