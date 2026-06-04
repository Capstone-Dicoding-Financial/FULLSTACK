import { useState } from "react";
import { Link } from "react-router-dom";
import "../css/forgotpassword.css"; 

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memproses permintaan");
      
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
    <div className="reg-page">
      {/* BAGIAN KIRI */}
      <div className="reg-left">
        <div className="reg-left-bg"></div>
        
        <div className="reg-left-content">
          <h2 className="reg-left-title">
            Lupa Kata Sandi?
            <br />
            Gak Perlu Panik.
          </h2>
          <p className="reg-left-desc">
            Masukkan email terdaftar Anda. Kami akan mengirimkan instruksi dan 
            tautan aman untuk memperbarui password akun DanaUMKM Anda.
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

      {/* BAGIAN KANAN */}
      <div className="reg-right">
        <div className="reg-form-wrap">
          <h2 className="reg-title">Minta Tautan Reset</h2>
          <p className="reg-subtitle">
            Kami akan mengirimkan link verifikasi perubahan kata sandi ke email Anda
          </p>

          {error && <div className="reg-alert reg-alert-error">{error}</div>}
          {message && <div className="reg-alert reg-alert-success">{message}</div>}

          <form onSubmit={handleSubmit} className="reg-form">
            <div className="reg-fgroup">
              <label>Alamat Email</label>
              <div className="reg-input-wrap">
                <span className="reg-input-icon">
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

            <button type="submit" className="reg-submit-btn" disabled={loading}>
              {loading ? "Mengirim Email..." : "Kirim Link Reset"}
            </button>
          </form>

          <p className="reg-footer">
            Ingat kata sandi Anda? 
            <Link to="/login"> Masuk Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}