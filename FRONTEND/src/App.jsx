import { BrowserRouter, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AiInsights from "./pages/AiInsights.jsx";
import Laporan from "./pages/Laporan.jsx";
import Transaksi from "./pages/Transaksi.jsx";
import Forecast from "./pages/Forecast.jsx";
import Profile from "./pages/Profile.jsx";
import ResetPassword from "./pages/resetpasswotrd.jsx";
import ForgotPassword from "./pages/forgotpassword.jsx";


import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman tanpa sidebar */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Halaman dengan sidebar */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai-insights" element={<AiInsights />} />

          {/* Tambahkan halaman lain di sini */}
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/transaksi" element={<Transaksi />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/profile" element={<Profile />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;