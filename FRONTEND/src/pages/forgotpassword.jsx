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
    <div className="reg-page"> {/* Disesuaikan ke .reg-page */}
      <div className="reg-left"> {/* Disesuaikan ke .reg-left */}
        <div className="reg-left-bg"></div> {/* Menggunakan background bawaan CSS register */}
        
        <div className="reg-left-content"> {/* Disesuaikan ke .reg-left-content */}
          <div className="reg-brand">
            <div className="reg-brand-name">DanaUMKM</div>
          </div>
          <h2 className="reg-left-title">
            Lupa Kata Sandi?
            <br />
            Gak Perlu Panik.
          </h2>
          <p className="reg-left-desc">
            Masukkan email terdaftar Anda. Kami akan mengirimkan instruksi dan 
            tautan aman untuk memperbarui password akun DanaUMKM Anda.
          </p>
          <div className="reg-stats"> {/* Disesuaikan ke .reg-stats */}
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

      <div className="reg-right"> {/* Disesuaikan ke .reg-right */}
        <div className="reg-form-wrap"> {/* Disesuaikan ke .reg-form-wrap */}
          <h2 className="reg-title">Minta Tautan Reset</h2>
          <p className="reg-subtitle">
            Kami akan mengirimkan link verifikasi perubahan kata sandi ke email Anda
          </p>

          {error && (
            <div style={{ background: "#fee2e2", color: "#ef4444", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid #fca5a5" }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ background: "#dcfce7", color: "#16a34a", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginBottom: "16px", border: "1px solid #bbf7d0" }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reg-form"> {/* Disesuaikan ke .reg-form */}
            <div className="reg-fgroup"> {/* Disesuaikan ke .reg-fgroup */}
              <label>Alamat Email</label>
              <div className="reg-input-wrap"> {/* Disesuaikan ke .reg-input-wrap */}
                <span className="reg-input-icon"> {/* Disesuaikan ke .reg-input-icon */}
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
              className="reg-submit-btn"
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Mengirim Email..." : "Kirim Link Reset"}
            </button>
          </form>

          <p className="reg-footer"> {/* Disesuaikan ke .reg-footer */}
            Ingat kata sandi Anda? 
            <Link to="/login"> Masuk Sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
}