import { useState, useMemo, useEffect } from "react";
import "../css/Transaksi.css";

const apiBaseUrl = import.meta.env.VITE_API_URL || "https://fullstack-backend-capstone.vercel.app";

const KATEGORI_PEMASUKAN   = ["Penjualan Produk", "Jasa Layanan", "Lain-lain"];
const KATEGORI_PENGELUARAN = ["Bahan Baku", "Gaji Karyawan", "Sewa Tempat", "Listrik & Air", "Operasional", "Lain-lain"];

const formatRp = (n) => "Rp " + (n || 0).toLocaleString("id-ID");
const formatTanggal = (str) => {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};
const toNumber  = (str) => parseInt(String(str).replace(/\D/g, ""), 10) || 0;
const toDisplay = (str) => { const n = toNumber(str); return n ? n.toLocaleString("id-ID") : ""; };

/* ── StatCard ──────────────────────────────────────────────── */
function StatCard({ label, value, sub, valueClass }) {
  return (
    <div className="stat-card">
      <div className="stat-card__info">
        <p className="stat-card__label">{label}</p>
        <p className={`stat-card__value ${valueClass ?? ""}`}>{value}</p>
        {sub && <p className="stat-card__sub">{sub}</p>}
      </div>
    </div>
  );
}

/* ── TransaksiModal ────────────────────────────────────────── */
function TransaksiModal({ onClose, onSave }) {
  const [type, setType]             = useState("INCOME");
  const [amountRaw, setAmountRaw]   = useState("");
  const [category, setCategory]     = useState(KATEGORI_PEMASUKAN[0]);
  const [description, setDescription] = useState("");
  const [date, setDate]             = useState(new Date().toISOString().split("T")[0]);

  const handleTypeChange = (t) => {
    setType(t);
    setCategory(t === "INCOME" ? KATEGORI_PEMASUKAN[0] : KATEGORI_PENGELUARAN[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanAmount = toNumber(amountRaw);
    if (!cleanAmount) return alert("Masukkan nominal transaksi!");
    onSave({ type, amount: cleanAmount, category, description, date });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3 className="modal-title">Tambah Transaksi Baru</h3>
        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Jenis Transaksi</label>
            <div className="radio-group">
              <label>
                <input type="radio" name="type" checked={type === "INCOME"} onChange={() => handleTypeChange("INCOME")} />
                Pemasukan
              </label>
              <label>
                <input type="radio" name="type" checked={type === "EXPENSE"} onChange={() => handleTypeChange("EXPENSE")} />
                Pengeluaran
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Nominal (Rp)</label>
            <input
              type="text"
              placeholder="Contoh: 50.000"
              value={amountRaw}
              onChange={(e) => setAmountRaw(toDisplay(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label>Kategori</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {(type === "INCOME" ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tanggal</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Keterangan / Deskripsi</label>
            <textarea rows="3" placeholder="Catatan tambahan (opsional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-primary-custom">Simpan</button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────── */
export default function Transaksi() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [filterType, setFilterType]     = useState("ALL");
  const [searchQuery, setSearchQuery]   = useState("");
  const [currentPage, setCurrentPage]   = useState(1);
  const [showModal, setShowModal]       = useState(false);
  const itemsPerPage = 10;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/transactions`, { headers: getAuthHeaders() });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengambil data transaksi");
      setTransactions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTransactions(); }, []);

  const handleSave = async (payload) => {
    try {
      const response = await fetch(`${apiBaseUrl}/api/transactions`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan transaksi");
      setShowModal(false);
      fetchTransactions();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    try {
      const response = await fetch(`${apiBaseUrl}/api/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus transaksi");
      fetchTransactions();
    } catch (err) { alert(err.message); }
  };

  const stats = useMemo(() => {
    let income = 0, expense = 0;
    transactions.forEach((t) => {
      if (t.type === "INCOME") income += t.amount;
      else if (t.type === "EXPENSE") expense += t.amount;
    });
    return { totalIncome: income, totalExpense: expense, balance: income - expense };
  }, [transactions]);

  const filtered = useMemo(() => transactions.filter((t) => {
    const matchesType   = filterType === "ALL" || t.type === filterType;
    const cleanQuery    = searchQuery.toLowerCase();
    const matchesSearch = (t.category || "").toLowerCase().includes(cleanQuery) ||
                          (t.description || "").toLowerCase().includes(cleanQuery);
    return matchesType && matchesSearch;
  }), [transactions, filterType, searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [filterType, searchQuery]);

  const totalPages    = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const startNumber = filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endNumber   = Math.min(currentPage * itemsPerPage, filtered.length);

  if (loading) return <div className="transaksi-page" style={{ color: "#6b7280" }}>Mendata riwayat finansial...</div>;
  if (error)   return <div className="transaksi-page" style={{ color: "#ef4444", fontWeight: "bold" }}>Error: {error}</div>;

  return (
    <div className="transaksi-page">

      {/* ── Header ── */}
      <div className="transaksi-header">
        <div>
          <h1 className="transaksi-header__title">Arus Keuangan</h1>
          <p className="transaksi-header__sub">Kelola seluruh riwayat pemasukan dan pengeluaran toko Anda di sini.</p>
        </div>
        <div className="transaksi-header__actions">
          <button className="btn-primary-custom" onClick={() => setShowModal(true)}>+ Tambah Transaksi</button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-row">
        <StatCard
          label="Total Pemasukan"
          value={formatRp(stats.totalIncome)}
          sub={`${transactions.filter((t) => t.type === "INCOME").length} item masuk`}
          valueClass="text-green"
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatRp(stats.totalExpense)}
          sub={`${transactions.filter((t) => t.type === "EXPENSE").length} pengeluaran`}
          valueClass="text-red"
        />
        <StatCard
          label="Sisa Saldo Kas"
          value={formatRp(stats.balance)}
          sub="Sisa dana bersih"
          valueClass={stats.balance >= 0 ? "text-blue" : "text-red"}
        />
      </div>

      {/* ── Table Card ── */}
      <div className="table-card">

        {/* Controls */}
        <div className="table-controls">
          <div className="filter-tabs">
            <button
              className={`btn-outline${filterType === "ALL" ? " active" : ""}`}
              style={{ background: filterType === "ALL" ? "#2d6ef7" : "", color: filterType === "ALL" ? "#fff" : "" }}
              onClick={() => setFilterType("ALL")}
            >
              Semua ({transactions.length})
            </button>
            <button
              className={`btn-outline${filterType === "INCOME" ? " active" : ""}`}
              style={{ background: filterType === "INCOME" ? "#10b981" : "", color: filterType === "INCOME" ? "#fff" : "" }}
              onClick={() => setFilterType("INCOME")}
            >
              Pemasukan
            </button>
            <button
              className={`btn-outline${filterType === "EXPENSE" ? " active" : ""}`}
              style={{ background: filterType === "EXPENSE" ? "#ef4444" : "", color: filterType === "EXPENSE" ? "#fff" : "" }}
              onClick={() => setFilterType("EXPENSE")}
            >
              Pengeluaran
            </button>
          </div>

          <div className="search-box">
            <input
              type="text"
              placeholder="Cari kategori atau keterangan..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th className="align-right">Nominal</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty">Tidak ada transaksi yang cocok.</td>
                </tr>
              ) : (
                paginatedData.map((t) => (
                  <tr key={t.id}>
                    <td>{formatTanggal(t.date)}</td>
                    <td>
                      <span className={`badge ${t.type === "INCOME" ? "badge-green" : "badge-red"}`}>
                        {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td className="cat-tag-cell">{t.description || "-"}</td>
                    <td className={`table-amount ${t.type === "INCOME" ? "text-green" : "text-red"}`}>
                      {t.type === "INCOME" ? "+ " : "- "}{formatRp(t.amount)}
                    </td>
                    <td className="align-center">
                      <button className="btn-delete" onClick={() => handleDelete(t.id)}>Hapus</button>
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
            Menampilkan {startNumber}–{endNumber} dari {filtered.length} transaksi
          </span>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="btn-outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                ← Prev
              </button>
              <span className="pagination-text">
                Hal <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
              </span>
              <button
                className="btn-outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Next →
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ── Modal ── */}
      {showModal && (
        <TransaksiModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

    </div>
  );
}