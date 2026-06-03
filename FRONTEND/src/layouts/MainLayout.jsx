import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import "../css/MainLayout.css";

const menuItems = [
  {
    id: "beranda",
    label: "Beranda",
    path: "/dashboard",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "transaksi",
    label: "Transaksi",
    path: "/transaksi",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "ai-insights",
    label: "AI Insights",
    path: "/ai-insights",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    id: "laporan",
    label: "Laporan",
    path: "/laporan",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "Forecast",
    label: "Forecast",
    path: "/forecast",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "Profile",
    path: "/profile",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function MainLayout() {
  const navigate = useNavigate();

  // State disesuaikan dengan field di Profile.jsx
  const [profileData, setProfileData] = useState({
    pemilik: "Memuat...",
    namaToko: "...",
    logoToko: "" 
  });

  // Fetch data dari endpoint yang sama dengan Profile.jsx
    const fetchSidebarProfile = async () => {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token"); // Ambil token untuk autentikasi
    if (!userId) return;

    try {
      // 1. Ubah ke URL Vercel Backend & 2. Tambahkan headers token
      const response = await fetch(`https://fullstack-backend-capstone.vercel.app/api/profile/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Ambil nama pemilik, jika kosong fallback ke "Admin"
        const fetchedPemilik = data.pemilik || "Admin";
        const fetchedToko = data.namaToko || "Toko Anda";
        
        // Buat inisial otomatis 
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fetchedPemilik)}&background=2563eb&color=fff`;
        const fetchedLogo = data.logoToko || defaultAvatar;

        setProfileData({
          pemilik: fetchedPemilik,
          namaToko: fetchedToko,
          logoToko: fetchedLogo
        });
      }
    } catch (error) {
      console.error("Gagal sinkronisasi sidebar dengan database:", error);
    }
  };

  useEffect(() => {
    // Panggil saat pertama kali layout dimuat
    fetchSidebarProfile();

    // Listener khusus agar sidebar langsung berubah ketika profil di-save!
    window.addEventListener("profileUpdated", fetchSidebarProfile);
    return () => window.removeEventListener("profileUpdated", fetchSidebarProfile);
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar?");
    if (confirmLogout) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  return (
    <div className="layout-wrapper">
      <aside className="sidebar">
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <img src={profileData.logoToko} alt="avatar" />
          </div>
          <div className="profile-info">
            <span className="profile-name">{profileData.pemilik}</span>
            <span className="profile-plan">{profileData.namaToko} Admin</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button 
            className="btn-tambah-transaksi"
            onClick={() => navigate("/transaksi")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Tambah Transaksi
          </button>

          <div className="sidebar-footer-links">
            <button className="footer-link" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}