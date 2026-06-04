import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/register.css"; 

const MailIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch("https://fullstack-backend-capstone.vercel.app/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memproses permintaan");
      }
      setMessage(data.message || "Link reset password telah dikirim ke email Anda!");
      setEmail("");

    } catch (err) {
      console.error("Forgot Password Error:", err);
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
            Lupa Kata Sandi?
            <br />
            Gak Perlu Panik.
          </h2>
          <p>
            Masukkan email terdaftar Anda. Kami akan mengirimkan instruksi dan 
            tautan aman untuk memperbarui password akun DanaUMKM Anda.
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
          <h2 className="register-title">Minta Tautan Reset</h2>
          <p className="register-subtitle">
            Kami akan mengirimkan link verifikasi perubahan kata sandi ke email Anda
          </p>

          {error && (
            <div className="register-error-banner" style={{ background: "#fee2e2", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid #fca5a5" }}>
              {error}
            </div>
          )}

          {message && (
            <div className="register-success-banner" style={{ background: "#dcfce7", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid #bbf7d0" }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <label>Alamat Email</label>
              <div className="input-group">
                <span className="input-icon">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  placeholder="nama@perusahaan.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="register-btn" 
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Mengirim Email..." : "Kirim Link Reset"}
            </button>
          </form>

          <p className="register-footer">
            Ingat kata sandi Anda? 
            <Link to="/login"> Masuk Sekarang</Link>
          </p>

        </div>
      </div>
    </div>
  );
}