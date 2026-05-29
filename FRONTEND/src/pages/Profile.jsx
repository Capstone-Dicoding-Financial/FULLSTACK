import { useState } from "react";
import "../css/Profile.css";

// ── Icon helpers ────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  store:    "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  map:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  phone:    "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.09 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z",
  mail:     "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  calendar: "M3 6h18M16 2v4M8 2v4M3 6h18v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  lock:     "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  bell:     "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  check:    "M20 6L9 17l-5-5",
  camera:   "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  tag:      "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  trending: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  package:  "M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z",
  file:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
};

// ── StatCard kecil ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="prof-stat-card">
      <div className="prof-stat-icon" style={{ background: color + "18", color }}>
        <Icon d={icon} size={18} />
      </div>
      <div>
        <div className="prof-stat-value">{value}</div>
        <div className="prof-stat-label">{label}</div>
        {sub && <div className="prof-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ── Toggle switch ───────────────────────────────────────────────────────────
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

// ── Input field ─────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = "text", icon, readOnly }) {
  return (
    <div className="field-wrap">
      <label className="field-label">{label}</label>
      <div className={`field-input-wrap ${readOnly ? "field-readonly" : ""}`}>
        {icon && <span className="field-icon"><Icon d={icon} size={14} /></span>}
        <input
          type={type}
          value={value}
          onChange={e => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          className="field-input"
        />
      </div>
    </div>
  );
}

// ── Section header ──────────────────────────────────────────────────────────
function SectionHead({ icon, title, desc, action, onAction }) {
  return (
    <div className="section-head">
      <div className="section-head-left">
        <div className="section-head-icon"><Icon d={icon} size={15} /></div>
        <div>
          <h2 className="section-title">{title}</h2>
          {desc && <p className="section-desc">{desc}</p>}
        </div>
      </div>
      {action && (
        <button className="section-action" onClick={onAction}>{action}</button>
      )}
    </div>
  );
}

// ── MAIN ────────────────────────────────────────────────────────────────────
export default function ProfilUMKM() {
  const [editMode, setEditMode] = useState(false);
  const [saved, setSaved] = useState(false);

  // Form state
  const [form, setForm] = useState({
    namaToko:    "Warung Barokah Jaya",
    pemilik:     "Siti Rahayu",
    jenisUsaha:  "Kuliner / F&B",
    deskripsi:   "Usaha warung makan rumahan yang menyajikan masakan Padang dan makanan khas Bengkulu. Berdiri sejak 2019 dan melayani pelanggan setia di sekitar Kelurahan Lingkar Timur.",
    telepon:     "0812-3456-7890",
    email:       "sitibarokah@gmail.com",
    alamat:      "Jl. Hibrida Raya No. 12, Lingkar Timur",
    kota:        "Bengkulu",
    provinsi:    "Bengkulu",
    kodePOS:     "38229",
    berdiriSejak:"2019-03-15",
    npwp:        "12.345.678.9-001.000",
    nib:         "1234567890123",
  });

  // Notif state
  const [notif, setNotif] = useState({
    laporanHarian:   true,
    peringatanKas:   true,
    forecastUpdate:  true,
    promoTips:       false,
    ringkasanMingguan: true,
  });

  const setField = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    setEditMode(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const kategoriColors = {
    "Kuliner / F&B":   "#16a34a",
    "Perdagangan":     "#2563eb",
    "Jasa":            "#7c3aed",
    "Manufaktur kecil":"#d97706",
  };
  const katColor = kategoriColors[form.jenisUsaha] || "#2563eb";

  return (
    <div className="prof-page">

      {/* ── Top bar ── */}
      <div className="prof-topbar">
        <div>
          <h1 className="prof-title">Profil Usaha</h1>
          <p className="prof-sub">Kelola informasi dan pengaturan akun UMKM kamu.</p>
        </div>
        <div className="prof-topbar-right">
          {saved && (
            <span className="save-toast">
              <Icon d={icons.check} size={13} /> Perubahan disimpan
            </span>
          )}
          {editMode ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-ghost" onClick={() => setEditMode(false)}>Batal</button>
              <button className="btn-primary" onClick={handleSave}>
                <Icon d={icons.check} size={14} /> Simpan Perubahan
              </button>
            </div>
          ) : (
            <button className="btn-outline" onClick={() => setEditMode(true)}>
              <Icon d={icons.edit} size={14} /> Edit Profil
            </button>
          )}
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="prof-grid">

        {/* ── LEFT COLUMN ── */}
        <div className="prof-left">

          {/* Avatar Card */}
          <div className="prof-card card-avatar">
            <div className="avatar-wrap">
              <div className="avatar-circle">
                <span className="avatar-initials">SB</span>
              </div>
              {editMode && (
                <button className="avatar-edit-btn" title="Ganti foto">
                  <Icon d={icons.camera} size={14} />
                </button>
              )}
              <div className="avatar-online" />
            </div>

            <div className="avatar-info">
              <h2 className="avatar-name">{form.namaToko}</h2>
              <p className="avatar-owner">
                <Icon d={icons.users} size={13} />
                {form.pemilik}
              </p>
              <div className="avatar-tags">
                <span className="kat-badge" style={{ background: katColor + "15", color: katColor, borderColor: katColor + "30" }}>
                  <Icon d={icons.tag} size={11} /> {form.jenisUsaha}
                </span>
                <span className="status-badge">
                  <span className="status-dot" /> Aktif
                </span>
              </div>
            </div>

            <div className="avatar-meta">
              <div className="meta-row">
                <Icon d={icons.map} size={13} />
                <span>{form.kota}, {form.provinsi}</span>
              </div>
              <div className="meta-row">
                <Icon d={icons.calendar} size={13} />
                <span>Berdiri sejak {new Date(form.berdiriSejak).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}</span>
              </div>
              <div className="meta-row">
                <Icon d={icons.phone} size={13} />
                <span>{form.telepon}</span>
              </div>
              <div className="meta-row">
                <Icon d={icons.mail} size={13} />
                <span>{form.email}</span>
              </div>
            </div>

            <div className="avatar-divider" />
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="prof-right">

          {/* Informasi Usaha */}
          <div className="prof-card">
            <SectionHead
              icon={icons.store}
              title="Informasi Usaha"
              desc="Data identitas dan kontak usaha kamu"
            />
            <div className="fields-section">
              <p className="fields-group-label">Identitas Usaha</p>
              <div className="fields-grid">
                <Field label="Nama Toko / Usaha"  value={form.namaToko}   onChange={setField("namaToko")}   icon={icons.store}  readOnly={!editMode} />
                <Field label="Nama Pemilik"        value={form.pemilik}    onChange={setField("pemilik")}    icon={icons.users}  readOnly={!editMode} />
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
                      <span className="field-icon"><Icon d={icons.tag} size={14} /></span>
                      <input readOnly value={form.jenisUsaha} className="field-input" />
                    </div>
                  )}
                </div>
                <Field label="Tanggal Berdiri" value={form.berdiriSejak} onChange={setField("berdiriSejak")} type="date" icon={icons.calendar} readOnly={!editMode} />
              </div>

              <div className="field-wrap" style={{ marginTop: 4 }}>
                <label className="field-label">Deskripsi Usaha</label>
                <textarea
                  className={`field-textarea ${!editMode ? "field-readonly-ta" : ""}`}
                  value={form.deskripsi}
                  onChange={e => setForm(f => ({ ...f, deskripsi: e.target.value }))}
                  readOnly={!editMode}
                  rows={3}
                />
              </div>
            </div>

            <div className="fields-section">
              <p className="fields-group-label">Kontak & Lokasi</p>
              <div className="fields-grid">
                <Field label="Nomor Telepon" value={form.telepon}  onChange={setField("telepon")}  icon={icons.phone} readOnly={!editMode} />
                <Field label="Email"         value={form.email}    onChange={setField("email")}    icon={icons.mail}  readOnly={!editMode} type="email" />
              </div>
              <Field label="Alamat Lengkap" value={form.alamat} onChange={setField("alamat")} icon={icons.map} readOnly={!editMode} />
              <div className="fields-grid fields-grid-3">
                <Field label="Kota"     value={form.kota}     onChange={setField("kota")}     readOnly={!editMode} />
                <Field label="Provinsi" value={form.provinsi} onChange={setField("provinsi")} readOnly={!editMode} />
                <Field label="Kode POS" value={form.kodePOS}  onChange={setField("kodePOS")}  readOnly={!editMode} />
              </div>
            </div>

            <div className="fields-section">
              <p className="fields-group-label">Legalitas</p>
              <div className="fields-grid">
                <Field label="NPWP" value={form.npwp} onChange={setField("npwp")} icon={icons.shield} readOnly={!editMode} />
                <Field label="NIB (Nomor Induk Berusaha)" value={form.nib} onChange={setField("nib")} icon={icons.file} readOnly={!editMode} />
              </div>
              {!editMode && (
                <div className="legalitas-note">
                  <Icon d={icons.shield} size={13} />
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
