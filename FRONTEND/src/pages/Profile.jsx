import { useState, useEffect } from "react";
import "../css/Profile.css";

// ── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="prof-stat-card">
      <div className="prof-stat-icon-wrap" style={{ background: color + "18", color }} />
      <div>
        <div className="prof-stat-value">{value}</div>
        <div className="prof-stat-label">{label}</div>
        {sub && <div className="prof-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      className={`toggle-btn ${checked ? "toggle-on" : ""}`}
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
    >
      <span className="toggle-thumb" />
    </button>
  );
}

// ── Field Input ──────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", readOnly }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className={`field-input-wrap ${readOnly ? "field-readonly" : ""}`}>
        <input
          type={type}
          value={value || ""}
          onChange={e => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          className="field-input"
        />
      </div>
    </div>
  );
}

// ── Section Header ───────────────────────────────────────────────────────────
function SectionHead({ title, desc, action, onAction }) {
  return (
    <div className="section-head">
      <div className="section-head-left">
        <h2 className="section-title">{title}</h2>
        {desc && <p className="section-desc">{desc}</p>}
      </div>
      {action && (
        <button className="section-action" onClick={onAction}>{action}</button>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProfilUMKM() {
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved]       = useState(false);
  const [loading, setLoading]   = useState(true);

  const userId  = localStorage.getItem("userId");
  const API_URL = "http://localhost:5000/api/profile";

  const [form, setForm] = useState({
    namaToko:     "",
    pemilik:      "",
    jenisUsaha:   "Kuliner / F&B",
    deskripsi:    "",
    telepon:      "",
    email:        "",
    alamat:       "",
    kota:         "",
    provinsi:     "",
    kodePOS:      "",
    berdiriSejak: "",
    logoToko:     "",
    npwp:         "",
    nib:          "",
  });

  const [notif, setNotif] = useState({
    laporanHarian:    true,
    peringatanKas:    true,
    forecastUpdate:   true,
    promoTips:        false,
    ringkasanMingguan: true,
  });

  // ── Fetch profil ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        console.warn("User ID tidak ditemukan. Harap login terlebih dahulu.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setForm(data);
        } else {
          console.log("Profil belum ada, silakan buat profil baru.");
        }
      } catch (error) {
        console.error("Gagal terhubung ke server:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  // ── Helper set field ──────────────────────────────────────────────────────
  const setField = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleLogoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    alert("Ukuran file terlalu besar! Maksimal 5MB.");
    return;
  }

  const reader = new FileReader();
  reader.onloadend = () => {
    const img = new Image();
    img.src = reader.result;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const MAX_SIZE = 400;
      let width  = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width  = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width  = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }
      }

      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressed = canvas.toDataURL("image/jpeg", 0.7);

      console.log("Ukuran asli   :", Math.round(file.size / 1024), "KB");
      console.log("Ukuran kompres:", Math.round(compressed.length * 0.75 / 1024), "KB");

      setForm(f => ({ ...f, logoToko: compressed }));
    };
  };
  reader.readAsDataURL(file);
};

  // ── Simpan profil ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!userId) return alert("Sesi login tidak valid!");
    try {
      const response = await fetch(`${API_URL}/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (response.ok) {
        setEditMode(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        window.dispatchEvent(new Event("profileUpdated"));
      } else {
        alert(`Gagal menyimpan: ${result.error || result.message || "Data tidak valid"}`);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Terjadi kesalahan jaringan.");
    }
  };

  // ── Warna kategori ────────────────────────────────────────────────────────
  const kategoriColors = {
    "Kuliner / F&B":    "#16a34a",
    "Perdagangan":      "#2563eb",
    "Jasa":             "#7c3aed",
    "Manufaktur kecil": "#d97706",
  };
  const katColor = kategoriColors[form.jenisUsaha] || "#2563eb";

  if (loading) {
    return (
      <div className="prof-page" style={{ padding: "40px", textAlign: "center" }}>
        Memuat Profil...
      </div>
    );
  }

  return (
    <div className="prof-page">

      {/* ── Top Bar ── */}
      <div className="prof-topbar">
        <div>
          <h1 className="prof-title">Profil Usaha</h1>
          <p className="prof-sub">Kelola informasi dan pengaturan akun UMKM kamu.</p>
        </div>
        <div className="prof-topbar-right">
          {saved && <span className="save-toast">Perubahan disimpan</span>}
          {editMode ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setEditMode(false)}>Batal</button>
              <button className="btn-primary" onClick={handleSave}>Simpan Perubahan</button>
            </div>
          ) : (
            <button className="btn-outline" onClick={() => setEditMode(true)}>Edit Profil</button>
          )}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="prof-grid">

        {/* ── LEFT COLUMN ── */}
        <div className="prof-left">
          <div className="prof-card card-avatar">
            <div className="avatar-wrap">

              {/* Avatar / Logo */}
              <div className="avatar-circle" style={{ overflow: "hidden" }}>
                {form.logoToko ? (
                  <img
                    src={form.logoToko}
                    alt="Logo Toko"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span className="avatar-initials">
                    {form.namaToko ? form.namaToko.substring(0, 2).toUpperCase() : "UM"}
                  </span>
                )}
              </div>

              {/* Tombol ubah logo */}
              {editMode && (
                <>
                  <label htmlFor="logo-input" className="avatar-edit-btn" style={{ cursor: "pointer" }}>
                    Ubah
                  </label>
                  <input
                    id="logo-input"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleLogoChange}
                  />
                </>
              )}
              <div className="avatar-online" />
            </div>

            {/* Info singkat */}
            <div className="avatar-info">
              <h2 className="avatar-name">{form.namaToko || "Nama Toko (Belum Diisi)"}</h2>
              <p className="avatar-owner">{form.pemilik || "Nama Pemilik"}</p>
              <div className="avatar-tags">
                <span
                  className="kat-badge"
                  style={{ background: katColor + "15", color: katColor, borderColor: katColor + "30" }}
                >
                  {form.jenisUsaha}
                </span>
                <span className="status-badge">
                  <span className="status-dot" /> Aktif
                </span>
              </div>
            </div>

            {/* Meta info */}
            <div className="avatar-meta">
              <div className="meta-row">Lokasi: {form.kota || "-"}, {form.provinsi || "-"}</div>
              <div className="meta-row">
                {form.berdiriSejak
                  ? `Berdiri sejak: ${new Date(form.berdiriSejak).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}`
                  : "Tanggal berdiri belum diisi"}
              </div>
              <div className="meta-row">No. Telp: {form.telepon || "-"}</div>
              <div className="meta-row">Email: {form.email || "-"}</div>
            </div>

            <div className="avatar-divider" />
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="prof-right">
          <div className="prof-card">
            <SectionHead title="Informasi Usaha" desc="Data identitas dan kontak usaha kamu" />

            {/* Identitas */}
            <div className="fields-section">
              <p className="fields-group-label">Identitas Usaha</p>
              <div className="fields-grid">
                <Field label="Nama Toko / Usaha" value={form.namaToko}    onChange={setField("namaToko")}    readOnly={!editMode} />
                <Field label="Nama Pemilik"       value={form.pemilik}     onChange={setField("pemilik")}     readOnly={!editMode} />
              </div>
              <div className="fields-grid fields-grid-3">
                <div className="field-wrap">
                  <label className="field-label">Jenis Usaha</label>
                  {editMode ? (
                    <select
                      className="field-select"
                      value={form.jenisUsaha}
                      onChange={e => setForm(f => ({ ...f, jenisUsaha: e.target.value }))}
                    >
                      {["Kuliner / F&B", "Perdagangan", "Jasa", "Manufaktur kecil"].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="field-input-wrap field-readonly">
                      <input readOnly value={form.jenisUsaha} className="field-input" />
                    </div>
                  )}
                </div>
                <Field label="Tanggal Berdiri" value={form.berdiriSejak} onChange={setField("berdiriSejak")} type="date" readOnly={!editMode} />
              </div>
              <div className="field-wrap" style={{ marginTop: 4 }}>
                <label className="field-label">Deskripsi Usaha</label>
                <textarea
                  className={`field-textarea ${!editMode ? "field-readonly-ta" : ""}`}
                  value={form.deskripsi || ""}
                  onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                  readOnly={!editMode}
                  rows={3}
                />
              </div>
            </div>

            {/* Kontak & Lokasi */}
            <div className="fields-section">
              <p className="fields-group-label">Kontak & Lokasi</p>
              <div className="fields-grid">
                <Field label="Nomor Telepon" value={form.telepon} onChange={setField("telepon")} readOnly={!editMode} />
                <Field label="Email"         value={form.email}   onChange={setField("email")}   readOnly={!editMode} type="email" />
              </div>
              <Field label="Alamat Lengkap" value={form.alamat} onChange={setField("alamat")} readOnly={!editMode} />
              <div className="fields-grid fields-grid-3">
                <Field label="Kota"     value={form.kota}     onChange={setField("kota")}     readOnly={!editMode} />
                <Field label="Provinsi" value={form.provinsi} onChange={setField("provinsi")} readOnly={!editMode} />
                <Field label="Kode POS" value={form.kodePOS}  onChange={setField("kodePOS")}  readOnly={!editMode} />
              </div>
            </div>

            {/* Legalitas */}
            <div className="fields-section">
              <p className="fields-group-label">Legalitas (Opsional)</p>
              <div className="fields-grid">
                <Field label="NPWP"                      value={form.npwp} onChange={setField("npwp")} readOnly={!editMode} />
                <Field label="NIB (Nomor Induk Berusaha)" value={form.nib}  onChange={setField("nib")}  readOnly={!editMode} />
              </div>
              {!editMode && (
                <div className="legalitas-note">
                  <span>Data legalitas tersimpan terenkripsi dan hanya digunakan untuk keperluan laporan resmi.</span>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}