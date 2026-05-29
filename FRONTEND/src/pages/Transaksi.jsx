import { useState, useMemo } from "react";
import "../css/Transaksi.css"

// ─── Dummy Data ───────────────────────────────────────────────
const DUMMY_TRANSACTIONS = [
  { id: 1, tanggal: "2024-10-29", keterangan: "Penjualan harian", kategori: "Penjualan Produk", jenis: "pemasukan", jumlah: 4200000, metode: "QRIS" },
  { id: 2, tanggal: "2024-10-28", keterangan: "Beli bahan baku tepung", kategori: "Bahan Baku", jenis: "pengeluaran", jumlah: 1500000, metode: "Transfer Bank" },
  { id: 3, tanggal: "2024-10-27", keterangan: "Gaji karyawan bulan ini", kategori: "Gaji Karyawan", jenis: "pengeluaran", jumlah: 4500000, metode: "Transfer Bank" },
  { id: 4, tanggal: "2024-10-26", keterangan: "Penjualan grosir", kategori: "Penjualan Produk", jenis: "pemasukan", jumlah: 12000000, metode: "Transfer Bank" },
  { id: 5, tanggal: "2024-10-25", keterangan: "Bayar sewa tempat", kategori: "Sewa Tempat", jenis: "pengeluaran", jumlah: 2000000, metode: "Transfer Bank" },
  { id: 6, tanggal: "2024-10-24", keterangan: "Penjualan harian", kategori: "Penjualan Produk", jenis: "pemasukan", jumlah: 3800000, metode: "Tunai" },
  { id: 7, tanggal: "2024-10-23", keterangan: "Beli kemasan produk", kategori: "Bahan Baku", jenis: "pengeluaran", jumlah: 750000, metode: "Tunai" },
  { id: 8, tanggal: "2024-10-22", keterangan: "Bayar tagihan listrik", kategori: "Listrik & Air", jenis: "pengeluaran", jumlah: 450000, metode: "Transfer Bank" },
  { id: 9, tanggal: "2024-10-21", keterangan: "Penjualan online", kategori: "Penjualan Produk", jenis: "pemasukan", jumlah: 5600000, metode: "QRIS" },
  { id: 10, tanggal: "2024-10-20", keterangan: "Beli bahan baku gula", kategori: "Bahan Baku", jenis: "pengeluaran", jumlah: 900000, metode: "Tunai" },
];

const KATEGORI_PEMASUKAN  = ["Penjualan Produk", "Jasa Layanan", "Lain-lain"];
const KATEGORI_PENGELUARAN = ["Bahan Baku", "Gaji Karyawan", "Sewa Tempat", "Listrik & Air", "Operasional", "Lain-lain"];
const METODE_BAYAR        = ["Transfer Bank", "Tunai", "QRIS", "Debit/Kartu Kredit"];

// ─── Helpers ──────────────────────────────────────────────────
const formatRp = (n) => "Rp " + n.toLocaleString("id-ID");

const formatTanggal = (str) =>
  new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const toNumber = (str) => parseInt(String(str).replace(/\D/g, ""), 10) || 0;
const toDisplay = (str) => {
  const n = toNumber(str);
  return n ? n.toLocaleString("id-ID") : "";
};

// ─── Icon SVGs ────────────────────────────────────────────────
const IconDownload = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, sub, valueClass }) {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className={`stat-card__value ${valueClass ?? ""}`}>{value}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
    </div>
  );
}

// ─── Modal Tambah / Edit ──────────────────────────────────────
function TransaksiModal({ onClose, onSave, editData }) {
  const isEdit = !!editData;
  const [form, setForm] = useState(
    editData ?? {
      jenis: "pemasukan",
      jumlah: "",
      tanggal: new Date().toISOString().split("T")[0],
      kategori: KATEGORI_PEMASUKAN[0],
      metode: METODE_BAYAR[0],
      keterangan: "",
    }
  );

  const set = (k, v) =>
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "jenis")
        next.kategori = v === "pemasukan" ? KATEGORI_PEMASUKAN[0] : KATEGORI_PENGELUARAN[0];
      return next;
    });

  const handleSubmit = () => {
    if (!form.jumlah || !form.tanggal || !form.keterangan.trim()) {
      alert("Harap isi semua kolom yang wajib (*).");
      return;
    }
    onSave({ ...form, jumlah: toNumber(form.jumlah) });
  };

  const kategoriList = form.jenis === "pemasukan" ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-header__title">
            {isEdit ? "Edit Transaksi" : "Tambah Transaksi Baru"}
          </h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Toggle Jenis */}
        <div className="jenis-toggle">
          {["pemasukan", "pengeluaran"].map((j) => (
            <button
              key={j}
              className={`jenis-toggle__btn ${form.jenis === j ? "jenis-toggle__btn--active" : ""}`}
              onClick={() => set("jenis", j)}
            >
              {j.charAt(0).toUpperCase() + j.slice(1)}
            </button>
          ))}
        </div>

        {/* Row 1 */}
        <div className="form-grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label>Jumlah (Rp) *</label>
            <input
              type="text"
              placeholder="5.000.000"
              value={toDisplay(form.jumlah)}
              onChange={(e) => set("jumlah", e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Tanggal *</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => set("tanggal", e.target.value)}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="form-grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label>Kategori</label>
            <select value={form.kategori} onChange={(e) => set("kategori", e.target.value)}>
              {kategoriList.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Metode Pembayaran</label>
            <select value={form.metode} onChange={(e) => set("metode", e.target.value)}>
              {METODE_BAYAR.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Keterangan */}
        <div className="form-group">
          <label>Keterangan *</label>
          <textarea
            placeholder="Contoh: Penjualan harian sabtu sore"
            value={form.keterangan}
            onChange={(e) => set("keterangan", e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Batal</button>
          <button className="btn-save" onClick={handleSubmit}>
            {isEdit ? "Simpan Perubahan" : "Simpan Transaksi"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Transaksi ────────────────────────────────────────
export default function Transaksi() {
  const [transactions, setTransactions] = useState(DUMMY_TRANSACTIONS);
  const [showModal, setShowModal]       = useState(false);
  const [editData, setEditData]         = useState(null);
  const [search, setSearch]             = useState("");
  const [filterJenis, setFilterJenis]   = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");

  // Statistik
  const totalPemasukan   = transactions.filter((t) => t.jenis === "pemasukan").reduce((s, t) => s + t.jumlah, 0);
  const totalPengeluaran = transactions.filter((t) => t.jenis === "pengeluaran").reduce((s, t) => s + t.jumlah, 0);

  // Filter
  const allKategori = ["Semua", ...new Set(transactions.map((t) => t.kategori))];
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const q = search.toLowerCase();
      const matchSearch = t.keterangan.toLowerCase().includes(q) || t.kategori.toLowerCase().includes(q);
      const matchJenis  = filterJenis === "Semua" || t.jenis === filterJenis;
      const matchKat    = filterKategori === "Semua" || t.kategori === filterKategori;
      return matchSearch && matchJenis && matchKat;
    });
  }, [transactions, search, filterJenis, filterKategori]);

  const openAdd  = () => { setEditData(null); setShowModal(true); };
  const openEdit = (t) => { setEditData(t);   setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditData(null); };

  const handleSave = (data) => {
    setTransactions((prev) =>
      data.id
        ? prev.map((t) => (t.id === data.id ? data : t))
        : [{ ...data, id: Date.now() }, ...prev]
    );
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Hapus transaksi ini?"))
      setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="transaksi-page">
      {/* Header */}
      <div className="transaksi-header">
        <div>
          <h1 className="transaksi-header__title">Transaksi</h1>
          <p className="transaksi-header__sub">Catat &amp; kelola semua pemasukan dan pengeluaran</p>
        </div>
        <div className="transaksi-header__actions">
          <button className="btn-outline">
            <IconDownload /> Export CSV
          </button>
          <button className="btn-primary" onClick={openAdd}>
            + Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard label="Pemasukan Bulan Ini" value={formatRp(totalPemasukan)} sub="Oktober 2024" valueClass="stat-card__value--green" />
        <StatCard label="Pengeluaran Bulan Ini" value={formatRp(totalPengeluaran)} sub="Oktober 2024" valueClass="stat-card__value--red" />
        <StatCard label="Total Transaksi" value={`${transactions.length} transaksi`} sub="Oktober 2024" />
      </div>

      {/* Table Card */}
      <div className="table-card">
        {/* Table Header */}
        <div className="table-card__header">
          <span className="table-card__title">Riwayat Transaksi</span>
          <div className="table-card__controls">
            {/* Search */}
            <div className="search-wrap">
              <span className="search-wrap__icon"><IconSearch /></span>
              <input
                type="text"
                className="search-input"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {/* Filter Jenis */}
            <select
              className="filter-select"
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
            >
              <option value="Semua">Semua Jenis</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
            {/* Filter Kategori */}
            <select
              className="filter-select"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
            >
              {allKategori.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Kategori</th>
                <th>Metode</th>
                <th>Jenis</th>
                <th className="align-right">Jumlah</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">Tidak ada transaksi yang cocok.</td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: "#6b7280" }}>{formatTanggal(t.tanggal)}</td>
                    <td>{t.keterangan}</td>
                    <td><span className="cat-tag">{t.kategori}</span></td>
                    <td style={{ color: "#6b7280" }}>{t.metode}</td>
                    <td>
                      <span className={`badge ${t.jenis === "pemasukan" ? "badge--in" : "badge--out"}`}>
                        {t.jenis === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className={`align-right ${t.jenis === "pemasukan" ? "amount--in" : "amount--out"}`}>
                      {t.jenis === "pemasukan" ? "+" : "−"} {formatRp(t.jumlah)}
                    </td>
                    <td className="align-center">
                      <div className="action-btns">
                        <button className="action-btn action-btn--edit" title="Edit" onClick={() => openEdit(t)}>
                          <IconEdit />
                        </button>
                        <button className="action-btn action-btn--delete" title="Hapus" onClick={() => handleDelete(t.id)}>
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="table-footer">
          <span className="table-footer__text">
            Menampilkan {filtered.length} dari {transactions.length} transaksi
          </span>
          <span className="table-footer__text">Oktober 2024</span>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <TransaksiModal onClose={closeModal} onSave={handleSave} editData={editData} />
      )}
    </div>
  );
}
