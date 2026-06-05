# FULLSTACK: Aplikasi Manajemen & Prediksi Arus Kas UMKM Terintegrasi AI

Aplikasi *fullstack* berbasis web yang dirancang khusus untuk membantu pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) dalam mencatat transaksi keuangan secara *real-time* sekaligus memprediksi arus kas (cashflow) masa depan menggunakan model *Deep Learning* (GRU - Gated Recurrent Unit).

🌐 **Live Demo Frontend:** [DanaUMKM](https://danaumkm.vercel.app/)

---

## ✨ Fitur Utama
1. **Pencatatan Keuangan (CRUD):** Tambah, baca, dan hapus riwayat pemasukan serta pengeluaran usaha.
2. **Laporan & Analisis:** Visualisasi grafik laba/rugi, rasio kesehatan keuangan (Profit Margin, Likuiditas), dan perhitungan otomatis.
3. **AI Cashflow Forecast:** Prediksi saldo kas 30, 60, hingga 90 hari ke depan menggunakan model kecerdasan buatan (GRU).
4. **AI Insights & Analysis:** Rekomendasi tindakan otomatis berdasarkan tren keuangan bisnis.
5. **Ekspor PDF:** Unduh laporan keuangan dan hasil prediksi AI ke dalam format PDF yang rapi.
6. **Autentikasi Aman:** Sistem Login/Register terenkripsi menggunakan JWT (JSON Web Tokens).

---

## 🛠️ Tech Stack
Proyek ini dibangun menggunakan arsitektur *microservices* dengan teknologi berikut:

* **Frontend:** React.js (Vite), Custom CSS (Responsive), html2pdf.js.
* **Backend (API):** Node.js, Express.js, Express Validator.
* **Deployment:** Vercel

---

## 💻 Panduan Instalasi (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda.

### Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal perangkat lunak berikut:
* [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
* [Git](https://git-scm.com/)

### 1. Clone Repositori
```bash
git clone [https://github.com/Username-GitHub-Kamu/Nama-Repo-Kamu.git](https://github.com/Username-GitHub-Kamu/Nama-Repo-Kamu.git)
cd Nama-Repo-Kamu
