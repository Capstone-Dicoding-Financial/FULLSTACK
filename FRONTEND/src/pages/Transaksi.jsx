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

function StatCard({ label, value, sub, valueClass }) {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className={`stat-card__value ${valueClass ?? ""}`}>{value}</p>
      {sub && <p className="stat-card__sub">{sub}</p>}
    </div>
  );
}

function TransaksiModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    type: "INCOME",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: KATEGORI_PEMASUKAN[0],
    description: "",
  });

  const setField = (k, v) =>
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "type")
        next.category = v === "INCOME" ? KATEGORI_PEMASUKAN[0] : KATEGORI_PENGELUARAN[0];
      return next;
    });

  const handleSubmit = () => {
    if (!form.amount || !form.date || !form.description.trim()) {
      alert("Harap isi semua kolom yang wajib (*).");
      return;
    }
    onSave({ ...form, amount: toNumber(form.amount) });
  };

  const kategoriList = form.type === "INCOME" ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-header__title">Tambah Transaksi Baru</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="jenis-toggle">
          {[
            { key: "INCOME", label: "Pemasukan" },
            { key: "EXPENSE", label: "Pengeluaran" },
          ].map((j) => (
            <button
              key={j.key}
              className={`jenis-toggle__btn ${form.type === j.key ? "jenis-toggle__btn--active" : ""}`}
              onClick={() => setField("type", j.key)}
            >
              {j.label}
            </button>
          ))}
        </div>

        <div className="form-grid-2">
          <div className="form-group" style={{ margin: 0 }}>
            <label>Jumlah (Rp) *</label>
            <input
              type="text"
              placeholder="5.000.000"
              value={toDisplay(form.amount)}
              onChange={(e) => setField("amount", e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Tanggal *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Kategori</label>
          <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
            {kategoriList.map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>Keterangan *</label>
          <textarea
            placeholder="Contoh: Penjualan harian silky pudding rasa cokelat"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Batal</button>
          <button className="btn-save" onClick={handleSubmit}>Simpan Transaksi</button>
        </div>
      </div>
    </div>
  );
}

export default function Transaksi() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal]       = useState(false);
  const [search, setSearch]             = useState("");
  const [filterJenis, setFilterJenis]   = useState("Semua");
  const [filterKategori, setFilterKategori] = useState("Semua");
  
  // 🟢 1. State Baru untuk Pagination
  const [currentPage, setCurrentPage]   = useState(1);
  const ITEMS_PER_PAGE = 10; // Silakan ganti jadi 15 jika dirasa kurang banyak

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://fullstack-backend-capstone.vercel.app/api/transactions", {
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Gagal mengambil data transaksi");

      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJenis, filterKategori]);

  const totalPemasukan   = transactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalPengeluaran = transactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
  const allKategori = ["Semua", ...new Set(transactions.map((t) => t.category))];

  const filtered = useMemo(() => {
  return [...transactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  }).filter((t) => {
    return t.description.toLowerCase().includes(searchTerm.toLowerCase());
  });
}, [transactions, searchTerm]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert("Tidak ada data transaksi yang bisa diekspor.");
      return;
    }

    const headers = ["Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah (Rp)"];
    
    const rows = filtered.map((t) => [
      t.date ? new Date(t.date).toISOString().split("T")[0] : "-",
      `"${(t.description || "").replace(/"/g, '""')}"`,
      t.category,
      t.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
      t.amount,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Transaksi_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async (payload) => {
    try {
      const response = await fetch("https://fullstack-backend-capstone.vercel.app/api/transactions", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menambahkan transaksi");

      fetchTransactions();
      setShowModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) return;

    try {
      const response = await fetch(`https://fullstack-backend-capstone.vercel.app/api/transactions/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menghapus transaksi");

      fetchTransactions();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading && transactions.length === 0) return <div className="loading-state" style={{ padding: "40px", textAlign: "center" }}>Memuat data transaksi...</div>;
  if (error) return <div className="error-state" style={{ padding: "40px", color: "red", textAlign: "center" }}>⚠️ Error: {error}</div>;

  const startNumber = filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endNumber = Math.min(currentPage * ITEMS_PER_PAGE, filtered.length);

  return (
    <div className="transaksi-page">
      <div className="transaksi-header">
        <div>
          <h1 className="transaksi-header__title">Transaksi</h1>
          <p className="transaksi-header__sub">Catat &amp; kelola semua pemasukan dan pengeluaran</p>
        </div>
        <div className="transaksi-header__actions">
          <button className="btn-outline" onClick={handleExportCSV}>Export CSV</button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + Tambah Transaksi
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard label="Pemasukan" value={formatRp(totalPemasukan)} sub="Total Akumulasi" valueClass="stat-card__value--green" />
        <StatCard label="Pengeluaran" value={formatRp(totalPengeluaran)} sub="Total Akumulasi" valueClass="stat-card__value--red" />
        <StatCard label="Sisa Saldo" value={formatRp(totalPemasukan - totalPengeluaran)} sub="Arus Kas Bersih" valueClass={(totalPemasukan - totalPengeluaran) >= 0 ? "stat-card__value--green" : "stat-card__value--red"} />
      </div>

      <div className="table-card">
        <div className="table-card__header">
          <span className="table-card__title">Riwayat Transaksi</span>
          <div className="table-card__controls">
            <div className="search-wrap">
              <input
                type="text"
                className="search-input"
                placeholder="Cari transaksi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
        
            <select className="filter-select" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)}>
              <option value="Semua">Semua Jenis</option>
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>

            <select className="filter-select" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
              {allKategori.map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Keterangan</th>
                <th>Kategori</th>
                <th>Jenis</th>
                <th className="align-right">Jumlah</th>
                <th className="align-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="table-empty">Tidak ada transaksi yang cocok.</td>
                </tr>
              ) : (
                // 🟢 4. Render Menggunakan Data Paginated
                paginatedTransactions.map((t) => (
                  <tr key={t.id}>
                    <td style={{ color: "#6b7280" }}>{formatTanggal(t.date)}</td>
                    <td>{t.description}</td>
                    <td><span className="cat-tag">{t.category}</span></td>
                    <td>
                      <span className={`badge ${t.type === "INCOME" ? "badge--in" : "badge--out"}`}>
                        {t.type === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                    </td>
                    <td className={`align-right ${t.type === "INCOME" ? "amount--in" : "amount--out"}`}>
                      {t.type === "INCOME" ? "+" : "−"} {formatRp(t.amount)}
                    </td>
                    <td className="align-center">
                      <button 
                        className="action-btn action-btn--delete" 
                        style={{ color: "#dc2626", border: "none", background: "none", cursor: "pointer", fontWeight: "500" }}
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

        {/* 🟢 5. Desain Footer & Tombol Navigasi Pagination */}
        <div className="table-footer">
          <span className="table-footer__text">
            Menampilkan {startNumber}–{endNumber} dari {filtered.length} transaksi
          </span>
          
          {totalPages > 1 && (
            <div className="pagination-controls">
              <button
                className="btn-outline pagination-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                &larr; Prev
              </button>
              
              <span className="pagination-text">
                Hal <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
              </span>

              <button
                className="btn-outline pagination-btn"
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