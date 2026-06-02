import { useState, useMemo, useEffect } from "react";
import "../css/Transaksi.css";

const KATEGORI_PEMASUKAN  = ["Penjualan Produk", "Jasa Layanan", "Lain-lain"];
const KATEGORI_PENGELUARAN = ["Bahan Baku", "Gaji Karyawan", "Sewa Tempat", "Listrik & Air", "Operasional", "Lain-lain"];

const formatRp = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

const formatTanggal = (str) => {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const toNumber = (str) => parseInt(String(str).replace(/\D/g, ""), 10) || 0;
const toDisplay = (str) => {
  const n = toNumber(str);
  return n ? n.toLocaleString("id-ID") : "";
};

// ── KOMPONEN UTILITAS KARTU (STAT CARD LAMA) ─────────────────────────────────
function StatCard({ label, value, sub, valueClass }) {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className={`stat-card__value ${valueClass ?? ""}`}>{value}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
    </div>
  );
}

// ── KOMPONEN MODAL INPUT (SESUAI STYLE FORM & MODAL LAMA) ──────────────────────
function TransaksiModal({ onClose, onSave }) {
  const [type, setType] = useState("INCOME");
  const [amountRaw, setAmountRaw] = useState("");
  const [category, setCategory] = useState(KATEGORI_PEMASUKAN[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

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
        <div className="modal-header">
          <h3 className="modal-header__title">Tambah Transaksi Baru</h3>
          <button className="modal-close" type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Jenis Transaksi</label>
            <div className="radio-group" style={{ display: "flex", gap: "16px", marginTop: "4px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="type"
                  checked={type === "INCOME"}
                  onChange={() => handleTypeChange("INCOME")}
                />
                Pemasukan
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="type"
                  checked={type === "EXPENSE"}
                  onChange={() => handleTypeChange("EXPENSE")}
                />
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
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Keterangan / Deskripsi</label>
            <textarea
              rows="3"
              placeholder="Catatan tambahan (opsional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Batal</button>
            <button type="submit" className="btn-save">Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MAIN LAYER HALAMAN TRANSAKSI ─────────────────────────────────────────────
export default function Transaksi() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterType, setFilterType] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // 1. Ambil Data dari Backend
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/transactions", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal mengambil data transaksi");

      // Menyesuaikan kiriman .data backend kita
      setTransactions(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 2. Simpan Transaksi Baru
  const handleSave = async (payload) => {
    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal menyimpan transaksi");

      setShowModal(false);
      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  // 3. Hapus Transaksi
  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal menghapus transaksi");

      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. Kalkulasi Data Kartu Ringkasan Atas
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach((t) => {
      if (t.type === "INCOME") income += t.amount;
      else if (t.type === "EXPENSE") expense += t.amount;
    });
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    };
  }, [transactions]);

  // 5. Fitur Search & Tab Filter Jenis Transaksi
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = filterType === "ALL" || t.type === filterType;
      const cleanQuery = searchQuery.toLowerCase();
      const matchesSearch =
        (t.category || "").toLowerCase().includes(cleanQuery) ||
        (t.description || "").toLowerCase().includes(cleanQuery);
      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  // 6. Logika Lembar Pagination Tabel
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const startNumber = filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endNumber = Math.min(currentPage * itemsPerPage, filtered.length);

  if (loading) return <div style={{ padding: "24px", color: "#6b7280" }}>Mendata riwayat finansial...</div>;
  if (error) return <div style={{ padding: "24px", color: "#ef4444", fontWeight: "bold" }}>Error: {error}</div>;

  return (
    <div className="transaksi-page">
      
      {/* 🔴 HEADER UTAMA (Sesuai Transaksi.css Lama) */}
      <div className="transaksi-header">
        <div>
          <h1 className="transaksi-header__title">Transaksi</h1>
          <p className="transaksi-header__sub">Catat & kelola semua pemasukan dan pengeluaran</p>
        </div>
        <div className="transaksi-header__actions">
          <button className="btn-outline" onClick={() => {}}>Export CSV</button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Tambah Transaksi
          </button>
        </div>
      </div>

      {/* 🔴 STAT ROW RINGKASAN (Sesuai Transaksi.css Lama) */}
      <div className="stat-grid">
        <StatCard
          label="Total Pemasukan"
          value={formatRp(stats.totalIncome)}
          sub={`${transactions.filter((t) => t.type === "INCOME").length} item masuk`}
          valueClass="stat-card__value--green"
        />
        <StatCard
          label="Total Pengeluaran"
          value={formatRp(stats.totalExpense)}
          sub={`${transactions.filter((t) => t.type === "EXPENSE").length} pengeluaran`}
          valueClass="stat-card__value--red"
        />
        <StatCard
          label="Sisa Saldo Kas"
          value={formatRp(stats.balance)}
          sub="Sisa dana bersih"
          valueClass={stats.balance >= 0 ? "stat-card__value--green" : "stat-card__value--red"}
        />
      </div>

      {/* 🔴 BLOK FILTER TABS DAN SEARCH BAR */}
      <div className="table-card">
        <div className="table-card__header">
          <span className="table-card__title">Riwayat Transaksi</span>
          <div className="table-card__controls">
            <div className="search-wrap">
              <svg className="search-wrap__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                placeholder="Cari transaksi..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="filter-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="ALL">Semua Jenis</option>
              <option value="INCOME">Pemasukan</option>
              <option value="EXPENSE">Pengeluaran</option>
            </select>
          </div>
        </div>

        {/* 🔴 TABEL DATA UTAMA (Sesuai Transaksi.css Lama) */}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jenis</th>
                <th>Kategori</th>
                <th>Keterangan</th>
                <th style={{ textAlign: "right" }}>Nominal</th>
                <th style={{ textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty" style={{ textAlign: "center", padding: "32px", color: "#94a3b8" }}>
                    Tidak ada transaksi yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedData.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium text-slate-700">{formatTanggal(t.date)}</td>
                    <td>
                      <span className={`badge ${t.type === "INCOME" ? "badge--in" : "badge--out"}`}>
                        {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className="text-slate-600 font-medium">{t.category}</td>
                    <td className="text-slate-400 max-w-xs truncate" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {t.description || "-"}
                    </td>
                    <td className={t.type === "INCOME" ? "amount--in" : "amount--out"} style={{ fontWeight: "700", textAlign: "right" }}>
                      {t.type === "INCOME" ? "+ " : "- "} {formatRp(t.amount)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <button
                        className="btn-delete"
                        style={{ padding: "4px 10px", background: "#fef2f2", color: "#ef4444", border: "0.5px solid #fee2e2", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
                        onClick={() => handleDelete(t.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🔴 FOOTER PAGINATION BAWAH (Sesuai Transaksi.css Lama) */}
        <div className="table-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", fontSize: "13px", color: "#6b7280" }}>
          <span className="table-footer__text">
            Menampilkan {startNumber}–{endNumber} dari {filtered.length} transaksi
          </span>
          
          {totalPages > 1 && (
            <div className="pagination-controls" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                className="btn-outline"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                &larr; Prev
              </button>
              
              <span className="pagination-text">
                Hal <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
              </span>

              <button
                className="btn-outline"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </div>

      </div>

      {showModal && (
        <TransaksiModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}